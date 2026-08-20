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

interface PaymentFiltersProps {
  clients?: Array<{ id: string; full_name: string; company: string | null }>
  projects?: Array<{ id: string; title: string }>
}

export function PaymentFilters({ clients = [], projects = [] }: PaymentFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentCurrency = searchParams.get('currency') || 'ALL'
  const currentClientId = searchParams.get('clientId') || 'ALL'
  const currentProjectId = searchParams.get('projectId') || 'ALL'

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
    (currentCurrency && currentCurrency !== 'ALL') ||
    (currentClientId && currentClientId !== 'ALL') ||
    (currentProjectId && currentProjectId !== 'ALL')

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Пошук за описом або способом..."
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
            <SelectItem value="PAID">Сплачено (Paid)</SelectItem>
            <SelectItem value="PENDING">В очікуванні (Pending)</SelectItem>
            <SelectItem value="PARTIAL">Частково (Partial)</SelectItem>
            <SelectItem value="REFUNDED">Повернено (Refunded)</SelectItem>
            <SelectItem value="CANCELLED">Скасовано (Cancelled)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Currency Filter */}
      <div className="w-full sm:w-32">
        <Select
          value={currentCurrency}
          onValueChange={(val) => {
            if (val) updateQuery('currency', val)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Валюта" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Всі валюти</SelectItem>
            <SelectItem value="USD">USD ($)</SelectItem>
            <SelectItem value="EUR">EUR (€)</SelectItem>
            <SelectItem value="UAH">UAH (₴)</SelectItem>
            <SelectItem value="PLN">PLN (zł)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Filter */}
      {clients.length > 0 && (
        <div className="w-full sm:w-44">
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

      {/* Project Filter */}
      {projects.length > 0 && (
        <div className="w-full sm:w-44">
          <Select
            value={currentProjectId}
            onValueChange={(val) => {
              if (val) updateQuery('projectId', val)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Всі проєкти" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Всі проєкти</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
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
