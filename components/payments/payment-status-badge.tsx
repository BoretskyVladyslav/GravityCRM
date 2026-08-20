import { Badge } from '@/components/ui/badge'
import type { PaymentStatus } from '@/lib/types'

const statusConfig: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  PAID: {
    label: 'Сплачено (Paid)',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  PENDING: {
    label: 'В очікуванні (Pending)',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  PARTIAL: {
    label: 'Частково (Partial)',
    className: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  REFUNDED: {
    label: 'Повернено (Refunded)',
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  CANCELLED: {
    label: 'Скасовано (Cancelled)',
    className: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
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
