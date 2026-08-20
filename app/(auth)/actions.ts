'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

export type AuthState = {
  error?: string | null
  success?: boolean
  message?: string | null
}

/**
 * Server Action: Log in user with email & password
 */
export async function loginAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parseResult = loginSchema.safeParse(rawData)
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Некоректні дані для входу',
    }
  }

  const { email, password } = parseResult.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      return { error: 'Невірний email або пароль' }
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Будь ласка, підтвердіть вашу електронну пошту' }
    }
    return { error: error.message || 'Помилка авторизації' }
  }

  const redirectTo = formData.get('redirectTo')?.toString() || '/dashboard'
  redirect(redirectTo)
}

/**
 * Server Action: Sign up new user
 */
export async function signupAction(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
    fullName: formData.get('fullName'),
  }

  const parseResult = signupSchema.safeParse(rawData)
  if (!parseResult.success) {
    return {
      error: parseResult.error.issues[0]?.message || 'Некоректні дані реєстрації',
    }
  }

  const { email, password, fullName } = parseResult.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || '',
      },
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'Користувач із цією адресою електронної пошти вже існує' }
    }
    return { error: error.message || 'Помилка реєстрації' }
  }

  // Check if session was created automatically or email confirmation is required
  if (data.session) {
    redirect('/dashboard')
  }

  return {
    success: true,
    message: 'Акаунт успішно створено! Будь ласка, перевірте пошту для підтвердження або увійдіть.',
  }
}

/**
 * Server Action: Sign out user
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// Aliases for direct invocations
export async function login(formData: FormData) {
  return loginAction(null, formData)
}

export async function signup(formData: FormData) {
  return signupAction(null, formData)
}

export async function signOut() {
  return signOutAction()
}
