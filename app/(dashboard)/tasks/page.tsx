import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  TaskTable,
  TaskFilters,
  TaskDialog,
  isTaskOverdue,
  isTaskDueToday,
  type TaskWithRelations,
} from '@/components/tasks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckSquare, Plus, FilterX, Clock, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Task } from '@/lib/types'

interface TasksPageProps {
  searchParams: Promise<{
    tab?: string
    search?: string
    clientId?: string
    projectId?: string
  }>
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const { tab = 'all', search, clientId, projectId } = await searchParams

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let allTasks: TaskWithRelations[] = []
  let clientsList: Array<{ id: string; full_name: string; company: string | null }> = []
  let projectsList: Array<{ id: string; client_id: string; title: string }> = []

  if (user) {
    // 1. Fetch available clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('id, full_name, company')
      .eq('owner_id', user.id)
      .order('full_name', { ascending: true })

    if (clientsData) {
      clientsList = clientsData
    }

    // 2. Fetch available projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, client_id, title')
      .eq('owner_id', user.id)
      .order('title', { ascending: true })

    if (projectsData) {
      projectsList = projectsData
    }

    // 3. Fetch Tasks
    let query = supabase
      .from('tasks')
      .select(`
        *,
        clients (
          id,
          full_name,
          company
        ),
        projects (
          id,
          title
        )
      `)
      .eq('owner_id', user.id)
      .order('due_date', { ascending: true, nullsFirst: false })

    // Apply client filter
    if (clientId && clientId !== 'ALL') {
      query = query.eq('client_id', clientId)
    }

    // Apply project filter
    if (projectId && projectId !== 'ALL') {
      query = query.eq('project_id', projectId)
    }

    // Apply search filter
    if (search && search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`)
    }

    const { data: tasksData, error } = await query
    if (!error && tasksData) {
      allTasks = tasksData
    }
  }

  // Calculate dynamic metrics on the fly
  const counts = {
    all: allTasks.length,
    open: allTasks.filter((t) => t.status === 'OPEN').length,
    today: allTasks.filter((t) => t.status === 'OPEN' && isTaskDueToday(t.due_date, t.status)).length,
    overdue: allTasks.filter((t) => t.status === 'OPEN' && isTaskOverdue(t.due_date, t.status)).length,
    done: allTasks.filter((t) => t.status === 'DONE').length,
  }

  // Filter tasks based on active Tab
  let filteredTasks = allTasks
  if (tab === 'open') {
    filteredTasks = allTasks.filter((t) => t.status === 'OPEN')
  } else if (tab === 'today') {
    filteredTasks = allTasks.filter((t) => t.status === 'OPEN' && isTaskDueToday(t.due_date, t.status))
  } else if (tab === 'overdue') {
    filteredTasks = allTasks.filter((t) => t.status === 'OPEN' && isTaskOverdue(t.due_date, t.status))
  } else if (tab === 'done') {
    filteredTasks = allTasks.filter((t) => t.status === 'DONE')
  }

  const isFiltering = !!(
    (tab && tab !== 'all') ||
    search ||
    (clientId && clientId !== 'ALL') ||
    (projectId && projectId !== 'ALL')
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Задачі та дедлайни</h1>
            <Badge variant="secondary" className="font-semibold">
              {counts.all}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Операційні чек-листи, контроль термінів виконання та статусів
          </p>
        </div>

        <TaskDialog clients={clientsList} projects={projectsList} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Відкриті</span>
            <Clock className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <span className="text-xl font-bold mt-1.5 text-sky-400">{counts.open}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Сьогодні</span>
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <span className="text-xl font-bold mt-1.5 text-amber-400">{counts.today}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Прострочені (On-the-fly)</span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <span className="text-xl font-bold mt-1.5 text-rose-400">{counts.overdue}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Виконані</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <span className="text-xl font-bold mt-1.5 text-emerald-400">{counts.done}</span>
        </div>
      </div>

      {/* Filters Bar */}
      <TaskFilters
        clients={clientsList}
        projects={projectsList}
        counts={counts}
      />

      {/* Tasks List or Empty State */}
      {filteredTasks.length > 0 ? (
        <TaskTable
          tasks={filteredTasks}
          clients={clientsList}
          projects={projectsList}
        />
      ) : isFiltering ? (
        <Card className="border-border/60">
          <CardHeader className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <FilterX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Задач не знайдено</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              За вибраними критеріями фільтрації завдання відсутні.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-border/60 bg-card/40">
          <CardHeader className="text-center py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
              <CheckSquare className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl">Список задач порожній</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-1 mb-4 text-sm">
              Створіть вашу першу задачу або чек-лист для контролю термінів розробки та дедлайнів.
            </CardDescription>
            <div className="flex justify-center">
              <TaskDialog
                clients={clientsList}
                projects={projectsList}
                trigger={
                  <Button className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Додати першу задачу
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
