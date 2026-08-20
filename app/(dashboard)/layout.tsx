import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CreditCard,
  CheckSquare,
  Settings,
  ShieldAlert,
  LogOut,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/60 bg-card/40 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight">GravityCRM</span>
              <span className="text-[10px] text-muted-foreground">Workspace v0.1</span>
            </div>
          </div>

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

        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 text-primary shrink-0" />
            <span>RLS Active (Phase 1-2)</span>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Вийти</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border/60 px-6 flex items-center justify-between bg-card/20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              Development Environment
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Phase 2: Project Setup Active
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
