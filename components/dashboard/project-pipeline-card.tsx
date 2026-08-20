'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, ArrowRight, Layers, Clock, RotateCcw, CheckCircle2 } from 'lucide-react'

interface ProjectPipelineCardProps {
  inProgressCount: number
  waitingCount: number
  revisionsCount: number
  completedCount: number
  totalProjects: number
}

export function ProjectPipelineCard({
  inProgressCount,
  waitingCount,
  revisionsCount,
  completedCount,
  totalProjects,
}: ProjectPipelineCardProps) {
  const activeCount = inProgressCount + waitingCount + revisionsCount

  const stages = [
    {
      label: 'В роботі (Active)',
      count: inProgressCount,
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/20',
      href: '/projects?status=IN_PROGRESS',
      icon: Layers,
    },
    {
      label: 'Очікування (Waiting)',
      count: waitingCount,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      href: '/projects?status=WAITING_CLIENT',
      icon: Clock,
    },
    {
      label: 'На ревізії (Revisions)',
      count: revisionsCount,
      color: 'bg-pink-500',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500/20',
      href: '/projects?status=REVISIONS',
      icon: RotateCcw,
    },
    {
      label: 'Завершено (Completed)',
      count: completedCount,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      href: '/projects?status=COMPLETED',
      icon: CheckCircle2,
    },
  ]

  return (
    <Card className="border-border/60 shadow-xs flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-sky-400" />
            <span>Проєкти (Стан пайплайну)</span>
          </CardTitle>
          <Badge variant="secondary" className="font-semibold text-xs">
            {activeCount} в роботі
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Розподіл угод за стадіями розробки
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cumulative pipeline progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Всього проєктів: {totalProjects}</span>
            <span>{totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0}% завершено</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden flex">
            {totalProjects > 0 ? (
              <>
                <div
                  className="bg-sky-500 h-full transition-all"
                  style={{ width: `${(inProgressCount / totalProjects) * 100}%` }}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${(waitingCount / totalProjects) * 100}%` }}
                />
                <div
                  className="bg-pink-500 h-full transition-all"
                  style={{ width: `${(revisionsCount / totalProjects) * 100}%` }}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${(completedCount / totalProjects) * 100}%` }}
                />
              </>
            ) : null}
          </div>
        </div>

        {/* Stages list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {stages.map((stage) => {
            const Icon = stage.icon
            return (
              <Link
                key={stage.label}
                href={stage.href}
                className={`p-2.5 rounded-xl border ${stage.borderColor} bg-card hover:bg-muted/40 transition-colors flex items-center justify-between gap-2`}
              >
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <span className="text-xs text-muted-foreground truncate">{stage.label}</span>
                </div>
                <span className={`text-sm font-bold ${stage.textColor}`}>
                  {stage.count}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Link
            href="/projects"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>Усі проєкти</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
