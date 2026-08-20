'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Send,
  Loader2,
  AlertCircle,
  Briefcase,
  Mail,
  MessageCircle,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { createCommunicationLog } from '@/app/(dashboard)/clients/communication-actions'
import type { CommunicationChannel, MessageDirection } from '@/lib/types'

interface CommunicationFormProps {
  clientId: string
  projectId?: string
  projects?: Array<{ id: string; title: string }>
}

export function CommunicationForm({
  clientId,
  projectId: defaultProjectId,
  projects = [],
}: CommunicationFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [channel, setChannel] = useState<CommunicationChannel>('TELEGRAM')
  const [direction, setDirection] = useState<MessageDirection>('OUTGOING')
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProjectId || 'NONE'
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('client_id', clientId)
    formData.set('channel', channel)
    formData.set('direction', direction)
    if (selectedProjectId && selectedProjectId !== 'NONE') {
      formData.set('project_id', selectedProjectId)
    } else {
      formData.set('project_id', '')
    }

    try {
      const res = await createCommunicationLog(null, formData)
      if (res.error) {
        setError(res.error)
        setIsLoading(false)
        return
      }

      // Reset form text
      formRef.current?.reset()
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message || 'Виникла непередбачувана помилка')
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 rounded-xl bg-card border border-border/60 shadow-xs space-y-3">
      {error && (
        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        {/* Controls row: Channel, Direction, Project */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Direction */}
          <div className="w-36">
            <Select
              value={direction}
              onValueChange={(val) => {
                if (val) setDirection(val as MessageDirection)
              }}
            >
              <SelectTrigger className="h-8 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUTGOING">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ArrowUpRight className="h-3 w-3" /> Вихідне
                  </span>
                </SelectItem>
                <SelectItem value="INCOMING">
                  <span className="flex items-center gap-1 text-blue-400">
                    <ArrowDownLeft className="h-3 w-3" /> Вхідне
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channel */}
          <div className="w-38">
            <Select
              value={channel}
              onValueChange={(val) => {
                if (val) setChannel(val as CommunicationChannel)
              }}
            >
              <SelectTrigger className="h-8 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TELEGRAM">
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3 text-sky-400" /> Telegram
                  </span>
                </SelectItem>
                <SelectItem value="FREELANCEHUNT">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-orange-400" /> Freelancehunt
                  </span>
                </SelectItem>
                <SelectItem value="EMAIL">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-purple-400" /> Email
                  </span>
                </SelectItem>
                <SelectItem value="OTHER">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3 text-muted-foreground" /> Інше
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project (optional if projects list exists and not locked to a specific project) */}
          {projects.length > 0 && !defaultProjectId && (
            <div className="w-48">
              <Select
                value={selectedProjectId}
                onValueChange={(val) => {
                  if (val) setSelectedProjectId(val)
                }}
              >
                <SelectTrigger className="h-8 text-xs font-medium">
                  <SelectValue placeholder="Без проєкту" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Без прив&apos;язки до проєкту</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Textarea */}
        <Textarea
          name="message"
          placeholder="Введіть текст повідомлення, запит клієнта, підсумки дзвінка або коментар..."
          rows={2}
          required
          className="text-sm resize-none"
        />

        {/* Submit row */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">
            Автоматично оновить час останнього контакту клієнта
          </span>
          <Button
            type="submit"
            size="sm"
            disabled={isLoading}
            className="gap-1.5 shadow-xs h-8 text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Збереження...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" /> Зафіксувати
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
