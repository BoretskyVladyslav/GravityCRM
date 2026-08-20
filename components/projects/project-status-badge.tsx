import { Badge } from '@/components/ui/badge'
import type { ProjectStatus } from '@/lib/types'

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  LEAD: {
    label: 'Лід',
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  PLANNING: {
    label: 'Планування',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  IN_PROGRESS: {
    label: 'В роботі',
    className: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  WAITING_CLIENT: {
    label: 'Очікує клієнта',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  WAITING_PAYMENT: {
    label: 'Очікує оплати',
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  REVISIONS: {
    label: 'Правки / Ревізія',
    className: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  COMPLETED: {
    label: 'Завершено',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  CANCELLED: {
    label: 'Скасовано',
    className: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground',
  }

  return (
    <Badge variant="outline" className={`font-medium ${config.className}`}>
      {config.label}
    </Badge>
  )
}
