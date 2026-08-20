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
import { toast } from 'sonner'
import { createClient, updateClient } from '@/app/(dashboard)/clients/actions'
import type { Client, ClientSource, ClientStatus } from '@/lib/types'

interface ClientDialogProps {
  client?: Client
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ClientDialog({
  client,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ClientDialogProps) {
  const isEditing = !!client
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [source, setSource] = useState<ClientSource>(client?.source || 'FREELANCEHUNT')
  const [status, setStatus] = useState<ClientStatus>(client?.status || 'LEAD')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('source', source)
    formData.set('status', status)

    try {
      const result = isEditing
        ? await updateClient(client.id, null, formData)
        : await createClient(null, formData)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      toast.success(isEditing ? 'Дані клієнта оновлено' : 'Нового клієнта успішно створено')
      setIsLoading(false)
      setIsOpen(false)
    } catch (err: any) {
      const msg = err.message || 'Виникла непередбачувана помилка'
      setError(msg)
      toast.error(msg)
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
                  <Plus className="h-4 w-4" /> Додати клієнта
                </>
              )}
            </Button>
          }
        />
      ) : null}

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редагування клієнта' : 'Новий клієнт / лід'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Оновіть контактні дані та інформацію про клієнта.'
              : 'Заповніть інформацію для створення нового клієнта або ліда.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="full_name">
              Повне ім&apos;я / Назва <span className="text-destructive">*</span>
            </label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={client?.full_name || ''}
              placeholder="Наприклад: Олексій Шевченко"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="company">
                Компанія / Проєкт
              </label>
              <Input
                id="company"
                name="company"
                defaultValue={client?.company || ''}
                placeholder="TechCorp LLC"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="username">
                Telegram Username
              </label>
              <Input
                id="username"
                name="username"
                defaultValue={client?.username || ''}
                placeholder="oleksiy_dev"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="telegram_id">
                Telegram ID (число)
              </label>
              <Input
                id="telegram_id"
                name="telegram_id"
                type="number"
                defaultValue={client?.telegram_id || ''}
                placeholder="123456789"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="phone">
                Телефон
              </label>
              <Input
                id="phone"
                name="phone"
                defaultValue={client?.phone || ''}
                placeholder="+380 50 123 45 67"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="email">
              Електронна пошта
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email || ''}
              placeholder="client@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Джерело (Source)
              </label>
              <Select
                value={source}
                onValueChange={(val) => {
                  if (val) setSource(val as ClientSource)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть джерело" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREELANCEHUNT">Freelancehunt</SelectItem>
                  <SelectItem value="TELEGRAM">Telegram</SelectItem>
                  <SelectItem value="REFERRAL">Рекомендація</SelectItem>
                  <SelectItem value="WEBSITE">Веб-сайт</SelectItem>
                  <SelectItem value="OTHER">Інше</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Статус (Status)
              </label>
              <Select
                value={status}
                onValueChange={(val) => {
                  if (val) setStatus(val as ClientStatus)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEAD">Лід (Lead)</SelectItem>
                  <SelectItem value="ACTIVE">Активний (Active)</SelectItem>
                  <SelectItem value="CLIENT">Клієнт (Client)</SelectItem>
                  <SelectItem value="PAUSED">Пауза (Paused)</SelectItem>
                  <SelectItem value="INACTIVE">Неактивний (Inactive)</SelectItem>
                  <SelectItem value="ARCHIVED">В архіві (Archived)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="notes">
              Нотатки та деталі
            </label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={client?.notes || ''}
              placeholder="Додаткова інформація про вимоги клієнта, домовленості, часовий пояс тощо..."
              rows={3}
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
            <Button type="submit" disabled={isLoading} className="gap-1.5 shadow-sm">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Збереження...
                </>
              ) : isEditing ? (
                'Зберегти зміни'
              ) : (
                'Створити клієнта'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
