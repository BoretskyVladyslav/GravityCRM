import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> На головну
          </Link>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-extrabold text-xl shadow-lg">
            G
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Вхід у GravityCRM</h1>
          <p className="text-sm text-muted-foreground">
            Введіть ваші облікові дані для доступу до панелі управління
          </p>
        </div>

        <Card className="border-border/60 shadow-xl bg-card/80 backdrop-blur-sm">
          <form>
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-semibold">Авторизація</CardTitle>
              <CardDescription>
                Використовуйте email та пароль вашого акаунту
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5" htmlFor="email">
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
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5" htmlFor="password">
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
              <Button type="submit" className="w-full font-medium shadow-sm">
                Увійти
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Повна функціональність Auth та RLS буде розгорнута на Phase 4.
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
