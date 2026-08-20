import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  TodayFocusCard,
  ProjectPipelineCard,
  FinancialSummaryCard,
  ClientMetricsCard,
} from '@/components/dashboard'
import { isTaskOverdue, isTaskDueToday } from '@/components/tasks'
import type { Client, Project, Payment, Task, ClientSource, Currency } from '@/lib/types'
import type { TaskWithRelations } from '@/components/tasks/task-item'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let clients: Client[] = []
  let projects: Project[] = []
  let payments: Payment[] = []
  let tasks: TaskWithRelations[] = []
  let recentIncomingLogs: Array<{ client_id: string; created_at: string }> = []

  if (user) {
    const [clientsRes, projectsRes, paymentsRes, tasksRes, commsRes] = await Promise.all([
      supabase.from('clients').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
      supabase.from('projects').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
      supabase.from('payments').select('*').eq('owner_id', user.id),
      supabase
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
        .order('due_date', { ascending: true }),
      supabase
        .from('communication_log')
        .select('client_id, created_at')
        .eq('owner_id', user.id)
        .eq('direction', 'INCOMING')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (clientsRes.data) clients = clientsRes.data
    if (projectsRes.data) projects = projectsRes.data
    if (paymentsRes.data) payments = paymentsRes.data
    if (tasksRes.data) tasks = tasksRes.data
    if (commsRes.data) recentIncomingLogs = commsRes.data
  }

  // 1. Calculate Today's Focus Metrics
  const now = new Date()
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  const newLeads = clients.filter(
    (c) => c.status === 'LEAD' && new Date(c.created_at) >= fortyEightHoursAgo
  )
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.due_date, t.status))
  const dueTodayTasks = tasks.filter((t) => isTaskDueToday(t.due_date, t.status))

  // Unanswered clients: recent incoming logs
  const incomingClientIds = new Set(recentIncomingLogs.map((l) => l.client_id))
  const unansweredClientsCount = incomingClientIds.size

  const urgentTasks = [...overdueTasks, ...dueTodayTasks]

  // 2. Calculate Project Pipeline Metrics
  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length
  const waitingCount = projects.filter(
    (p) => p.status === 'WAITING_CLIENT' || p.status === 'WAITING_PAYMENT'
  ).length
  const revisionsCount = projects.filter((p) => p.status === 'REVISIONS').length
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length
  const totalProjects = projects.length

  // 3. Calculate Financial Summary (On-the-Fly)
  const totalBudget = projects.reduce((sum, p) => sum + (Number(p.budget) || 0), 0)
  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  const totalOutstanding = Math.max(0, totalBudget - totalPaid)

  const currencyBreakdown: Record<Currency, { budget: number; paid: number }> = {
    USD: { budget: 0, paid: 0 },
    EUR: { budget: 0, paid: 0 },
    UAH: { budget: 0, paid: 0 },
    PLN: { budget: 0, paid: 0 },
  }

  projects.forEach((p) => {
    if (currencyBreakdown[p.currency]) {
      currencyBreakdown[p.currency].budget += Number(p.budget) || 0
    }
  })

  payments.forEach((p) => {
    if (p.status === 'PAID' && currencyBreakdown[p.currency]) {
      currencyBreakdown[p.currency].paid += Number(p.amount) || 0
    }
  })

  // 4. Calculate Client Metrics
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const newThisMonth = clients.filter(
    (c) => new Date(c.created_at) >= startOfMonth
  ).length
  const activeClients = clients.filter(
    (c) => c.status === 'ACTIVE' || c.status === 'CLIENT'
  ).length

  const sourcesBreakdown: Record<ClientSource, number> = {
    FREELANCEHUNT: 0,
    TELEGRAM: 0,
    REFERRAL: 0,
    WEBSITE: 0,
    OTHER: 0,
  }

  clients.forEach((c) => {
    if (sourcesBreakdown[c.source] !== undefined) {
      sourcesBreakdown[c.source] += 1
    }
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Головний дашборд</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Оперативний огляд ключових показників, стану пайплайну та фінансів
        </p>
      </div>

      {/* 4 Core Focus Cards (Discovery Architecture) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Block 1: СЬОГОДНІ (Фокус дня) */}
        <TodayFocusCard
          newLeadsCount={newLeads.length}
          recentLeads={newLeads}
          overdueTasksCount={overdueTasks.length}
          dueTodayTasksCount={dueTodayTasks.length}
          urgentTasks={urgentTasks}
          unansweredClientsCount={unansweredClientsCount}
        />

        {/* Block 2: ПРОЄКТИ (Стан пайплайну) */}
        <ProjectPipelineCard
          inProgressCount={inProgressCount}
          waitingCount={waitingCount}
          revisionsCount={revisionsCount}
          completedCount={completedCount}
          totalProjects={totalProjects}
        />

        {/* Block 3: ГРОШІ (Фінансовий баланс) */}
        <FinancialSummaryCard
          totalBudget={totalBudget}
          totalPaid={totalPaid}
          totalOutstanding={totalOutstanding}
          currencyBreakdown={currencyBreakdown}
        />

        {/* Block 4: КЛІЄНТИ (Метрики бази) */}
        <ClientMetricsCard
          totalClients={clients.length}
          activeClients={activeClients}
          newThisMonth={newThisMonth}
          sourcesBreakdown={sourcesBreakdown}
        />
      </div>
    </div>
  )
}
