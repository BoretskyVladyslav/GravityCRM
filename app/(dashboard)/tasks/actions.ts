'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { taskSchema } from '@/lib/validations/task'
import type { TaskStatus } from '@/lib/types'

export type TaskActionState = {
  error?: string | null
  success?: boolean
  message?: string | null
  task?: any
}

/**
 * Server Action: Create new task
 */
export async function createTask(
  prevState: TaskActionState | null,
  formData: FormData
): Promise<TaskActionState> {
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
      title: formData.get('title'),
      client_id: formData.get('client_id'),
      project_id: formData.get('project_id'),
      due_date: formData.get('due_date'),
      status: formData.get('status') || 'OPEN',
    }

    const parseResult = taskSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані задачі',
      }
    }

    const isDone = parseResult.data.status === 'DONE'
    const completed_at = isDone ? new Date().toISOString() : null

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        ...parseResult.data,
        completed_at,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося створити задачу' }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    if (parseResult.data.client_id) {
      revalidatePath(`/clients/${parseResult.data.client_id}`)
    }
    if (parseResult.data.project_id) {
      revalidatePath(`/projects/${parseResult.data.project_id}`)
    }

    return {
      success: true,
      message: 'Задачу успішно додано',
      task,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Toggle task status (OPEN <-> DONE)
 */
export async function toggleTaskStatus(
  id: string,
  currentStatus: TaskStatus
): Promise<TaskActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    const newStatus: TaskStatus = currentStatus === 'OPEN' ? 'DONE' : 'OPEN'
    const completed_at = newStatus === 'DONE' ? new Date().toISOString() : null

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        status: newStatus,
        completed_at,
      })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('client_id, project_id')
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося оновити статус задачі' }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    if (task?.client_id) {
      revalidatePath(`/clients/${task.client_id}`)
    }
    if (task?.project_id) {
      revalidatePath(`/projects/${task.project_id}`)
    }

    return {
      success: true,
      message: newStatus === 'DONE' ? 'Задачу виконано!' : 'Задачу відкрито знову',
    }
  } catch (err: any) {
    return { error: err.message || 'Помилка оновлення статусу' }
  }
}

/**
 * Server Action: Update task details
 */
export async function updateTask(
  id: string,
  prevState: TaskActionState | null,
  formData: FormData
): Promise<TaskActionState> {
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
      title: formData.get('title'),
      client_id: formData.get('client_id'),
      project_id: formData.get('project_id'),
      due_date: formData.get('due_date'),
      status: formData.get('status'),
    }

    const parseResult = taskSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані задачі',
      }
    }

    // Determine completed_at
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('status, completed_at')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    let completed_at = currentTask?.completed_at || null
    if (parseResult.data.status === 'DONE' && currentTask?.status !== 'DONE') {
      completed_at = new Date().toISOString()
    } else if (parseResult.data.status === 'OPEN' && currentTask?.status === 'DONE') {
      completed_at = null
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        ...parseResult.data,
        completed_at,
      })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося оновити задачу' }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    if (parseResult.data.client_id) {
      revalidatePath(`/clients/${parseResult.data.client_id}`)
    }
    if (parseResult.data.project_id) {
      revalidatePath(`/projects/${parseResult.data.project_id}`)
    }

    return {
      success: true,
      message: 'Задачу оновлено',
      task,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Delete task
 */
export async function deleteTask(id: string): Promise<TaskActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    const { data: task } = await supabase
      .from('tasks')
      .select('client_id, project_id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id)

    if (error) {
      return { error: error.message || 'Не вдалося видалити задачу' }
    }

    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    if (task?.client_id) {
      revalidatePath(`/clients/${task.client_id}`)
    }
    if (task?.project_id) {
      revalidatePath(`/projects/${task.project_id}`)
    }

    return { success: true, message: 'Задачу успішно видалено' }
  } catch (err: any) {
    return { error: err.message || 'Помилка видалення задачі' }
  }
}
