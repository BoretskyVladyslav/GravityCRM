import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { ProjectStatusBadge, ProjectStatusSelect, ProjectDialog } from '@/components/projects'
import { PaymentDialog } from '@/components/payments'
import { TaskItem, TaskDialog } from '@/components/tasks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  CheckSquare,
  CreditCard,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Plus,
} from 'lucide-react'
import type { Project, Payment, Task, CommunicationLog, Client } from '@/lib/types'

interface ProjectDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // 1. Fetch Project Details with Client
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      clients (*)
    `)
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (projectError || !projectData) {
    notFound()
  }

  const project: Project & { clients: Client | null } = projectData

  // 2. Fetch Linked Payments
  const { data: paymentsData } = await supabase
    .from('payments')
    .select('*')
    .eq('project_id', id)
    .eq('owner_id', user.id)
    .order('paid_at', { ascending: false })

  const payments: Payment[] = paymentsData || []

  // 3. Fetch Linked Tasks
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .eq('owner_id', user.id)
    .order('due_date', { ascending: true })

  const tasks: Task[] = tasksData || []

  // 4. Fetch Linked Communication Log
  const { data: commsData } = await supabase
    .from('communication_log')
    .select('*')
    .eq('project_id', id)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const communicationLogs: CommunicationLog[] = commsData || []

  // 5. Fetch all clients for the edit dialog
  const { data: allClients } = await supabase
    .from('clients')
    .select('id, full_name, company')
    .eq('owner_id', user.id)
    .order('full_name', { ascending: true })

  // 6. Compute Financials On-the-Fly
  const budget = Number(project.budget) || 0
  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const remainingBalance = Math.max(0, budget - totalPaid)
  const percentPaid = budget > 0 ? Math.min(100, Math.round((totalPaid / budget) * 100)) : 0

  const isCompleted = project.status === 'COMPLETED'
  const isOverdue =
    !isCompleted &&
    project.deadline &&
    new Date(project.deadline) < new Date(new Date().setHours(0, 0, 0, 0))

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> До списку проєктів
        </Link>

        <div className="flex items-center gap-3">
          <ProjectStatusSelect projectId={project.id} currentStatus={project.status} />
          <ProjectDialog
            project={project}
            clients={allClients || []}
            trigger={
              <Button variant="outline" size="sm" className="shadow-xs">
                Редагувати проєкт
              </Button>
            }
          />
        </div>
      </div>

      {/* Project Header Banner */}
      <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>

            {project.clients && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Клієнт:</span>
                <Link
                  href={`/clients/${project.clients.id}`}
                  className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{project.clients.full_name}</span>
                  {project.clients.company && (
                    <span className="text-muted-foreground">({project.clients.company})</span>
                  )}
                  <ExternalLink className="h-3 w-3 ml-0.5 opacity-60" />
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start sm:items-end text-xs text-muted-foreground gap-1.5">
            {project.start_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Старт: {project.start_date}
              </span>
            )}
            {project.deadline && (
              <span
                className={`flex items-center gap-1 font-medium ${
                  isOverdue ? 'text-destructive' : ''
                }`}
              >
                <Clock className="h-3.5 w-3.5" /> Дедлайн: {project.deadline}
                {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-destructive ml-1" />}
              </span>
            )}
            {project.completed_at && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Завершено:{' '}
                {new Date(project.completed_at).toLocaleDateString('uk-UA')}
              </span>
            )}
          </div>
        </div>

        {/* Short description */}
        {project.description && (
          <p className="text-sm text-muted-foreground pt-2 border-t border-border/40 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* Calculated Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Бюджет проєкту
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${budget.toFixed(2)}{' '}
              <span className="text-xs font-normal text-muted-foreground">
                {project.currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Фіксована договірна вартість
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Оплачено (Paid)
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ${totalPaid.toFixed(2)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
              <span>{percentPaid}% від бюджету</span>
              <span>{payments.filter((p) => p.status === 'PAID').length} транзакцій</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${percentPaid}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Залишок до сплати
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              ${remainingBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {remainingBalance === 0 && budget > 0
                ? '✓ Повністю оплачено'
                : 'Динамічний розрахунок на льоту'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Tasks, Payments, Communication, Notes */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="w-full justify-start p-1 bg-card border border-border/60 rounded-xl overflow-x-auto">
          <TabsTrigger value="tasks" className="gap-2 text-xs">
            <CheckSquare className="h-3.5 w-3.5" /> Задачі проєкту ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 text-xs">
            <CreditCard className="h-3.5 w-3.5" /> Платежі проєкту ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="comms" className="gap-2 text-xs">
            <MessageSquare className="h-3.5 w-3.5" /> Комунікація ({communicationLogs.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2 text-xs">
            <FileText className="h-3.5 w-3.5" /> Нотатки та ТЗ
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Tasks */}
        <TabsContent value="tasks" className="space-y-3">
          <div className="flex justify-end">
            <TaskDialog
              clients={allClients || []}
              projects={[{ id: project.id, client_id: project.client_id, title: project.title }]}
              defaultClientId={project.client_id}
              defaultProjectId={project.id}
              trigger={
                <Button size="sm" className="gap-1.5 shadow-xs">
                  <Plus className="h-4 w-4" /> Додати задачу
                </Button>
              }
            />
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={{
                    ...task,
                    clients: project.clients
                      ? {
                          id: project.clients.id,
                          full_name: project.clients.full_name,
                          company: project.clients.company,
                        }
                      : null,
                    projects: { id: project.id, title: project.title },
                  }}
                  showClient={false}
                  showProject={false}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60">
              <CardHeader className="text-center py-8">
                <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <CardTitle className="text-sm">Задач для цього проєкту поки немає</CardTitle>
                <CardDescription className="text-xs">
                  Створюйте операційні задачі та спринти для контролю термінів розробки.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Payments */}
        <TabsContent value="payments" className="space-y-3">
          <div className="flex justify-end">
            <PaymentDialog
              clients={allClients || []}
              projects={[{ id: project.id, client_id: project.client_id, title: project.title }]}
              defaultClientId={project.client_id}
              defaultProjectId={project.id}
              trigger={
                <Button size="sm" className="gap-1.5 shadow-xs">
                  <Plus className="h-4 w-4" /> Додати платіж
                </Button>
              }
            />
          </div>

          {payments.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="p-3 text-xs font-semibold text-muted-foreground border-b border-border/40 grid grid-cols-4">
                <span>Сума</span>
                <span>Статус</span>
                <span>Спосіб оплати</span>
                <span className="text-right">Дата проведення</span>
              </div>
              {payments.map((pay) => (
                <div
                  key={pay.id}
                  className="p-3 text-xs border-b border-border/20 last:border-0 grid grid-cols-4 items-center"
                >
                  <span className="font-bold text-sm">
                    ${Number(pay.amount).toFixed(2)} {pay.currency}
                  </span>
                  <span>
                    <Badge
                      variant="outline"
                      className={
                        pay.status === 'PAID'
                          ? 'border-emerald-500/30 text-emerald-400'
                          : 'border-amber-500/30 text-amber-400'
                      }
                    >
                      {pay.status}
                    </Badge>
                  </span>
                  <span className="text-muted-foreground">{pay.payment_method || '—'}</span>
                  <span className="text-right text-muted-foreground">
                    {pay.paid_at
                      ? new Date(pay.paid_at).toLocaleDateString('uk-UA')
                      : 'Очікується'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60">
              <CardHeader className="text-center py-8">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <CardTitle className="text-sm">Платежів ще не зафіксовано</CardTitle>
                <CardDescription className="text-xs">
                  Зафіксуйте передоплату або поетапну виплату за цим проєктом.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Tab 3: Communication Log */}
        <TabsContent value="comms" className="space-y-3">
          {communicationLogs.length > 0 ? (
            <div className="space-y-3">
              {communicationLogs.map((log) => {
                const isIncoming = log.direction === 'INCOMING'
                const formattedTime = new Date(log.created_at).toLocaleDateString('uk-UA', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-card border border-border/60 flex items-start gap-3.5"
                  >
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isIncoming
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {isIncoming ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">
                          {isIncoming ? 'Вхідне повідомлення' : 'Вихідна відповідь'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] py-0">
                            {log.channel}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">{formattedTime}</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {log.message}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60">
              <CardHeader className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <CardTitle className="text-sm">Історія комунікацій за цим проєктом порожня</CardTitle>
                <CardDescription className="text-xs">
                  Повідомлення, пов&apos;язані з цим проєктом, будуть з&apos;являтися тут.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Notes */}
        <TabsContent value="notes" className="space-y-3">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Технічні нотатки та посилання</CardTitle>
            </CardHeader>
            <CardContent>
              {project.notes ? (
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {project.notes}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Нотаток поки немає. Ви можете додати посилання на Figma, GitHub або доступи через &quot;Редагувати проєкт&quot;.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
