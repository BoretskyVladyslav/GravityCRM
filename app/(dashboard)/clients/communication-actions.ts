'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { communicationLogSchema } from '@/lib/validations/communication'

export type CommunicationActionState = {
  error?: string | null
  success?: boolean
  message?: string | null
  log?: any
}

/**
 * Server Action: Create new communication log entry and update client's last_contact_at
 */
export async function createCommunicationLog(
  prevState: CommunicationActionState | null,
  formData: FormData
): Promise<CommunicationActionState> {
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
      client_id: formData.get('client_id'),
      project_id: formData.get('project_id'),
      channel: formData.get('channel') || 'TELEGRAM',
      direction: formData.get('direction') || 'OUTGOING',
      message: formData.get('message'),
    }

    const parseResult = communicationLogSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані повідомлення',
      }
    }

    const now = new Date().toISOString()

    // 1. Insert into communication_log
    const { data: log, error: logError } = await supabase
      .from('communication_log')
      .insert({
        ...parseResult.data,
        owner_id: user.id,
        created_at: now,
      })
      .select()
      .single()

    if (logError) {
      return { error: logError.message || 'Не вдалося зберегти запис комунікації' }
    }

    // 2. Automatically update clients.last_contact_at = now()
    await supabase
      .from('clients')
      .update({
        last_contact_at: now,
      })
      .eq('id', parseResult.data.client_id)
      .eq('owner_id', user.id)

    revalidatePath(`/clients/${parseResult.data.client_id}`)
    if (parseResult.data.project_id) {
      revalidatePath(`/projects/${parseResult.data.project_id}`)
    }
    revalidatePath('/clients')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Запис успішно додано до історії',
      log,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Delete communication log entry
 */
export async function deleteCommunicationLog(id: string): Promise<CommunicationActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    const { data: log } = await supabase
      .from('communication_log')
      .select('client_id, project_id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    const { error } = await supabase
      .from('communication_log')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id)

    if (error) {
      return { error: error.message || 'Не вдалося видалити запис' }
    }

    if (log?.client_id) {
      revalidatePath(`/clients/${log.client_id}`)
    }
    if (log?.project_id) {
      revalidatePath(`/projects/${log.project_id}`)
    }
    revalidatePath('/dashboard')

    return { success: true, message: 'Запис комунікації видалено' }
  } catch (err: any) {
    return { error: err.message || 'Помилка видалення запису' }
  }
}
