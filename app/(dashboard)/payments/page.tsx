import { createClient as createServerClient } from '@/lib/supabase/server'
import { PaymentTable, PaymentFilters, PaymentDialog } from '@/components/payments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Plus, FilterX, DollarSign, Clock, RotateCcw, CheckCircle2 } from 'lucide-react'
import type { Payment, PaymentStatus, Currency } from '@/lib/types'
import type { PaymentWithRelations } from '@/components/payments/payment-table'

interface PaymentsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    currency?: string
    clientId?: string
    projectId?: string
  }>
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const { search, status, currency, clientId, projectId } = await searchParams

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let payments: PaymentWithRelations[] = []
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

    // 3. Fetch Payments
    let query = supabase
      .from('payments')
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
      .order('paid_at', { ascending: false, nullsFirst: false })

    // Apply status filter
    if (status && status !== 'ALL') {
      query = query.eq('status', status as PaymentStatus)
    }

    // Apply currency filter
    if (currency && currency !== 'ALL') {
      query = query.eq('currency', currency as Currency)
    }

    // Apply client filter
    if (clientId && clientId !== 'ALL') {
      query = query.eq('client_id', clientId)
    }

    // Apply project filter
    if (projectId && projectId !== 'ALL') {
      query = query.eq('project_id', projectId)
    }

    // Apply search filter (description or payment_method)
    if (search && search.trim()) {
      const term = `%${search.trim()}%`
      query = query.or(`description.ilike.${term},payment_method.ilike.${term}`)
    }

    const { data: paymentsData, error } = await query
    if (!error && paymentsData) {
      payments = paymentsData
    }
  }

  // Financial KPI calculations on the fly
  const totalPaidSum = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const pendingSum = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const refundedSum = payments
    .filter((p) => p.status === 'REFUNDED' || p.status === 'CANCELLED')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const totalCount = payments.length

  const isFiltering = !!(
    search ||
    (status && status !== 'ALL') ||
    (currency && currency !== 'ALL') ||
    (clientId && clientId !== 'ALL') ||
    (projectId && projectId !== 'ALL')
  )

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Платежі та фінанси</h1>
            <Badge variant="secondary" className="font-semibold">
              {totalCount}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Облік доходів, транзакцій та надходжень (розрахунок на льоту)
          </p>
        </div>

        <PaymentDialog clients={clientsList} projects={projectsList} />
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Фактично отримано (Total Paid)
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ${totalPaidSum.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Успішно сплачених операцій: {payments.filter((p) => p.status === 'PAID').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Очікувані надходження (Pending)
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              ${pendingSum.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Транзакцій в очікуванні: {payments.filter((p) => p.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Повернення та скасування
            </CardTitle>
            <RotateCcw className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-400">
              ${refundedSum.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Скасованих операцій: {payments.filter((p) => p.status === 'REFUNDED' || p.status === 'CANCELLED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <PaymentFilters clients={clientsList} projects={projectsList} />

      {/* Payments Table or Empty State */}
      {payments.length > 0 ? (
        <PaymentTable
          payments={payments}
          clients={clientsList}
          projects={projectsList}
        />
      ) : isFiltering ? (
        <Card className="border-border/60">
          <CardHeader className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <FilterX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Платежів не знайдено</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              За вибраними критеріями пошуку та фільтрації платежі відсутні.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-border/60 bg-card/40">
          <CardHeader className="text-center py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
              <CreditCard className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl">Історія платежів порожня</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-1 mb-4 text-sm">
              Зафіксуйте вашу першу транзакцію (аванс, поетапну виплату або залишок) для автоматичного ведення фінансового обліку.
            </CardDescription>
            <div className="flex justify-center">
              <PaymentDialog
                clients={clientsList}
                projects={projectsList}
                trigger={
                  <Button className="gap-2 shadow-sm">
                    <Plus className="h-4 w-4" /> Зафіксувати перший платіж
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
