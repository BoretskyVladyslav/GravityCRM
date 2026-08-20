import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { ClientStatusBadge, ClientSourceBadge, ClientStatusSelect, ClientDialog } from '@/components/clients'
import { PaymentDialog } from '@/components/payments'
import { TaskItem, TaskDialog } from '@/components/tasks'
import { CommunicationTimeline } from '@/components/communication'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Send,
  Calendar,
  DollarSign,
  FolderKanban,
  MessageSquare,
  CheckSquare,
  CreditCard,
  FileText,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  AlertCircle,
} from 'lucide-react'
import type { Client, Project, Payment, Task, CommunicationLog } from '@/lib/types'

interface ClientDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // 1. Fetch Client Details
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // 2. Fetch Linked Projects
  const { data: projectsData } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', id)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const projects: Project[] = projectsData || []

  // 3. Fetch Linked Payments
  const { data: paymentsData } = await supabase
    .from('payments')
    .select('*')
    .eq('client_id', id)
    .eq('owner_id', user.id)
    .order('paid_at', { ascending: false })

  const payments: Payment[] = paymentsData || []

  // 4. Fetch Linked Tasks
  const { data: tasksData } = await supabase
    .from('tasks')
    .select('*')
    .eq('client_id', id)
    .eq('owner_id', user.id)
    .order('due_date', { ascending: true })

  const tasks: Task[] = tasksData || []

  // 5. Fetch Communication Log
  const { data: commsData } = await supabase
    .from('communication_log')
    .select(`
      *,
      projects (
        id,
        title
      )
    `)
    .eq('client_id', id)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const communicationLogs = commsData || []

  // 6. Compute Financials On-the-Fly
  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)
  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const totalOutstanding = Math.max(0, totalBudget - totalPaid)

  const formattedCreatedDate = new Date(client.created_at).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const formattedLastContact = client.last_contact_at
    ? new Date(client.last_contact_at).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Немає записів'

  return (
    <div className="space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> До списку клієнтів
        </Link>

        <div className="flex items-center gap-3">
          <ClientStatusSelect clientId={client.id} currentStatus={client.status} />
          <ClientDialog
            client={client}
            trigger={
              <Button variant="outline" size="sm" className="shadow-xs">
                Редагувати
              </Button>
            }
          />
        </div>
      </div>

      {/* Client Profile Header Banner */}
      <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-xl shrink-0 shadow-inner">
              {client.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">{client.full_name}</h1>
                <ClientStatusBadge status={client.status} />
                <ClientSourceBadge source={client.source} />
              </div>
              {client.company && (
                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" /> {client.company}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end text-xs text-muted-foreground gap-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Створено: {formattedCreatedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Останній контакт: {formattedLastContact}
            </span>
          </div>
        </div>

        {/* Contact Links Bar */}
        <div className="pt-3 border-t border-border/40 flex flex-wrap items-center gap-4 text-xs">
          {client.username && (
            <a
              href={`https://t.me/${client.username}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Send className="h-3.5 w-3.5" /> @{client.username}
            </a>
          )}

          {client.telegram_id && !client.username && (
            <span className="px-3 py-1.5 rounded-lg bg-muted/60 text-muted-foreground flex items-center gap-1.5 font-mono">
              <Send className="h-3.5 w-3.5" /> ID: {client.telegram_id}
            </span>
          )}

          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="px-3 py-1.5 rounded-lg bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" /> {client.email}
            </a>
          )}

          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="px-3 py-1.5 rounded-lg bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Phone className="h-3.5 w-3.5" /> {client.phone}
            </a>
          )}
        </div>
      </div>

      {/* Calculated Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Загальний бюджет проєктів
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Кількість проєктів: {projects.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Оплачено (Paid)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">${totalPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Зафіксованих платежів: {payments.filter((p) => p.status === 'PAID').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Залишок до оплати
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalOutstanding === 0 && totalBudget > 0
                ? '✓ Повністю розраховано'
                : 'Динамічний розрахунок на льоту'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Projects, Communication, Tasks, Payments, Notes */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList className="w-full justify-start p-1 bg-card border border-border/60 rounded-xl overflow-x-auto">
          <TabsTrigger value="projects" className="gap-2 text-xs">
            <FolderKanban className="h-3.5 w-3.5" /> Проєкти ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2 text-xs">
            <MessageSquare className="h-3.5 w-3.5" /> Таймлайн комунікації ({communicationLogs.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2 text-xs">
            <CheckSquare className="h-3.5 w-3.5" /> Задачі ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 text-xs">
            <CreditCard className="h-3.5 w-3.5" /> Платежі ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2 text-xs">
            <FileText className="h-3.5 w-3.5" /> Нотатки
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Projects */}
        <TabsContent value="projects" className="space-y-3">
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <Card key={proj.id} className="border-border/60 hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold">
                        <Link href={`/projects/${proj.id}`} className="hover:text-primary transition-colors">
                          {proj.title}
                        </Link>
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {proj.status}
                      </Badge>
                    </div>
                    {proj.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {proj.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0 text-xs text-muted-foreground flex items-center justify-between border-t border-border/30 pt-3">
                    <span className="font-semibold text-foreground">
                      ${Number(proj.budget).toFixed(2)} {proj.currency}
                    </span>
                    {proj.deadline && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Дедлайн: {proj.deadline}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60">
              <CardHeader className="text-center py-8">
                <FolderKanban className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <CardTitle className="text-sm">Немає створених проєктів</CardTitle>
                <CardDescription className="text-xs">
                  Проєкти для цього клієнта можна буде створювати в Phase 6.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Tab 2: Timeline (Communication Log) */}
        <TabsContent value="timeline" className="space-y-3">
          <CommunicationTimeline
            logs={communicationLogs}
            clientId={client.id}
            projects={projects.map((p) => ({ id: p.id, title: p.title }))}
          />
        </TabsContent>

        {/* Tab 3: Tasks */}
        <TabsContent value="tasks" className="space-y-3">
          <div className="flex justify-end">
            <TaskDialog
              clients={[{ id: client.id, full_name: client.full_name, company: client.company }]}
              projects={projects.map((p) => ({
                id: p.id,
                client_id: client.id,
                title: p.title,
              }))}
              defaultClientId={client.id}
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
                    clients: { id: client.id, full_name: client.full_name, company: client.company },
                  }}
                  showClient={false}
                  showProject={true}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60">
              <CardHeader className="text-center py-8">
                <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <CardTitle className="text-sm">Немає завдань</CardTitle>
                <CardDescription className="text-xs">
                  Створіть першу задачу для контролю домовленостей із клієнтом.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Tab 4: Payments */}
        <TabsContent value="payments" className="space-y-3">
          <div className="flex justify-end">
            <PaymentDialog
              clients={[{ id: client.id, full_name: client.full_name, company: client.company }]}
              projects={projects.map((p) => ({
                id: p.id,
                client_id: client.id,
                title: p.title,
              }))}
              defaultClientId={client.id}
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
                <span className="text-right">Дата</span>
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
                    {pay.paid_at ? new Date(pay.paid_at).toLocaleDateString('uk-UA') : 'Очікується'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2 border-border/60">
              <CardHeader className="text-center py-8">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <CardTitle className="text-sm">Історія платежів порожня</CardTitle>
                <CardDescription className="text-xs">
                  Зафіксуйте перший платіж за цим клієнтом.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        {/* Tab 5: Notes */}
        <TabsContent value="notes" className="space-y-3">
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Нотатки про клієнта</CardTitle>
            </CardHeader>
            <CardContent>
              {client.notes ? (
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {client.notes}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Нотаток поки немає. Ви можете додати їх через меню &quot;Редагувати&quot;.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
