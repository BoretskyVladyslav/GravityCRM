'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  UserCheck,
  UserPlus,
  ArrowRight,
  Briefcase,
  Send,
  Share2,
  Globe,
  HelpCircle,
} from 'lucide-react'
import type { ClientSource } from '@/lib/types'

interface ClientMetricsCardProps {
  totalClients: number
  activeClients: number
  newThisMonth: number
  sourcesBreakdown: Record<ClientSource, number>
}

const sourceConfig: Record<
  ClientSource,
  { label: string; icon: any; color: string }
> = {
  FREELANCEHUNT: {
    label: 'Freelancehunt',
    icon: Briefcase,
    color: 'text-orange-400',
  },
  TELEGRAM: {
    label: 'Telegram',
    icon: Send,
    color: 'text-sky-400',
  },
  REFERRAL: {
    label: 'Рекомендації',
    icon: Share2,
    color: 'text-purple-400',
  },
  WEBSITE: {
    label: 'Веб-сайт',
    icon: Globe,
    color: 'text-emerald-400',
  },
  OTHER: {
    label: 'Інше',
    icon: HelpCircle,
    color: 'text-muted-foreground',
  },
}

export function ClientMetricsCard({
  totalClients,
  activeClients,
  newThisMonth,
  sourcesBreakdown,
}: ClientMetricsCardProps) {
  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            <span>Клієнти (Метрики бази)</span>
          </CardTitle>
          <Badge variant="secondary" className="font-semibold text-xs">
            +{newThisMonth} цього місяця
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Динаміка залучення лідів та активної клієнтської бази
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Core KPI metrics */}
        <div className="grid grid-cols-3 gap-2.5">
          <Link
            href="/clients"
            className="p-2.5 rounded-xl bg-card border border-border/60 hover:border-border transition-colors flex flex-col justify-between"
          >
            <span className="text-[11px] text-muted-foreground">Всього в базі</span>
            <span className="text-lg font-bold text-foreground mt-1">
              {totalClients}
            </span>
          </Link>

          <Link
            href="/clients?status=ACTIVE"
            className="p-2.5 rounded-xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-colors flex flex-col justify-between"
          >
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <UserCheck className="h-3 w-3 text-emerald-400" /> Активні
            </span>
            <span className="text-lg font-bold text-emerald-400 mt-1">
              {activeClients}
            </span>
          </Link>

          <Link
            href="/clients?status=LEAD"
            className="p-2.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-colors flex flex-col justify-between"
          >
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <UserPlus className="h-3 w-3 text-blue-400" /> Нові ліди
            </span>
            <span className="text-lg font-bold text-blue-400 mt-1">
              {newThisMonth}
            </span>
          </Link>
        </div>

        {/* Source breakdown badges */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Джерела залучення
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(sourceConfig) as ClientSource[]).map((src) => {
              const count = sourcesBreakdown[src] || 0
              const cfg = sourceConfig[src]
              const Icon = cfg.icon

              return (
                <Link
                  key={src}
                  href={`/clients?source=${src}`}
                  className="p-2 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/30 transition-colors flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-1 text-muted-foreground truncate">
                    <Icon className={`h-3 w-3 ${cfg.color}`} />
                    <span className="truncate">{cfg.label}</span>
                  </span>
                  <span className="font-bold ml-1">{count}</span>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/clients"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Усі клієнти</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
