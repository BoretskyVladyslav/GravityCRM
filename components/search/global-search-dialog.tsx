'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Users,
  FolderKanban,
  CheckSquare,
  CreditCard,
  Loader2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { globalSearch, type GlobalSearchResults } from '@/app/(dashboard)/actions'

export function GlobalSearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResults>({
    clients: [],
    projects: [],
    tasks: [],
    payments: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Execute search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults({ clients: [], projects: [], tasks: [], payments: [] })
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      const res = await globalSearch(query)
      setResults(res)
      setIsSearching(false)
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [query])

  function handleSelect(url: string) {
    setOpen(false)
    router.push(url)
  }

  const totalResultsCount =
    results.clients.length +
    results.projects.length +
    results.tasks.length +
    results.payments.length

  return (
    <>
      {/* Search Bar Button in Header */}
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full max-w-sm justify-between rounded-xl bg-card/60 text-xs text-muted-foreground shadow-xs hover:bg-accent hover:text-accent-foreground sm:w-64 md:w-80 px-3 border-border/60"
      >
        <span className="inline-flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Глобальний пошук...</span>
        </span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Global Command Palette Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <CommandInput
            placeholder="Шукайте клієнтів, проєкти, задачі чи платежі..."
            value={query}
            onValueChange={setQuery}
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <CommandList className="max-h-[380px] p-2">
          {!query.trim() && (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <Sparkles className="h-8 w-8 mx-auto text-primary opacity-60 mb-2" />
              <p className="font-medium text-foreground">Глобальний пошуковий хаб GravityCRM</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Введіть ім&apos;я клієнта, @username, назву проєкту, заголовок задачі чи призначення платежу.
              </p>
            </div>
          )}

          {query.trim() && !isSearching && totalResultsCount === 0 && (
            <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
              За запитом &quot;{query}&quot; нічого не знайдено.
            </CommandEmpty>
          )}

          {/* Group 1: Clients */}
          {results.clients.length > 0 && (
            <CommandGroup heading="Клієнти та ліди">
              {results.clients.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`client-${c.title}-${c.subtitle}`}
                  onSelect={() => handleSelect(c.url)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                      <Users className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{c.title}</div>
                      {c.subtitle && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {c.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {c.badge && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {c.badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-60" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Group 2: Projects */}
          {results.projects.length > 0 && (
            <CommandGroup heading="Проєкти">
              {results.projects.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`project-${p.title}-${p.subtitle}`}
                  onSelect={() => handleSelect(p.url)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                      <FolderKanban className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{p.title}</div>
                      {p.subtitle && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {p.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.badge && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {p.badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-60" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Group 3: Tasks */}
          {results.tasks.length > 0 && (
            <CommandGroup heading="Задачі">
              {results.tasks.map((t) => (
                <CommandItem
                  key={t.id}
                  value={`task-${t.title}-${t.subtitle}`}
                  onSelect={() => handleSelect(t.url)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <CheckSquare className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{t.title}</div>
                      {t.subtitle && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {t.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {t.badge && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {t.badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-60" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Group 4: Payments */}
          {results.payments.length > 0 && (
            <CommandGroup heading="Платежі">
              {results.payments.map((pay) => (
                <CommandItem
                  key={pay.id}
                  value={`payment-${pay.title}-${pay.subtitle}`}
                  onSelect={() => handleSelect(pay.url)}
                  className="flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <CreditCard className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-emerald-400 truncate">{pay.title}</div>
                      {pay.subtitle && (
                        <div className="text-[11px] text-muted-foreground truncate">
                          {pay.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {pay.badge && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {pay.badge}
                      </Badge>
                    )}
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-60" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
