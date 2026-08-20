import { Badge } from '@/components/ui/badge'
import type { ClientStatus } from '@/lib/types'

const statusConfig: Record<
  ClientStatus,
  { label: string; className: string }
> = {
  LEAD: {
    label: 'Лід',
    className: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  ACTIVE: {
    label: 'Активний',
    className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  CLIENT: {
    label: 'Клієнт',
    className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  PAUSED: {
    label: 'Пауза',
    className: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  INACTIVE: {
    label: 'Неактивний',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  ARCHIVED: {
    label: 'В архіві',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
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
