'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Send,
  Mail,
  Briefcase,
  MessageCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Loader2,
  FolderKanban,
} from 'lucide-react'
import { deleteCommunicationLog } from '@/app/(dashboard)/clients/communication-actions'
import type { CommunicationLog, CommunicationChannel, MessageDirection } from '@/lib/types'

const channelConfig: Record<
  CommunicationChannel,
  { label: string; icon: any; className: string }
> = {
  TELEGRAM: {
    label: 'Telegram',
    icon: Send,
    className: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  FREELANCEHUNT: {
    label: 'Freelancehunt',
    icon: Briefcase,
    className: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
  EMAIL: {
    label: 'Email',
    icon: Mail,
    className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  OTHER: {
    label: 'Інше',
    icon: MessageCircle,
    className: 'bg-muted text-muted-foreground border-border',
  },
}

interface CommunicationItemProps {
  log: CommunicationLog & {
    projects?: { id: string; title: string } | null
  }
}

export function CommunicationItem({ log }: CommunicationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const isIncoming = log.direction === 'INCOMING'
  const channel = channelConfig[log.channel] || channelConfig.OTHER
  const ChannelIcon = channel.icon

  const formattedDate = new Date(log.created_at).toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const formattedTime = new Date(log.created_at).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  })

  async function handleDelete() {
    if (!confirm('Видалити цей запис з історії комунікацій?')) return
    setIsDeleting(true)
    await deleteCommunicationLog(log.id)
    setIsDeleting(false)
  }

  return (
    <div className="group relative p-4 rounded-xl bg-card border border-border/60 hover:border-border transition-all shadow-xs space-y-2">
      {/* Header with Direction, Channel, Date & Delete button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Direction indicator */}
          <div
            className={`h-6 px-2 rounded-md flex items-center gap-1 text-[11px] font-semibold ${
              isIncoming
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {isIncoming ? (
              <>
                <ArrowDownLeft className="h-3 w-3" /> Вхідне
              </>
            ) : (
              <>
                <ArrowUpRight className="h-3 w-3" /> Вихідне
              </>
            )}
          </div>

          {/* Channel badge */}
          <Badge variant="outline" className={`gap-1 text-[11px] py-0.5 ${channel.className}`}>
            <ChannelIcon className="h-3 w-3" /> {channel.label}
          </Badge>

          {/* Project tag if linked */}
          {log.projects && (
            <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 max-w-[160px] truncate">
              <FolderKanban className="h-3 w-3 text-muted-foreground" /> {log.projects.title}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {formattedDate}, {formattedTime}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Message content */}
      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
        {log.message}
      </p>
    </div>
  )
}
