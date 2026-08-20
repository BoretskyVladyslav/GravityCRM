import type { Database } from './database'

export * from './database'

// Row Types
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export type CommunicationLog = Database['public']['Tables']['communication_log']['Row']
export type CommunicationLogInsert = Database['public']['Tables']['communication_log']['Insert']
export type CommunicationLogUpdate = Database['public']['Tables']['communication_log']['Update']

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']

// Calculated View Models
export interface ProjectFinancialSummary {
  project_id: string
  budget: number
  currency: Database['public']['Enums']['currency']
  total_paid: number
  remaining_balance: number
  is_fully_paid: boolean
}

export interface DashboardMetrics {
  today: {
    new_leads: number
    overdue_tasks: number
    clients_to_respond: number
  }
  projects_by_status: {
    active: number
    waiting: number
    revision: number
    completed: number
  }
  financials: {
    total_project_value: number
    total_paid: number
    total_outstanding: number
  }
  clients: {
    total: number
    active: number
    new_this_month: number
  }
}
