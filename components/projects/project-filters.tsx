'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Loader2 } from 'lucide-react'

interface ProjectFiltersProps {
  clients?: Array<{ id: string; full_name: string; company: string | null }>
}

export function ProjectFilters({ clients = [] }: ProjectFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentClientId = searchParams.get('clientId') || 'ALL'

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleReset() {
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasFilters =
    currentSearch ||
    (currentStatus && currentStatus !== 'ALL') ||
    (currentClientId && currentClientId !== 'ALL')

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за назвою проєкту або описом..."
          defaultValue={currentSearch}
          onChange={(e) => updateQuery('search', e.target.value)}
          className="pl-9 pr-8"
        />
        {isPending && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <Select
          value={currentStatus}
          onValueChange={(val) => {
            if (val) updateQuery('status', val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Всі статуси" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Всі статуси</SelectItem>
            <SelectItem value="LEAD">Лід (Lead)</SelectItem>
            <SelectItem value="PLANNING">Планування (Planning)</SelectItem>
            <SelectItem value="IN_PROGRESS">В роботі (In Progress)</SelectItem>
            <SelectItem value="WAITING_CLIENT">Очікує клієнта (Waiting)</SelectItem>
            <SelectItem value="WAITING_PAYMENT">Очікує оплати</SelectItem>
            <SelectItem value="REVISIONS">Правки (Revisions)</SelectItem>
            <SelectItem value="COMPLETED">Завершено (Completed)</SelectItem>
            <SelectItem value="CANCELLED">Скасовано (Cancelled)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Filter */}
      {clients.length > 0 && (
        <div className="w-full sm:w-48">
          <Select
            value={currentClientId}
            onValueChange={(val) => {
              if (val) updateQuery('clientId', val)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Всі клієнти" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Всі клієнти</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reset Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground gap-1 self-center"
        >
          <X className="h-3.5 w-3.5" /> Скинути
        </Button>
      )}
    </div>
  )
}
