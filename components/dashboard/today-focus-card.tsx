'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Clock,
  AlertTriangle,
  Calendar,
  UserPlus,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { TaskItem, type TaskWithRelations } from '@/components/tasks'
import type { Client } from '@/lib/types'

interface TodayFocusCardProps {
  newLeadsCount: number
  recentLeads: Client[]
  overdueTasksCount: number
  dueTodayTasksCount: number
  urgentTasks: TaskWithRelations[]
  unansweredClientsCount: number
}

export function TodayFocusCard({
  newLeadsCount,
  recentLeads,
  overdueTasksCount,
  dueTodayTasksCount,
  urgentTasks,
  unansweredClientsCount,
}: TodayFocusCardProps) {
  const hasUrgentItems = overdueTasksCount > 0 || dueTodayTasksCount > 0 || newLeadsCount > 0

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>Сьогодні (Фокус дня)</span>
          </CardTitle>
          <Badge
            variant="outline"
            className={
              hasUrgentItems
                ? 'border-amber-500/30 text-amber-400 font-medium'
                : 'border-emerald-500/30 text-emerald-400 font-medium'
            }
          >
            {hasUrgentItems ? 'Потребує уваги' : 'Усе під контролем'}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Оперативні задачі, нові запити та дедлайни
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* KPI Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            href="/clients?status=LEAD"
            className="p-2.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Нові ліди</span>
              <UserPlus className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <span className="text-lg font-bold text-blue-400 mt-1">{newLeadsCount}</span>
          </Link>

          <Link
            href="/tasks?tab=overdue"
            className="p-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Прострочено</span>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            </div>
            <span className="text-lg font-bold text-rose-400 mt-1">{overdueTasksCount}</span>
          </Link>

          <Link
            href="/tasks?tab=today"
            className="p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>На сьогодні</span>
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <span className="text-lg font-bold text-amber-400 mt-1">{dueTodayTasksCount}</span>
          </Link>

          <Link
            href="/clients"
            className="p-2.5 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/20 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Очікують відповіді</span>
              <MessageSquare className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <span className="text-lg font-bold text-purple-400 mt-1">
              {unansweredClientsCount}
            </span>
          </Link>
        </div>

        {/* Priority tasks mini list */}
        {urgentTasks.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-border/40">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Пріоритетні задачі
            </span>
            <div className="space-y-1.5">
              {urgentTasks.slice(0, 3).map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/tasks"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Перейти до всіх задач</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
