import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TelegramWebhookGuide } from '@/components/settings/telegram-webhook-guide'
import { Settings, Shield, Bot, Database, Server, KeyRound, Lock } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Налаштування та інтеграції</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Конфігурація системи, Webhook інтеграція Telegram, параметри безпеки та RLS
        </p>
      </div>

      {/* Security & RLS Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" /> PostgreSQL Row-Level Security (RLS)
              </CardTitle>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                Active & Strict
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Ізоляція даних за ідентифікатором власника <code>owner_id</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-muted-foreground">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/30">
              <span>Політика безпеки</span>
              <code className="text-[11px] font-mono text-emerald-400">auth.uid() = owner_id</code>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/30">
              <span>Захист маршрутів</span>
              <span className="font-medium text-foreground">Next.js Middleware + Supabase SSR</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Змінні оточення & Секрети
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary text-xs">
                Configured
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Захист доступу до сервісних функцій та Webhook API
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2 text-muted-foreground">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/30">
              <span>Telegram Secret Token</span>
              <code className="text-[11px] font-mono text-foreground">TELEGRAM_WEBHOOK_SECRET</code>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/30">
              <span>Supabase Service Role</span>
              <code className="text-[11px] font-mono text-foreground">SUPABASE_SERVICE_ROLE_KEY</code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Telegram Webhook Interactive Guide */}
      <TelegramWebhookGuide />
    </div>
  )
}
