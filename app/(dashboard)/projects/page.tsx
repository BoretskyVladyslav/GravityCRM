import { createClient as createServerClient } from '@/lib/supabase/server'
import { ProjectTable, ProjectFilters, ProjectDialog } from '@/components/projects'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderKanban, Plus, FilterX, Layers, Clock, CheckCircle2, RotateCcw } from 'lucide-react'
import type { Project, ProjectStatus } from '@/lib/types'
import type { ProjectWithClientAndFinances } from '@/components/projects/project-table'

interface ProjectsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    clientId?: string
  }>
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const { search, status, clientId } = await searchParams

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let projects: ProjectWithClientAndFinances[] = []
  let clientsList: Array<{ id: string; full_name: string; company: string | null }> = []

  if (user) {
    // 1. Fetch available clients for filters & dialog
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, full_name, company')
      .eq('owner_id', user.id)
      .order('full_name', { ascending: true })

    if (clientsData) {
      clientsList = clientsData
    }

    // 2. Fetch Projects
    let query = supabase
      .from('projects')
      .select(`
        *,
        clients (
          id,
          full_name,
          company
        )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'ALL') {
      query = query.eq('status', status as ProjectStatus)
    }

    // Apply client filter
    if (clientId && clientId !== 'ALL') {
      query = query.eq('client_id', clientId)
    }

    // Apply search filter
    if (search && search.trim()) {
      const term = `%${search.trim()}%`
      query = query.or(`title.ilike.${term},description.ilike.${term}`)
    }

    const { data: projectsData, error } = await query
    if (!error && projectsData) {
      // 3. Fetch Payments to calculate financials on the fly
      const projectIds = projectsData.map((p) => p.id)
      let paymentsByProject: Record<string, number> = {}

      if (projectIds.length > 0) {
        const { data: paymentsData } = await supabase
          .from('payments')
          .select('project_id, amount')
          .in('project_id', projectIds)
          .eq('status', 'PAID')

        if (paymentsData) {
          paymentsData.forEach((pay) => {
            if (pay.project_id) {
              paymentsByProject[pay.project_id] =
                (paymentsByProject[pay.project_id] || 0) + Number(pay.amount)
            }
          })
        }
      }

      projects = projectsData.map((p) => {
        const totalPaid = paymentsByProject[p.id] || 0
        const budget = Number(p.budget) || 0
        return {
          ...p,
          total_paid: totalPaid,
          remaining_balance: Math.max(0, budget - totalPaid),
        }
      })
    }
  }

  // Stats calculation
  const totalCount = projects.length
  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const waitingCount = projects.filter(
    (p) => p.status === 'WAITING_CLIENT' || p.status === 'WAITING_PAYMENT'
  ).length
  const revisionsCount = projects.filter((p) => p.status === 'REVISIONS').length
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length

  const isFiltering = !!(search || (status && status !== 'ALL') || (clientId && clientId !== 'ALL'))

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Проєкти</h1>
            <Badge variant="secondary" className="font-semibold">
              {totalCount}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Управління життєвим циклом розробки, бюджетами, дедлайнами та оплатами
          </p>
        </div>

        <ProjectDialog clients={clientsList} />
      </div>

      {/* Quick Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>В роботі</span>
            <Layers className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <span className="text-xl font-bold mt-1 text-sky-400">{inProgressCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Очікування</span>
            <Clock className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-bold mt-1 text-amber-400">{waitingCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>На ревізії</span>
            <RotateCcw className="h-3.5 w-3.5 text-pink-400" />
          </div>
          <span className="text-xl font-bold mt-1 text-pink-400">{revisionsCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Завершені</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold mt-1 text-emerald-400">{completedCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <ProjectFilters clients={clientsList} />

      {/* Projects List or Empty State */}
      {projects.length > 0 ? (
        <ProjectTable projects={projects} clients={clientsList} />
      ) : isFiltering ? (
        <Card className="border-border/60">
          <CardHeader className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <FilterX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Проєктів не знайдено</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              За вказаними параметрами фільтрації немає відповідних проєктів.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-border/60 bg-card/40">
          <CardHeader className="text-center py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
              <FolderKanban className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl">Список проєктів порожній</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-1 mb-4 text-sm">
              Створіть ваш перший проєкт, прив&apos;язавши його до клієнта, щоб відстежувати задачі, етапи та оплати на льоту.
            </CardDescription>
            <div className="flex justify-center">
              <ProjectDialog
                clients={clientsList}
                trigger={
                  <Button className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Створити перший проєкт
                  </Button>
                }
              />
            </div>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
