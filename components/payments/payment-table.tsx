'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { PaymentStatusBadge } from './payment-status-badge'
import { PaymentDialog } from './payment-dialog'
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle,
  Calendar,
  User,
  FolderKanban,
  CreditCard,
  Loader2,
  CheckCheck,
} from 'lucide-react'
import { updatePaymentStatus, deletePayment } from '@/app/(dashboard)/payments/actions'
import type { Payment, PaymentStatus } from '@/lib/types'

export interface PaymentWithRelations extends Payment {
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

interface PaymentTableProps {
  payments: PaymentWithRelations[]
  clients?: Array<{ id: string; full_name: string; company: string | null }>
  projects?: Array<{ id: string; client_id: string; title: string }>
}

export function PaymentTable({
  payments,
  clients = [],
  projects = [],
}: PaymentTableProps) {
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleMarkPaid(id: string) {
    setLoadingId(id)
    setActionError(null)
    const res = await updatePaymentStatus(id, 'PAID')
    if (res.error) setActionError(res.error)
    setLoadingId(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Ви впевнені, що бажаєте видалити цей платіж?')) return
    setLoadingId(id)
    setActionError(null)
    const res = await deletePayment(id)
    if (res.error) setActionError(res.error)
    setLoadingId(null)
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {actionError}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[140px]">Дата</TableHead>
              <TableHead>Клієнт / Проєкт</TableHead>
              <TableHead>Сума</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Метод / Опис</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const dateToFormat = payment.paid_at || payment.created_at
              const formattedDate = new Date(dateToFormat).toLocaleDateString(
                'uk-UA',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }
              )
              const formattedTime = new Date(dateToFormat).toLocaleTimeString(
                'uk-UA',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )

              const isPaid = payment.status === 'PAID'
              const isPending = payment.status === 'PENDING'

              return (
                <TableRow key={payment.id} className="group">
                  {/* Date */}
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" /> {formattedDate}
                      </span>
                      <span className="text-[11px] text-muted-foreground/70">
                        {formattedTime}
                      </span>
                    </div>
                  </TableCell>

                  {/* Client & Project */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {payment.clients ? (
                        <Link
                          href={`/clients/${payment.clients.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-sm"
                        >
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{payment.clients.full_name}</span>
                          {payment.clients.company && (
                            <span className="text-xs text-muted-foreground">
                              ({payment.clients.company})
                            </span>
                          )}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}

                      {payment.projects ? (
                        <Link
                          href={`/projects/${payment.projects.id}`}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          <FolderKanban className="h-3 w-3 text-muted-foreground" />
                          <span>{payment.projects.title}</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60">
                          Пряма оплата (без проєкту)
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Amount & Currency */}
                  <TableCell>
                    <span
                      className={`text-base font-bold tracking-tight ${
                        isPaid
                          ? 'text-emerald-400'
                          : isPending
                          ? 'text-amber-400'
                          : 'text-foreground'
                      }`}
                    >
                      ${Number(payment.amount).toFixed(2)}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        {payment.currency}
                      </span>
                    </span>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>

                  {/* Method & Description */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs max-w-xs">
                      <span className="font-medium text-foreground flex items-center gap-1">
                        <CreditCard className="h-3 w-3 text-muted-foreground" />
                        {payment.payment_method || 'Не вказано'}
                      </span>
                      {payment.description && (
                        <span className="text-muted-foreground line-clamp-1">
                          {payment.description}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            disabled={loadingId === payment.id}
                          >
                            {loadingId === payment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs">
                          Опції платежу
                        </DropdownMenuLabel>
                        {payment.status !== 'PAID' && (
                          <DropdownMenuItem
                            onClick={() => handleMarkPaid(payment.id)}
                            className="flex items-center gap-2 cursor-pointer text-emerald-400"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            <span>Позначити сплаченим</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setEditingPayment(payment)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Редагувати</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(payment.id)}
                          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Видалити</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Controlled Edit Dialog */}
      {editingPayment && (
        <PaymentDialog
          payment={editingPayment}
          clients={clients}
          projects={projects}
          open={!!editingPayment}
          onOpenChange={(open) => {
            if (!open) setEditingPayment(null)
          }}
        />
      )}
    </div>
  )
}
