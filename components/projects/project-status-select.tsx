'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { updateProjectStatus } from '@/app/(dashboard)/projects/actions'
import type { ProjectStatus } from '@/lib/types'

export function ProjectStatusSelect({
  projectId,
  currentStatus,
}: {
  projectId: string
  currentStatus: ProjectStatus
}) {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  async function handleStatusChange(newStatus: ProjectStatus) {
    if (newStatus === status) return
    setIsLoading(true)
    setStatus(newStatus)
    await updateProjectStatus(projectId, newStatus)
    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={(val) => {
          if (val) handleStatusChange(val as ProjectStatus)
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-44 h-8 text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="LEAD">Лід (Lead)</SelectItem>
          <SelectItem value="PLANNING">Планування (Planning)</SelectItem>
          <SelectItem value="IN_PROGRESS">В роботі (In Progress)</SelectItem>
          <SelectItem value="WAITING_CLIENT">Очікує клієнта (Waiting Client)</SelectItem>
          <SelectItem value="WAITING_PAYMENT">Очікує оплати (Waiting Payment)</SelectItem>
          <SelectItem value="REVISIONS">Правки (Revisions)</SelectItem>
          <SelectItem value="COMPLETED">Завершено (Completed)</SelectItem>
          <SelectItem value="CANCELLED">Скасовано (Cancelled)</SelectItem>
        </SelectContent>
      </Select>
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
    </div>
  )
}
