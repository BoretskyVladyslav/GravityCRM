'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskStatusBadge, isTaskOverdue, isTaskDueToday } from './task-status-badge'
import {
  Check,
  Calendar,
  User,
  FolderKanban,
  Edit2,
  Trash2,
  AlertTriangle,
  Loader2,
  Clock,
} from 'lucide-react'
import { toggleTaskStatus, deleteTask } from '@/app/(dashboard)/tasks/actions'
import type { Task, TaskStatus } from '@/lib/types'

export interface TaskWithRelations extends Task {
  clients?: {
    id: string
    full_name: string
    company: string | null
  } | null
  projects?: {
    id: string
    title: string
  } | null
}

interface TaskItemProps {
  task: TaskWithRelations
  onEdit?: (task: Task) => void
  showClient?: boolean
  showProject?: boolean
}

export function TaskItem({
  task,
  onEdit,
  showClient = true,
  showProject = true,
}: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status)

  const isDone = currentStatus === 'DONE'
  const isOverdue = isTaskOverdue(task.due_date, currentStatus)
  const isToday = isTaskDueToday(task.due_date, currentStatus)

  async function handleToggle() {
    setIsToggling(true)
    const nextStatus: TaskStatus = currentStatus === 'OPEN' ? 'DONE' : 'OPEN'
    setCurrentStatus(nextStatus)

    const res = await toggleTaskStatus(task.id, currentStatus)
    if (res.error) {
      setCurrentStatus(currentStatus) // Revert on failure
    }
    setIsToggling(false)
  }

  async function handleDelete() {
    if (!confirm('Видалити цю задачу?')) return
    setIsDeleting(true)
    await deleteTask(task.id)
    setIsDeleting(false)
  }

  return (
    <div
      className={`group p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDone
          ? 'bg-card/40 border-border/40 opacity-75'
          : isOverdue
          ? 'bg-card border-rose-500/30 shadow-xs'
          : 'bg-card border-border/60 hover:border-border shadow-xs'
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Toggle Checkbox Button */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`h-5 w-5 mt-0.5 sm:mt-0 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            isDone
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : 'border-muted-foreground/40 hover:border-primary/80 bg-background'
          }`}
          aria-label={isDone ? 'Позначити як невиконано' : 'Позначити як виконано'}
        >
          {isToggling ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : isDone ? (
            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          ) : null}
        </button>

        {/* Title and metadata */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium transition-all ${
                isDone ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {task.title}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap text-xs text-muted-foreground">
            {showClient && task.clients && (
              <Link
                href={`/clients/${task.clients.id}`}
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <User className="h-3 w-3 text-muted-foreground" />
                <span>{task.clients.full_name}</span>
              </Link>
            )}

            {showProject && task.projects && (
              <Link
                href={`/projects/${task.projects.id}`}
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <FolderKanban className="h-3 w-3 text-muted-foreground" />
                <span>{task.projects.title}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Right: Date badge, status badge, and actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 text-xs shrink-0 pl-8 sm:pl-0">
        {task.due_date && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span
              className={`font-medium ${
                isDone
                  ? 'text-muted-foreground'
                  : isOverdue
                  ? 'text-rose-400 font-semibold flex items-center gap-1'
                  : isToday
                  ? 'text-amber-400 font-semibold flex items-center gap-1'
                  : 'text-muted-foreground'
              }`}
            >
              {new Date(task.due_date).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'short',
              })}
              {isOverdue && <AlertTriangle className="h-3 w-3 text-rose-400" />}
              {isToday && <Clock className="h-3 w-3 text-amber-400" />}
            </span>
          </div>
        )}

        <TaskStatusBadge status={currentStatus} dueDate={task.due_date} />

        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(task)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
