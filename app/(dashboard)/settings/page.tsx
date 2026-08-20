import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, Bot, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Налаштування</h1>
        <p className="text-sm text-muted-foreground">
          Конфігурація системи, інтеграцій та параметрів безпеки
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Row-Level Security
              </CardTitle>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500">
                Enabled
              </Badge>
            </div>
            <CardDescription>
              Статус захисту даних та політик авторизації користувача
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <div>• Правило безпеки: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">auth.uid() = owner_id</code></div>
            <div>• Ізоляція сесій через Supabase SSR Helpers</div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> Telegram Webhook
              </CardTitle>
              <Badge variant="outline" className="border-primary/30 text-primary">
                Configured
              </Badge>
            </div>
            <CardDescription>
              Статус підключення Telegram Bot API та Edge Functions
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <div>• Endpoint: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/api/telegram/webhook</code></div>
            <div>• Ідемпотентність: перевірка update_id</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
