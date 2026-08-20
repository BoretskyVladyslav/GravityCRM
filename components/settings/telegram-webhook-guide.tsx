'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Bot,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Send,
  Sparkles,
} from 'lucide-react'

export function TelegramWebhookGuide() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [botToken, setBotToken] = useState('YOUR_BOT_TOKEN')
  const [secretToken, setSecretToken] = useState('gravity_crm_secret_token_123')
  const [domain, setDomain] = useState('https://your-crm-domain.com')

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const webhookUrl = `${domain}/api/telegram/webhook`
  const curlCommand = `curl -F "url=${webhookUrl}" -F "secret_token=${secretToken}" https://api.telegram.org/bot${botToken}/setWebhook`
  const getInfoCommand = `curl https://api.telegram.org/bot${botToken}/getWebhookInfo`

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Двостороння інтеграція з Telegram Bot</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Автоматичний запис повідомлень, дедуплікація та створення нових лідів
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-sky-500/30 text-sky-400 self-start sm:self-auto">
              Active / Idempotent
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Захист токеном
              </span>
              <p className="text-muted-foreground text-[11px]">
                Перевірка заголовка <code>X-Telegram-Bot-Api-Secret-Token</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" /> Ідемпотентність
              </span>
              <p className="text-muted-foreground text-[11px]">
                Дедуплікація через таблицю <code>telegram_updates_log</code>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/40 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-sky-400" /> Автостворення ліда
              </span>
              <p className="text-muted-foreground text-[11px]">
                Автоматична реєстрація нового контакту зі статусом <code>LEAD</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Helper Card */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" /> Інтерактивний конфігуратор Webhook
          </CardTitle>
          <CardDescription className="text-xs">
            Вкажіть ваш домен та параметри бота для генерації команд налаштування
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inputs for testing command generator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Ваш домен CRM
              </label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://crm.example.com"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Bot Token (@BotFather)
              </label>
              <Input
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456:ABC-DEF..."
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Webhook Secret Token
              </label>
              <Input
                value={secretToken}
                onChange={(e) => setSecretToken(e.target.value)}
                placeholder="my_secret_token_123"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Webhook URLs */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">
                  Next.js Webhook URL:
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(webhookUrl, 'webhookUrl')}
                  className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === 'webhookUrl' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Скопійовано
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Копіювати
                    </>
                  )}
                </Button>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/60 border border-border/40 font-mono text-xs text-sky-400 break-all select-all">
                {webhookUrl}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">
                  1. Команда встановлення вебхука (cURL):
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(curlCommand, 'curlCommand')}
                  className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === 'curlCommand' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Скопійовано
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Копіювати команду
                    </>
                  )}
                </Button>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-border/40 font-mono text-xs text-zinc-300 break-all select-all overflow-x-auto">
                {curlCommand}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">
                  2. Перевірка статусу доставки (cURL):
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(getInfoCommand, 'getInfoCommand')}
                  className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === 'getInfoCommand' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Скопійовано
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Копіювати команду
                    </>
                  )}
                </Button>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-border/40 font-mono text-xs text-zinc-300 break-all select-all overflow-x-auto">
                {getInfoCommand}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
