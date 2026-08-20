'use server'

import { createClient as createServerClient } from '@/lib/supabase/server'

export interface GlobalSearchResultItem {
  id: string
  title: string
  subtitle?: string | null
  type: 'client' | 'project' | 'task' | 'payment'
  url: string
  badge?: string
}

export interface GlobalSearchResults {
  clients: GlobalSearchResultItem[]
  projects: GlobalSearchResultItem[]
  tasks: GlobalSearchResultItem[]
  payments: GlobalSearchResultItem[]
}

/**
 * Server Action: Fast multi-entity parallel search across user's records
 */
export async function globalSearch(query: string): Promise<GlobalSearchResults> {
  const emptyResults: GlobalSearchResults = {
    clients: [],
    projects: [],
    tasks: [],
    payments: [],
  }

  const cleanQuery = query?.trim()
  if (!cleanQuery || cleanQuery.length < 1) {
    return emptyResults
  }

  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return emptyResults
    }

    const term = `%${cleanQuery}%`

    // Parallel searches bounded by owner_id and limit 5 each
    const [clientsRes, projectsRes, tasksRes, paymentsRes] = await Promise.all([
      // 1. Clients
      supabase
        .from('clients')
        .select('id, full_name, company, username, status')
        .eq('owner_id', user.id)
        .or(`full_name.ilike.${term},company.ilike.${term},username.ilike.${term},email.ilike.${term}`)
        .limit(5),

      // 2. Projects
      supabase
        .from('projects')
        .select('id, title, description, status, budget, currency')
        .eq('owner_id', user.id)
        .or(`title.ilike.${term},description.ilike.${term}`)
        .limit(5),

      // 3. Tasks
      supabase
        .from('tasks')
        .select('id, title, status, due_date, project_id')
        .eq('owner_id', user.id)
        .ilike('title', term)
        .limit(5),

      // 4. Payments
      supabase
        .from('payments')
        .select('id, amount, currency, status, payment_method, description, project_id')
        .eq('owner_id', user.id)
        .or(`description.ilike.${term},payment_method.ilike.${term}`)
        .limit(5),
    ])

    const clients: GlobalSearchResultItem[] = (clientsRes.data || []).map((c) => ({
      id: c.id,
      title: c.full_name,
      subtitle: c.company || (c.username ? `@${c.username}` : null),
      type: 'client',
      url: `/clients/${c.id}`,
      badge: c.status,
    }))

    const projects: GlobalSearchResultItem[] = (projectsRes.data || []).map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.budget ? `$${Number(p.budget).toFixed(0)} ${p.currency}` : null,
      type: 'project',
      url: `/projects/${p.id}`,
      badge: p.status,
    }))

    const tasks: GlobalSearchResultItem[] = (tasksRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      subtitle: t.due_date ? `Дедлайн: ${new Date(t.due_date).toLocaleDateString('uk-UA')}` : null,
      type: 'task',
      url: t.project_id ? `/projects/${t.project_id}` : `/tasks`,
      badge: t.status,
    }))

    const payments: GlobalSearchResultItem[] = (paymentsRes.data || []).map((pay) => ({
      id: pay.id,
      title: `$${Number(pay.amount).toFixed(2)} ${pay.currency}`,
      subtitle: pay.description || pay.payment_method || 'Платіж',
      type: 'payment',
      url: pay.project_id ? `/projects/${pay.project_id}` : `/payments`,
      badge: pay.status,
    }))

    return {
      clients,
      projects,
      tasks,
      payments,
    }
  } catch (error) {
    console.error('Error in globalSearch:', error)
    return emptyResults
  }
}
