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

export function ClientFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentSource = searchParams.get('source') || 'ALL'

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
    (currentSource && currentSource !== 'ALL')

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за ім'ям, email, компанією, username..."
          defaultValue={currentSearch}
          onChange={(e) => updateQuery('search', e.target.value)}
          className="pl-9 pr-8"
        />
        {isPending && (
          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-44">
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
            <SelectItem value="ACTIVE">Активний (Active)</SelectItem>
            <SelectItem value="CLIENT">Клієнт (Client)</SelectItem>
            <SelectItem value="PAUSED">Пауза (Paused)</SelectItem>
            <SelectItem value="INACTIVE">Неактивний (Inactive)</SelectItem>
            <SelectItem value="ARCHIVED">В архіві (Archived)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Source Filter */}
      <div className="w-full sm:w-44">
        <Select
          value={currentSource}
          onValueChange={(val) => {
            if (val) updateQuery('source', val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Всі джерела" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Всі джерела</SelectItem>
            <SelectItem value="FREELANCEHUNT">Freelancehunt</SelectItem>
            <SelectItem value="TELEGRAM">Telegram</SelectItem>
            <SelectItem value="REFERRAL">Рекомендація</SelectItem>
            <SelectItem value="WEBSITE">Веб-сайт</SelectItem>
            <SelectItem value="OTHER">Інше</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Filters */}
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
