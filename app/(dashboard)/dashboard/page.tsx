import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FolderKanban,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Дашборд</h1>
        <p className="text-sm text-muted-foreground">
          Огляд ключових показників та завдань на сьогодні
        </p>
      </div>

      {/* 4 Core Blocks from Phase 0 Discovery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Block 1: Сьогодні */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Сьогодні</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Нові ліди:</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Прострочені задачі:</span>
              <Badge variant="destructive" className="px-1.5 py-0 text-xs">0</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Потрібна відповідь:</span>
              <span className="font-semibold">0</span>
            </div>
          </CardContent>
        </Card>

        {/* Block 2: Проєкти */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Проєкти</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">В роботі (Active):</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Очікування (Waiting):</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Завершені (Completed):</span>
              <span className="font-semibold text-emerald-500">0</span>
            </div>
          </CardContent>
        </Card>

        {/* Block 3: Гроші */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Гроші (On-the-Fly)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Загальний бюджет:</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Оплачено:</span>
              <span className="font-semibold text-emerald-500">$0.00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Залишок (Outstanding):</span>
              <span className="font-semibold text-amber-500">$0.00</span>
            </div>
          </CardContent>
        </Card>

        {/* Block 4: Клієнти */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Клієнти</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Всього клієнтів:</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Активні:</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Нові цього місяця:</span>
              <span className="font-semibold text-primary">0</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Readiness Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm">
              <span className="font-semibold">Phase 2 завершено успішно:</span> Next.js 16, shadcn/ui, Supabase helpers та типізацію підключено.
            </div>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">
            Готово до Phase 3 (Database & RLS)
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
