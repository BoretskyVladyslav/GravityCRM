'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client'
import type { ClientStatus } from '@/lib/types'

export type ClientActionState = {
  error?: string | null
  success?: boolean
  message?: string | null
  client?: any
}

/**
 * Server Action: Create a new client / lead
 */
export async function createClient(
  prevState: ClientActionState | null,
  formData: FormData
): Promise<ClientActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації. Увійдіть у систему.' }
    }

    const rawData = {
      full_name: formData.get('full_name'),
      username: formData.get('username'),
      telegram_id: formData.get('telegram_id'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      company: formData.get('company'),
      source: formData.get('source') || 'FREELANCEHUNT',
      status: formData.get('status') || 'LEAD',
      notes: formData.get('notes'),
    }

    const parseResult = clientSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані клієнта',
      }
    }

    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        ...parseResult.data,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('telegram_id')) {
        return { error: 'Клієнт із таким Telegram ID вже зареєстрований' }
      }
      return { error: error.message || 'Не вдалося створити клієнта' }
    }

    revalidatePath('/clients')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Клієнта успішно створено',
      client,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Update client information
 */
export async function updateClient(
  id: string,
  prevState: ClientActionState | null,
  formData: FormData
): Promise<ClientActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації. Увійдіть у систему.' }
    }

    const rawData = {
      full_name: formData.get('full_name'),
      username: formData.get('username'),
      telegram_id: formData.get('telegram_id'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      company: formData.get('company'),
      source: formData.get('source'),
      status: formData.get('status'),
      notes: formData.get('notes'),
    }

    const parseResult = clientSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані клієнта',
      }
    }

    const { data: client, error } = await supabase
      .from('clients')
      .update(parseResult.data)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('telegram_id')) {
        return { error: 'Клієнт із таким Telegram ID вже існує' }
      }
      return { error: error.message || 'Не вдалося оновити клієнта' }
    }

    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Інформацію про клієнта оновлено',
      client,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Quick change client status
 */
export async function updateClientStatus(
  id: string,
  status: ClientStatus
): Promise<ClientActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    const { error } = await supabase
      .from('clients')
      .update({ status })
      .eq('id', id)
      .eq('owner_id', user.id)

    if (error) {
      return { error: error.message || 'Не вдалося змінити статус' }
    }

    revalidatePath('/clients')
    revalidatePath(`/clients/${id}`)
    revalidatePath('/dashboard')

    return { success: true, message: `Статус змінено на ${status}` }
  } catch (err: any) {
    return { error: err.message || 'Помилка оновлення статусу' }
  }
}

/**
 * Server Action: Archive client (Soft Delete)
 */
export async function archiveClient(id: string): Promise<ClientActionState> {
  return updateClientStatus(id, 'ARCHIVED')
}

/**
 * Server Action: Permanently delete client
 */
export async function deleteClient(id: string): Promise<ClientActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    // Check if client has active projects
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', id)
      .eq('owner_id', user.id)
      .neq('status', 'COMPLETED')
      .neq('status', 'CANCELLED')

    if (!countError && count && count > 0) {
      return {
        error: `Неможливо видалити клієнта: у нього є ${count} активних проєктів. Спочатку завершіть або заархівуйте їх.`,
      }
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id)

    if (error) {
      return { error: error.message || 'Не вдалося видалити клієнта' }
    }

    revalidatePath('/clients')
    revalidatePath('/dashboard')

    return { success: true, message: 'Клієнта успішно видалено' }
  } catch (err: any) {
    return { error: err.message || 'Помилка видалення клієнта' }
  }
}
