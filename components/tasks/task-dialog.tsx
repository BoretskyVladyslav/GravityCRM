'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Edit2, AlertCircle, CheckSquare } from 'lucide-react'
import { createTask, updateTask } from '@/app/(dashboard)/tasks/actions'
import type { Task, TaskStatus } from '@/lib/types'

interface TaskDialogProps {
  task?: Task
  clients?: Array<{ id: string; full_name: string; company: string | null }>
  projects?: Array<{ id: string; client_id: string; title: string }>
  defaultClientId?: string
  defaultProjectId?: string
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TaskDialog({
  task,
  clients = [],
  projects = [],
  defaultClientId,
  defaultProjectId,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: TaskDialogProps) {
  const isEditing = !!task
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState<string>(
    task?.client_id || defaultClientId || 'NONE'
  )
  const [projectId, setProjectId] = useState<string>(
    task?.project_id || defaultProjectId || 'NONE'
  )
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'OPEN')

  // Filter projects by selected client if selected
  const availableProjects =
    clientId && clientId !== 'NONE'
      ? projects.filter((p) => p.client_id === clientId)
      : projects

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('client_id', clientId === 'NONE' ? '' : clientId)
    formData.set('project_id', projectId === 'NONE' ? '' : projectId)
    formData.set('status', status)

    try {
      const result = isEditing
        ? await updateTask(task.id, null, formData)
        : await createTask(null, formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      setIsOpen(false)
    } catch (err: any) {
      setError(err.message || 'Виникла непередбачувана помилка')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger render={trigger} />
      ) : !isControlled ? (
        <DialogTrigger
          render={
            <Button className="gap-2 shadow-sm">
              {isEditing ? (
                <>
                  <Edit2 className="h-4 w-4" /> Редагувати задачу
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Додати задачу
                </>
              )}
            </Button>
          }
        />
      ) : null}

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редагування задачі' : 'Нова задача'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Оновіть зміст, термін або прив’язку задачі.'
              : 'Створіть задачу чи чек-лист для контролю термінів розробки.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="title">
              Назва завдання <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={task?.title || ''}
              placeholder="Наприклад: Зверстати сторінку дашборду"
              required
            />
          </div>

          {/* Due date */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="due_date">
              Дедлайн (Due Date)
            </label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={task?.due_date || ''}
            />
          </div>

          {/* Client selector (optional) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Клієнт (опційно)
            </label>
            <Select
              value={clientId}
              onValueChange={(val) => {
                if (val) {
                  setClientId(val)
                  const clientProjects = projects.filter((p) => p.client_id === val)
                  if (projectId !== 'NONE' && !clientProjects.some((p) => p.id === projectId)) {
                    setProjectId('NONE')
                  }
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Без прив'язки до клієнта" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Без прив&apos;язки до клієнта</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.full_name} {c.company ? `(${c.company})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project selector (optional) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Проєкт (опційно)
            </label>
            <Select
              value={projectId}
              onValueChange={(val) => {
                if (val) setProjectId(val)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Без прив'язки до проєкту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Без прив&apos;язки до проєкту</SelectItem>
                {availableProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Статус
            </label>
            <Select
              value={status}
              onValueChange={(val) => {
                if (val) setStatus(val as TaskStatus)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Оберіть статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Відкрито (Open)</SelectItem>
                <SelectItem value="DONE">Виконано (Done)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-1.5 shadow-sm">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Збереження...
                </>
              ) : isEditing ? (
                'Зберегти зміни'
              ) : (
                'Створити задачу'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
