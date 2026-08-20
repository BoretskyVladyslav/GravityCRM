import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ShieldCheck, Zap, Bot, Layers, DollarSign, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-background">
      {/* Decorative gradient blur */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-[400px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <header className="border-b border-border/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              G
            </div>
            <span className="text-xl font-bold tracking-tight">GravityCRM</span>
            <Badge variant="outline" className="ml-2 text-xs font-normal border-primary/30 text-primary">
              Phase 2 Active
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Вхід
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-1.5 shadow-sm">
                Дашборд <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 px-3 py-1 font-medium" variant="secondary">
            Next.js 16 + React 19 + Supabase RLS
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
            Сучасна CRM для фриланс-проєктів нового покоління
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Повний контроль над клієнтами, проєктами, оплатами на льоту та автоматичною Telegram-інтеграцією без компромісів у безпеці.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base font-semibold shadow-md">
                Відкрити робочий простір <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-base">
                Авторизація
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Strict RLS & Security</CardTitle>
              <CardDescription>
                Захист даних на рівні рядків PostgreSQL з першої міграції. Ізоляція власника акаунта.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Готово до Phase 3
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                <DollarSign className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Calculated on the Fly</CardTitle>
              <CardDescription>
                Розрахунок балансу та оплат на льоту без дублювання денормалізованих полів.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Архітектура затверджена
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Bot className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Telegram Edge Webhook</CardTitle>
              <CardDescription>
                Ідемпотентна обробка вхідних повідомлень з перевіркою секретних токенів та update_id.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Ендпоінт сконфігуровано
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GravityCRM © 2026. Phase 2 Setup Completed.</span>
          <span className="text-xs text-muted-foreground/80">Next.js 16 • Supabase • Tailwind CSS</span>
        </div>
      </footer>
    </div>
  )
}
