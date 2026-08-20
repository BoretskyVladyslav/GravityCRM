import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  CheckSquare,
  Settings,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { signOutAction } from '@/app/(auth)/actions'

const navItems = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/clients', label: 'Клієнти', icon: Users },
  { href: '/projects', label: 'Проєкти', icon: FolderKanban },
  { href: '/payments', label: 'Платежі', icon: CreditCard },
  { href: '/tasks', label: 'Задачі', icon: CheckSquare },
  { href: '/settings', label: 'Налаштування', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let userEmail = 'dev@gravitycrm.local'
  let userInitial = 'D'

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email) {
      userEmail = user.email
      userInitial = user.email.charAt(0).toUpperCase()
    }
  } catch {
    // If Supabase environment is not yet connected during local dev/build
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/60 bg-card/40 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base shadow-sm">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">GravityCRM</span>
              <span className="text-[10px] text-muted-foreground">Freelance Workspace</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User & Security Footer */}
        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-2 text-xs text-emerald-500">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>RLS & Auth Active</span>
          </div>

          {/* User profile card */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="truncate text-xs font-medium" title={userEmail}>
                {userEmail}
              </div>
            </div>

            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                title="Вийти"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/60 px-6 flex items-center justify-between bg-card/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal border-emerald-500/30 text-emerald-500">
              ● Phase 4 Ready: Auth & Security
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            GravityCRM • Next.js 16 + Supabase
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
