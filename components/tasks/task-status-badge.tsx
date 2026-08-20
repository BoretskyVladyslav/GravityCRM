import { Badge } from '@/components/ui/badge'
import type { TaskStatus } from '@/lib/types'

export function isTaskOverdue(dueDate: string | null | undefined, status: TaskStatus): boolean {
  if (status === 'DONE' || !dueDate) return false
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

export function isTaskDueToday(dueDate: string | null | undefined, status: TaskStatus): boolean {
  if (status === 'DONE' || !dueDate) return false
  const due = new Date(dueDate)
  const today = new Date()
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  )
}

export function TaskStatusBadge({
  status,
  dueDate,
}: {
  status: TaskStatus
  dueDate?: string | null
}) {
  if (status === 'DONE') {
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-medium">
        Виконано
      </Badge>
    )
  }

  if (isTaskOverdue(dueDate, status)) {
    return (
      <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-medium">
        Прострочено
      </Badge>
    )
  }

  if (isTaskDueToday(dueDate, status)) {
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-medium">
        Сьогодні
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/20 font-medium">
      Відкрито
    </Badge>
  )
}
