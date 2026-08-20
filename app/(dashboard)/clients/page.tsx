import { createClient as createServerClient } from '@/lib/supabase/server'
import { ClientTable, ClientFilters, ClientDialog } from '@/components/clients'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, Sparkles, FilterX } from 'lucide-react'
import type { Client, ClientSource, ClientStatus } from '@/lib/types'

interface ClientsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    source?: string
  }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const { search, status, source } = await searchParams

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let clients: Client[] = []

  if (user) {
    let query = supabase
      .from('clients')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (status && status !== 'ALL') {
      query = query.eq('status', status as ClientStatus)
    }

    // Apply source filter
    if (source && source !== 'ALL') {
      query = query.eq('source', source as ClientSource)
    }

    // Apply search filter
    if (search && search.trim()) {
      const term = `%${search.trim()}%`
      query = query.or(
        `full_name.ilike.${term},email.ilike.${term},company.ilike.${term},username.ilike.${term}`
      )
    }

    const { data, error } = await query
    if (!error && data) {
      clients = data
    }
  }

  // Quick stats calculation
  const totalCount = clients.length
  const leadsCount = clients.filter((c) => c.status === 'LEAD').length
  const activeCount = clients.filter((c) => c.status === 'ACTIVE').length
  const payingCount = clients.filter((c) => c.status === 'CLIENT').length

  const isFiltering = !!(search || (status && status !== 'ALL') || (source && source !== 'ALL'))

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">Клієнти та ліди</h1>
            <Badge variant="secondary" className="font-semibold">
              {totalCount}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Керування базою замовників, лідогенерацією та каналами зв&apos;язку
          </p>
        </div>

        <ClientDialog />
      </div>

      {/* Quick Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-muted-foreground">Всього клієнтів</span>
          <span className="text-xl font-bold mt-1">{totalCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-muted-foreground">Нові ліди</span>
          <span className="text-xl font-bold mt-1 text-blue-400">{leadsCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-muted-foreground">В роботі (Active)</span>
          <span className="text-xl font-bold mt-1 text-emerald-400">{activeCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-card border border-border/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs text-muted-foreground">Постійні клієнти</span>
          <span className="text-xl font-bold mt-1 text-indigo-400">{payingCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <ClientFilters />

      {/* Clients List or Empty States */}
      {clients.length > 0 ? (
        <ClientTable clients={clients} />
      ) : isFiltering ? (
        <Card className="border-border/60">
          <CardHeader className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
              <FilterX className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">Нічого не знайдено</CardTitle>
            <CardDescription className="max-w-md mx-auto">
              За вашим запитом не знайдено жодного клієнта. Спробуйте змінити пошуковий запит або скинути фільтри.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-border/60 bg-card/40">
          <CardHeader className="text-center py-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-xs">
              <Users className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl">Список клієнтів порожній</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-1 mb-4 text-sm">
              Додайте вашого першого клієнта або ліда, щоб відстежувати комунікацію, створювати проєкти та фіксувати надходження оплат.
            </CardDescription>
            <div className="flex justify-center">
              <ClientDialog
                trigger={
                  <Button className="gap-2 shadow-sm">
                    <UserPlus className="h-4 w-4" /> Додати першого клієнта
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
