'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, ArrowRight, TrendingUp, CreditCard, Clock } from 'lucide-react'
import type { Currency } from '@/lib/types'

interface FinancialSummaryCardProps {
  totalBudget: number
  totalPaid: number
  totalOutstanding: number
  currencyBreakdown: Record<Currency, { budget: number; paid: number }>
}

export function FinancialSummaryCard({
  totalBudget,
  totalPaid,
  totalOutstanding,
  currencyBreakdown,
}: FinancialSummaryCardProps) {
  const percentCollected =
    totalBudget > 0 ? Math.min(100, Math.round((totalPaid / totalBudget) * 100)) : 0

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-400" />
            <span>Гроші (Фінансовий баланс)</span>
          </CardTitle>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-medium text-xs">
            {percentCollected}% зібрано
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Розрахунок доходів та залишків на льоту (без дублювання)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main 3 Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-card border border-border/60 flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground">Загальний бюджет</span>
            <span className="text-lg font-bold text-foreground mt-1">
              ${totalBudget.toFixed(0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-emerald-400" /> Оплачено
            </span>
            <span className="text-lg font-bold text-emerald-400 mt-1">
              ${totalPaid.toFixed(0)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col justify-between">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" /> Залишок
            </span>
            <span className="text-lg font-bold text-amber-400 mt-1">
              ${totalOutstanding.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Прогрес виконання надходжень</span>
            <span>{percentCollected}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${percentCollected}%` }}
            />
          </div>
        </div>

        {/* Currency badges */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {Object.entries(currencyBreakdown).map(([curr, data]) => {
            if (data.budget === 0 && data.paid === 0) return null
            return (
              <Badge key={curr} variant="secondary" className="text-[10px] py-0.5 font-mono">
                {curr}: Сплачено {data.paid.toFixed(0)} / {data.budget.toFixed(0)}
              </Badge>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/payments"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Перейти до фінансів</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
