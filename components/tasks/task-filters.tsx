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
import { Search, X, Loader2, Calendar, Clock, AlertTriangle, CheckSquare, CheckCircle2 } from 'lucide-react'

interface TaskFiltersProps {
  clients?: Array<{ id: string; full_name: string; company: string | null }>
  projects?: Array<{ id: string; title: string }>
  counts?: {
    all: number
    today: number
    overdue: number
    open: number
    done: number
  }
}

export function TaskFilters({
  clients = [],
  projects = [],
  counts = { all: 0, today: 0, overdue: 0, open: 0, done: 0 },
}: TaskFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentTab = searchParams.get('tab') || 'all'
  const currentSearch = searchParams.get('search') || ''
  const currentClientId = searchParams.get('clientId') || 'ALL'
  const currentProjectId = searchParams.get('projectId') || 'ALL'

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'ALL' && value !== 'all') {
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
    (currentTab && currentTab !== 'all') ||
    currentSearch ||
    (currentClientId && currentClientId !== 'ALL') ||
    (currentProjectId && currentProjectId !== 'ALL')

  const filterTabs = [
    { id: 'all', label: 'Усі', count: counts.all, icon: CheckSquare },
    { id: 'open', label: 'Відкриті', count: counts.open, icon: Clock },
    { id: 'today', label: 'Сьогодні', count: counts.today, icon: Calendar, highlight: 'text-amber-400' },
    { id: 'overdue', label: 'Прострочені', count: counts.overdue, icon: AlertTriangle, highlight: 'text-rose-400' },
    { id: 'done', label: 'Виконані', count: counts.done, icon: CheckCircle2, highlight: 'text-emerald-400' },
  ]

  return (
    <div className="space-y-3">
      {/* Quick Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const isActive = currentTab === tab.id
          const Icon = tab.icon

          return (
            <Button
              key={tab.id}
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => updateQuery('tab', tab.id)}
              className={`rounded-xl text-xs gap-1.5 shrink-0 ${
                isActive ? 'font-semibold shadow-xs' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${tab.highlight || ''}`} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  isActive
                    ? 'bg-background text-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            </Button>
          )
        })}
      </div>

      {/* Search & Dropdown Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Пошук завдання..."
            defaultValue={currentSearch}
            onChange={(e) => updateQuery('search', e.target.value)}
            className="pl-9 pr-8"
          />
          {isPending && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
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

        {/* Project Filter */}
        {projects.length > 0 && (
          <div className="w-full sm:w-48">
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
    </div>
  )
}
