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
import { Loader2, Plus, Edit2, AlertCircle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { createPayment, updatePayment } from '@/app/(dashboard)/payments/actions'
import type { Payment, PaymentStatus, Currency } from '@/lib/types'

interface PaymentDialogProps {
  payment?: Payment
  clients?: Array<{ id: string; full_name: string; company: string | null }>
  projects?: Array<{ id: string; client_id: string; title: string }>
  defaultClientId?: string
  defaultProjectId?: string
  trigger?: React.ReactElement
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const paymentMethods = [
  'Банківський переказ (IBAN)',
  'Stripe / Картка',
  'Crypto / USDT',
  'Payoneer',
  'Wise',
  'Freelancehunt Сейф',
  'Готівка',
  'Інше',
]

export function PaymentDialog({
  payment,
  clients = [],
  projects = [],
  defaultClientId,
  defaultProjectId,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PaymentDialogProps) {
  const isEditing = !!payment
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientId, setClientId] = useState<string>(
    payment?.client_id || defaultClientId || (clients[0]?.id || '')
  )
  const [projectId, setProjectId] = useState<string>(
    payment?.project_id || defaultProjectId || 'NONE'
  )
  const [status, setStatus] = useState<PaymentStatus>(payment?.status || 'PAID')
  const [currency, setCurrency] = useState<Currency>(payment?.currency || 'USD')
  const [paymentMethod, setPaymentMethod] = useState<string>(
    payment?.payment_method || paymentMethods[0]
  )

  // Filter projects by selected client if selected
  const availableProjects = clientId
    ? projects.filter((p) => p.client_id === clientId)
    : projects

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!clientId) {
      setError('Будь ласка, оберіть клієнта')
      toast.error('Будь ласка, оберіть клієнта')
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('client_id', clientId)
    formData.set('project_id', projectId === 'NONE' ? '' : projectId)
    formData.set('status', status)
    formData.set('currency', currency)
    formData.set('payment_method', paymentMethod)

    try {
      const result = isEditing
        ? await updatePayment(payment.id, null, formData)
        : await createPayment(null, formData)

      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        setIsLoading(false)
        return
      }

      toast.success(isEditing ? 'Платіж оновлено' : 'Платіж успішно зафіксовано')
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
                  <Edit2 className="h-4 w-4" /> Редагувати платіж
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Зафіксувати платіж
                </>
              )}
            </Button>
          }
        />
      ) : null}

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Редагування транзакції' : 'Новий платіж'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Оновіть суму, статус або деталі проведеної оплати.'
              : 'Зафіксуйте надходження коштів, аванс або очікуваний платіж.'}
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
              Клієнт / Платник <span className="text-destructive">*</span>
            </label>
            {clients.length > 0 ? (
              <Select
                value={clientId}
                onValueChange={(val) => {
                  if (val) {
                    setClientId(val)
                    // Reset project if chosen project doesn't belong to newly selected client
                    const clientProjects = projects.filter((p) => p.client_id === val)
                    if (projectId !== 'NONE' && !clientProjects.some((p) => p.id === projectId)) {
                      setProjectId('NONE')
                    }
                  }
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
                Додайте хоча б одного клієнта для фіксації оплат.
              </div>
            )}
          </div>

          {/* Project selector (optional) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Прив&apos;язка до проєкту (опційно)
            </label>
            <Select
              value={projectId}
              onValueChange={(val) => {
                if (val) setProjectId(val)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Без проєкту (Пряма оплата клієнта)" />
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

          {/* Amount and Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="amount">
                Сума платежу <span className="text-destructive">*</span>
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={payment?.amount || ''}
                placeholder="500.00"
                required
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

          {/* Status and Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Статус оплати
              </label>
              <Select
                value={status}
                onValueChange={(val) => {
                  if (val) setStatus(val as PaymentStatus)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Сплачено (Paid)</SelectItem>
                  <SelectItem value="PENDING">В очікуванні (Pending)</SelectItem>
                  <SelectItem value="PARTIAL">Частково (Partial)</SelectItem>
                  <SelectItem value="REFUNDED">Повернено (Refunded)</SelectItem>
                  <SelectItem value="CANCELLED">Скасовано (Cancelled)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Спосіб оплати
              </label>
              <Select
                value={paymentMethod}
                onValueChange={(val) => {
                  if (val) setPaymentMethod(val)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть спосіб" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Paid At Date */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="paid_at">
              Дата та час оплати
            </label>
            <Input
              id="paid_at"
              name="paid_at"
              type="datetime-local"
              defaultValue={
                payment?.paid_at
                  ? new Date(payment.paid_at).toISOString().slice(0, 16)
                  : new Date().toISOString().slice(0, 16)
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider" htmlFor="description">
              Призначення / Опис платежу
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue={payment?.description || ''}
              placeholder="Наприклад: Аванс 50% за розробку головної сторінки..."
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
                'Зафіксувати платіж'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
