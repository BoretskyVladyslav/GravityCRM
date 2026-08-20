import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, CheckSquare, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Задачі</h1>
          <p className="text-sm text-muted-foreground">
            Операційні задачі, дедлайни та контроль прострочених завдань
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Нова задача
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Пошук задач..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <CheckSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Задач поки немає</CardTitle>
          <CardDescription>
            Модуль задач із автоматичним обчисленням overdue-статусу буде активовано на Phase 8.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
