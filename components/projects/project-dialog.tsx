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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Edit2, AlertCircle } from 'lucide-react'
import { createProject, updateProject } from '@/app/(dashboard)/projects/actions'
import type { Project, ProjectStatus, Currency } from '@/lib/types'

interface ProjectDialogProps {
  project?: Project
  clients?: Array<{ id: string; full_name: string; company: string | null }>
  defaultClientId?: string
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ProjectDialog({
  project,
  clients = [],
  defaultClientId,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ProjectDialogProps) {
  const isEditing = !!project
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState<string>(
    project?.client_id || defaultClientId || (clients[0]?.id || '')
  )
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'LEAD')
  const [currency, setCurrency] = useState<Currency>(project?.currency || 'USD')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!clientId) {
      setError('Будь ласка, оберіть клієнта для проєкту')
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('client_id', clientId)
    formData.set('status', status)
    formData.set('currency', currency)

    try {
      const result = isEditing
        ? await updateProject(project.id, null, formData)
        : await createProject(null, formData)

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
                  <Edit2 className="h-4 w-4" /> Редагувати
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Створити проєкт
                </>
              )}
            </Button>
          }
        />
      ) : null}

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редагування проєкту' : 'Новий проєкт'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Оновіть інформацію, бюджет та дедлайни проєкту.'
              : 'Створіть проєкт із прив’язкою до клієнта для фіксації задач та оплат.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Client selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Клієнт / Замовник <span className="text-destructive">*</span>
            </label>
            {clients.length > 0 ? (
              <Select
                value={clientId}
                onValueChange={(val) => {
                  if (val) setClientId(val)
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Оберіть клієнта" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name} {c.company ? `(${c.company})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                Спочатку додайте хоча б одного клієнта на сторінці &quot;Клієнти&quot;.
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="title">
              Назва проєкту <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              name="title"
              defaultValue={project?.title || ''}
              placeholder="Наприклад: Розробка веб-сервісу на Next.js"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="description">
              Короткий опис / Задачі
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description || ''}
              placeholder="Основні вимоги, обсяг робіт або очікувані результати..."
              rows={2}
            />
          </div>

          {/* Budget and Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="budget">
                Бюджет проєкту
              </label>
              <Input
                id="budget"
                name="budget"
                type="number"
                step="0.01"
                min="0"
                defaultValue={project?.budget !== undefined ? project.budget : 0}
                placeholder="1500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Валюта
              </label>
              <Select
                value={currency}
                onValueChange={(val) => {
                  if (val) setCurrency(val as Currency)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="USD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="UAH">UAH (₴)</SelectItem>
                  <SelectItem value="PLN">PLN (zł)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Статус життєвого циклу
            </label>
            <Select
              value={status}
              onValueChange={(val) => {
                if (val) setStatus(val as ProjectStatus)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Оберіть статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LEAD">Лід (Lead)</SelectItem>
                <SelectItem value="PLANNING">Планування (Planning)</SelectItem>
                <SelectItem value="IN_PROGRESS">В роботі (In Progress)</SelectItem>
                <SelectItem value="WAITING_CLIENT">Очікує клієнта (Waiting Client)</SelectItem>
                <SelectItem value="WAITING_PAYMENT">Очікує оплати (Waiting Payment)</SelectItem>
                <SelectItem value="REVISIONS">Правки / Ревізія (Revisions)</SelectItem>
                <SelectItem value="COMPLETED">Завершено (Completed)</SelectItem>
                <SelectItem value="CANCELLED">Скасовано (Cancelled)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="start_date">
                Дата старту
              </label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={project?.start_date || ''}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="deadline">
                Дедлайн (Deadline)
              </label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={project?.deadline || ''}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="notes">
              Технічні нотатки / Посилання
            </label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={project?.notes || ''}
              placeholder="Посилання на Figma, репозиторій, доступи..."
              rows={2}
            />
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
            <Button type="submit" disabled={isLoading || clients.length === 0} className="gap-1.5 shadow-sm">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Збереження...
                </>
              ) : isEditing ? (
                'Зберегти зміни'
              ) : (
                'Створити проєкт'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
