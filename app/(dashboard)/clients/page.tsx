import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Users, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Клієнти</h1>
          <p className="text-sm text-muted-foreground">
            Управління клієнтами, лідами та джерелами лідогенерації
          </p>
        </div>
        <Button className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Додати клієнта
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Пошук клієнтів за ім'ям, email або Telegram..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Card className="border-border/60">
        <CardHeader className="text-center py-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">Клієнтів поки немає</CardTitle>
          <CardDescription>
            Модуль клієнтів з повною підтримкою RLS та Supabase буде активовано на Phase 5.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
