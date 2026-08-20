export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ClientSource = 'FREELANCEHUNT' | 'TELEGRAM' | 'REFERRAL' | 'WEBSITE' | 'OTHER'
export type ClientStatus = 'LEAD' | 'ACTIVE' | 'CLIENT' | 'PAUSED' | 'INACTIVE' | 'ARCHIVED'
export type ProjectStatus = 'LEAD' | 'PLANNING' | 'IN_PROGRESS' | 'WAITING_CLIENT' | 'WAITING_PAYMENT' | 'REVISIONS' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'REFUNDED' | 'CANCELLED'
export type CommunicationChannel = 'TELEGRAM' | 'FREELANCEHUNT' | 'EMAIL' | 'OTHER'
export type MessageDirection = 'INCOMING' | 'OUTGOING'
export type TaskStatus = 'OPEN' | 'DONE'
export type Currency = 'USD' | 'EUR' | 'UAH' | 'PLN'

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          owner_id: string
          full_name: string
          username: string | null
          telegram_id: number | null
          phone: string | null
          email: string | null
          company: string | null
          source: ClientSource
          status: ClientStatus
          notes: string | null
          created_at: string
          updated_at: string | null
          last_contact_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          full_name: string
          username?: string | null
          telegram_id?: number | null
          phone?: string | null
          email?: string | null
          company?: string | null
          source?: ClientSource
          status?: ClientStatus
          notes?: string | null
          created_at?: string
          updated_at?: string | null
          last_contact_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          full_name?: string
          username?: string | null
          telegram_id?: number | null
          phone?: string | null
          email?: string | null
          company?: string | null
          source?: ClientSource
          status?: ClientStatus
          notes?: string | null
          created_at?: string
          updated_at?: string | null
          last_contact_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          client_id: string
          title: string
          description: string | null
          status: ProjectStatus
          budget: number | null
          currency: Currency
          start_date: string | null
          deadline: string | null
          completed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          client_id: string
          title: string
          description?: string | null
          status?: ProjectStatus
          budget?: number | null
          currency?: Currency
          start_date?: string | null
          deadline?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          client_id?: string
          title?: string
          description?: string | null
          status?: ProjectStatus
          budget?: number | null
          currency?: Currency
          start_date?: string | null
          deadline?: string | null
          completed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'projects_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
        ]
      }
      payments: {
        Row: {
          id: string
          owner_id: string
          client_id: string
          project_id: string | null
          amount: number
          currency: Currency
          status: PaymentStatus
          payment_method: string | null
          paid_at: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          client_id: string
          project_id?: string | null
          amount: number
          currency?: Currency
          status?: PaymentStatus
          payment_method?: string | null
          paid_at?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          client_id?: string
          project_id?: string | null
          amount?: number
          currency?: Currency
          status?: PaymentStatus
          payment_method?: string | null
          paid_at?: string | null
          description?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'payments_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'payments_project_id_fkey'
            columns: ['project_id']
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      communication_log: {
        Row: {
          id: string
          owner_id: string
          client_id: string
          project_id: string | null
          channel: CommunicationChannel
          direction: MessageDirection
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          client_id: string
          project_id?: string | null
          channel?: CommunicationChannel
          direction?: MessageDirection
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          client_id?: string
          project_id?: string | null
          channel?: CommunicationChannel
          direction?: MessageDirection
          message?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'communication_log_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'communication_log_project_id_fkey'
            columns: ['project_id']
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          owner_id: string
          client_id: string | null
          project_id: string | null
          title: string
          due_date: string | null
          status: TaskStatus
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          client_id?: string | null
          project_id?: string | null
          title: string
          due_date?: string | null
          status?: TaskStatus
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          client_id?: string | null
          project_id?: string | null
          title?: string
          due_date?: string | null
          status?: TaskStatus
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tasks_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_project_id_fkey'
            columns: ['project_id']
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      telegram_updates_log: {
        Row: {
          update_id: number
          processed_at: string
          status: string
          error_message: string | null
        }
        Insert: {
          update_id: number
          processed_at?: string
          status?: string
          error_message?: string | null
        }
        Update: {
          update_id?: number
          processed_at?: string
          status?: string
          error_message?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      client_source: ClientSource
      client_status: ClientStatus
      project_status: ProjectStatus
      payment_status: PaymentStatus
      channel: CommunicationChannel
      direction: MessageDirection
      task_status: TaskStatus
      currency: Currency
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
