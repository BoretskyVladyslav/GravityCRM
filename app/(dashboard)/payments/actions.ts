'use server'

import { revalidatePath } from 'next/cache'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { paymentSchema } from '@/lib/validations/payment'
import type { PaymentStatus } from '@/lib/types'

export type PaymentActionState = {
  error?: string | null
  success?: boolean
  message?: string | null
  payment?: any
}

/**
 * Server Action: Create new payment transaction
 */
export async function createPayment(
  prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
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
      amount: formData.get('amount'),
      currency: formData.get('currency') || 'USD',
      status: formData.get('status') || 'PAID',
      payment_method: formData.get('payment_method'),
      paid_at: formData.get('paid_at'),
      description: formData.get('description'),
    }

    const parseResult = paymentSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані платежу',
      }
    }

    let paid_at = parseResult.data.paid_at
    if (!paid_at && parseResult.data.status === 'PAID') {
      paid_at = new Date().toISOString()
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        ...parseResult.data,
        paid_at,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося створити платіж' }
    }

    revalidatePath('/payments')
    revalidatePath('/dashboard')
    if (parseResult.data.client_id) {
      revalidatePath(`/clients/${parseResult.data.client_id}`)
    }
    if (parseResult.data.project_id) {
      revalidatePath(`/projects/${parseResult.data.project_id}`)
    }

    return {
      success: true,
      message: 'Платіж успішно зафіксовано',
      payment,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Update payment details
 */
export async function updatePayment(
  id: string,
  prevState: PaymentActionState | null,
  formData: FormData
): Promise<PaymentActionState> {
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
      amount: formData.get('amount'),
      currency: formData.get('currency'),
      status: formData.get('status'),
      payment_method: formData.get('payment_method'),
      paid_at: formData.get('paid_at'),
      description: formData.get('description'),
    }

    const parseResult = paymentSchema.safeParse(rawData)
    if (!parseResult.success) {
      return {
        error: parseResult.error.issues[0]?.message || 'Некоректні дані платежу',
      }
    }

    let paid_at = parseResult.data.paid_at
    if (!paid_at && parseResult.data.status === 'PAID') {
      paid_at = new Date().toISOString()
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update({
        ...parseResult.data,
        paid_at,
      })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося оновити платіж' }
    }

    revalidatePath('/payments')
    revalidatePath('/dashboard')
    if (parseResult.data.client_id) {
      revalidatePath(`/clients/${parseResult.data.client_id}`)
    }
    if (parseResult.data.project_id) {
      revalidatePath(`/projects/${parseResult.data.project_id}`)
    }

    return {
      success: true,
      message: 'Інформацію про платіж оновлено',
      payment,
    }
  } catch (err: any) {
    return { error: err.message || 'Внутрішня помилка сервера' }
  }
}

/**
 * Server Action: Quick change payment status (e.g. mark as PAID)
 */
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus
): Promise<PaymentActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    // If changing to PAID, check if paid_at needs setting
    const updatePayload: {
      status: PaymentStatus
      paid_at?: string
    } = { status }

    if (status === 'PAID') {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('paid_at')
        .eq('id', id)
        .single()

      if (!existingPayment?.paid_at) {
        updatePayload.paid_at = new Date().toISOString()
      }
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .update(updatePayload)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('client_id, project_id')
      .single()

    if (error) {
      return { error: error.message || 'Не вдалося змінити статус платежу' }
    }

    revalidatePath('/payments')
    revalidatePath('/dashboard')
    if (payment?.client_id) {
      revalidatePath(`/clients/${payment.client_id}`)
    }
    if (payment?.project_id) {
      revalidatePath(`/projects/${payment.project_id}`)
    }

    return { success: true, message: `Статус платежу змінено на ${status}` }
  } catch (err: any) {
    return { error: err.message || 'Помилка оновлення статусу' }
  }
}

/**
 * Server Action: Delete payment transaction
 */
export async function deletePayment(id: string): Promise<PaymentActionState> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: 'Помилка авторизації' }
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('client_id, project_id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single()

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .eq('owner_id', user.id)

    if (error) {
      return { error: error.message || 'Не вдалося видалити платіж' }
    }

    revalidatePath('/payments')
    revalidatePath('/dashboard')
    if (payment?.client_id) {
      revalidatePath(`/clients/${payment.client_id}`)
    }
    if (payment?.project_id) {
      revalidatePath(`/projects/${payment.project_id}`)
    }

    return { success: true, message: 'Платіж успішно видалено' }
  } catch (err: any) {
    return { error: err.message || 'Помилка видалення платежу' }
  }
}
