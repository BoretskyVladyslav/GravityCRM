import { Badge } from '@/components/ui/badge'
import { Send, Globe, Users, HelpCircle, Briefcase } from 'lucide-react'
import type { ClientSource } from '@/lib/types'

const sourceConfig: Record<
  ClientSource,
  { label: string; icon: any; className: string }
> = {
  FREELANCEHUNT: {
    label: 'Freelancehunt',
    icon: Briefcase,
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  TELEGRAM: {
    label: 'Telegram',
    icon: Send,
    className: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  REFERRAL: {
    label: 'Рекомендація',
    icon: Users,
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  WEBSITE: {
    label: 'Веб-сайт',
    icon: Globe,
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  OTHER: {
    label: 'Інше',
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground border-border/40',
  },
}

export function ClientSourceBadge({ source }: { source: ClientSource }) {
  const config = sourceConfig[source] || {
    label: source,
    icon: HelpCircle,
    className: 'bg-muted text-muted-foreground',
  }
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 font-normal text-xs ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  )
}
