'use client'

import { useState, useActionState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Mail, User, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { loginAction, signupAction, type AuthState } from '../actions'

const initialState: AuthState = {
  error: null,
  success: false,
  message: null,
}

function LoginFormContent() {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [loginState, runLoginAction, isLoginPending] = useActionState(loginAction, initialState)
  const [signupState, runSignupAction, isSignupPending] = useActionState(signupAction, initialState)

  const activeState = tab === 'login' ? loginState : signupState
  const isPending = tab === 'login' ? isLoginPending : isSignupPending

  return (
    <div className="w-full max-w-md space-y-6 relative z-10">
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> На головну
        </Link>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-xl shadow-lg">
          G
        </div>
        <h1 className="text-2xl font-bold tracking-tight">GravityCRM</h1>
        <p className="text-sm text-muted-foreground">
          Авторизація та безпечний вхід у робочий простір
        </p>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl border border-border/40">
        <button
          type="button"
          onClick={() => setTab('login')}
          className={`py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'login'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Вхід
        </button>
        <button
          type="button"
          onClick={() => setTab('signup')}
          className={`py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'signup'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Реєстрація
        </button>
      </div>

      {/* Auth Error or Success Alert */}
      {activeState?.error && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2.5 animate-in fade-in-50">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{activeState.error}</span>
        </div>
      )}

      {activeState?.success && activeState?.message && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-start gap-2.5 animate-in fade-in-50">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{activeState.message}</span>
        </div>
      )}

      <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-sm">
        {tab === 'login' ? (
          <form action={runLoginAction}>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold">Вхід до системи</CardTitle>
              <CardDescription>
                Введіть ваші облікові дані для доступу
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-1.5" htmlFor="email">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Електронна пошта
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none flex items-center gap-1.5" htmlFor="password">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Пароль
                  </label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full font-medium shadow-sm" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Вхід...
                  </>
                ) : (
                  'Увійти'
                )}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form action={runSignupAction}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold">Створення акаунту</CardTitle>
              <CardDescription>
                Зареєструйте новий робочий простір CRM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-1.5" htmlFor="fullName">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> Повне ім&apos;я (опційно)
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Владислав Борецький"
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-1.5" htmlFor="signup-email">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Електронна пошта
                </label>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-1.5" htmlFor="signup-password">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Пароль
                </label>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-1.5" htmlFor="confirmPassword">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Підтвердження паролю
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full font-medium shadow-sm" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Створення...
                  </>
                ) : (
                  'Зареєструватися'
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>

      <div className="text-center">
        <Badge variant="outline" className="text-[11px] text-muted-foreground border-border/60">
          Захищено Supabase Auth & Strict RLS
        </Badge>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <LoginFormContent />
      </Suspense>
    </div>
  )
}
