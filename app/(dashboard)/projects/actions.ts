'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { projectSchema } from '@/lib/validations/project'
import type { ProjectStatus } from '@/lib/types'

export type ProjectActionState = {
  error?: string | null
  success?: boolean
  message?: string | null
  project?: any
}

/**
 * Server Action: Create new project
 */
export async function createProject(
  prevState: ProjectActionState | null,
  formData: FormData
): Promise<ProjectActionState> {
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
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status') || 'LEAD',
      budget: formData.get('budget'),
      currency: formData.get('currency') || 'USD',
      start_date: formData.get('start_date'),
      deadline: formData.get('deadline'),
      notes: formData.get('notes'),
    }

    const parseResult = projectSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані проєкту',
      }
    }

    const isCompleted = parseResult.data.status === 'COMPLETED'
    const completed_at = isCompleted ? new Date().toISOString() : null

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...parseResult.data,
        owner_id: user.id,
        completed_at,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося створити проєкт' }
    }

    revalidatePath('/projects')
    revalidatePath(`/clients/${parseResult.data.client_id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Проєкт успішно створено',
      project,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Update project details
 */
export async function updateProject(
  id: string,
  prevState: ProjectActionState | null,
  formData: FormData
): Promise<ProjectActionState> {
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
      title: formData.get('title'),
      description: formData.get('description'),
      status: formData.get('status'),
      budget: formData.get('budget'),
      currency: formData.get('currency'),
      start_date: formData.get('start_date'),
      deadline: formData.get('deadline'),
      notes: formData.get('notes'),
    }

    const parseResult = projectSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані проєкту',
      }
    }

    // Get current project to handle completed_at logic
    const { data: currentProject } = await supabase
      .from('projects')
      .select('status, completed_at')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    let completed_at = currentProject?.completed_at || null
    if (parseResult.data.status === 'COMPLETED' && currentProject?.status !== 'COMPLETED') {
      completed_at = new Date().toISOString()
    } else if (parseResult.data.status !== 'COMPLETED' && currentProject?.status === 'COMPLETED') {
      completed_at = null
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        ...parseResult.data,
        completed_at,
      })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося оновити проєкт' }
    }

    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    revalidatePath(`/clients/${parseResult.data.client_id}`)
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Інформацію про проєкт оновлено',
      project,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Quick change project lifecycle status
 */
export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<ProjectActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    const isCompleted = status === 'COMPLETED'
    const completed_at = isCompleted ? new Date().toISOString() : null

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        status,
        completed_at,
      })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('client_id')
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося змінити статус проєкту' }
    }

    revalidatePath('/projects')
    revalidatePath(`/projects/${id}`)
    if (project?.client_id) {
      revalidatePath(`/clients/${project.client_id}`)
    }
    revalidatePath('/dashboard')

    return { success: true, message: `Статус проєкту змінено на ${status}` }
  } catch (err: any) {
    return { error: err.message || 'Помилка оновлення статусу' }
  }
}

/**
 * Server Action: Delete project
 */
export async function deleteProject(id: string): Promise<ProjectActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id)

    if (error) {
      return { error: error.message || 'Не вдалося видалити проєкт' }
    }

    revalidatePath('/projects')
    if (project?.client_id) {
      revalidatePath(`/clients/${project.client_id}`)
    }
    revalidatePath('/dashboard')

    return { success: true, message: 'Проєкт успішно видалено' }
  } catch (err: any) {
    return { error: err.message || 'Помилка видалення проєкту' }
  }
}
