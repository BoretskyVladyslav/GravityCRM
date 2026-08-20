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
import { toast } from 'sonner'
import { updateClientStatus } from '@/app/(dashboard)/clients/actions'
import type { ClientStatus } from '@/lib/types'

export function ClientStatusSelect({
  clientId,
  currentStatus,
}: {
  clientId: string
  currentStatus: ClientStatus
}) {
  const [status, setStatus] = useState<ClientStatus>(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  async function handleStatusChange(newStatus: ClientStatus) {
    if (newStatus === status) return
    setIsLoading(true)
    setStatus(newStatus)
    try {
      const res = await updateClientStatus(clientId, newStatus)
      if (res?.error) {
        toast.error(res.error)
        setStatus(currentStatus)
      } else {
        toast.success(`Статус клієнта змінено на ${newStatus}`)
      }
    } catch (err: any) {
      toast.error(err.message || 'Не вдалося змінити статус')
      setStatus(currentStatus)
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={status}
        onValueChange={(val) => {
          if (val) handleStatusChange(val as ClientStatus)
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-36 h-8 text-xs font-medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="LEAD">Лід (Lead)</SelectItem>
          <SelectItem value="ACTIVE">Активний (Active)</SelectItem>
          <SelectItem value="CLIENT">Клієнт (Client)</SelectItem>
          <SelectItem value="PAUSED">Пауза (Paused)</SelectItem>
          <SelectItem value="INACTIVE">Неактивний (Inactive)</SelectItem>
          <SelectItem value="ARCHIVED">В архіві (Archived)</SelectItem>
        </SelectContent>
      </Select>
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
    </div>
  )
}
