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
import { ClientStatusBadge } from './client-status-badge'
import { ClientSourceBadge } from './client-source-badge'
import { ClientDialog } from './client-dialog'
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Archive,
  Trash2,
  Send,
  Mail,
  Phone,
  Building,
  Loader2,
} from 'lucide-react'
import { archiveClient, deleteClient } from '@/app/(dashboard)/clients/actions'
import type { Client } from '@/lib/types'

interface ClientTableProps {
  clients: Client[]
}

export function ClientTable({ clients }: ClientTableProps) {
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleArchive(id: string) {
    if (!confirm('Ви впевнені, що бажаєте перемістити клієнта в архів?')) return
    setLoadingId(id)
    setActionError(null)
    const res = await archiveClient(id)
    if (res.error) setActionError(res.error)
    setLoadingId(null)
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        'УВАГА: Видалити клієнта назавжди? Цю дію неможливо скасувати.'
      )
    )
      return
    setLoadingId(id)
    setActionError(null)
    const res = await deleteClient(id)
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
              <TableHead className="w-[260px]">Клієнт / Компанія</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Джерело</TableHead>
              <TableHead>Контакти</TableHead>
              <TableHead>Telegram</TableHead>
              <TableHead>Створено</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const formattedDate = new Date(client.created_at).toLocaleDateString(
                'uk-UA',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }
              )

              return (
                <TableRow key={client.id} className="group">
                  {/* Name and Company */}
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
                      >
                        {client.full_name}
                      </Link>
                      {client.company && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Building className="h-3 w-3" /> {client.company}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <ClientStatusBadge status={client.status} />
                  </TableCell>

                  {/* Source */}
                  <TableCell>
                    <ClientSourceBadge source={client.source} />
                  </TableCell>

                  {/* Contacts */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {client.email ? (
                        <a
                          href={`mailto:${client.email}`}
                          className="hover:text-foreground flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" /> {client.email}
                        </a>
                      ) : null}
                      {client.phone ? (
                        <a
                          href={`tel:${client.phone}`}
                          className="hover:text-foreground flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" /> {client.phone}
                        </a>
                      ) : null}
                      {!client.email && !client.phone && (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Telegram */}
                  <TableCell>
                    {client.username ? (
                      <a
                        href={`https://t.me/${client.username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <Send className="h-3 w-3" /> @{client.username}
                      </a>
                    ) : client.telegram_id ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Send className="h-3 w-3" /> ID: {client.telegram_id}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/60">—</span>
                    )}
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="text-xs text-muted-foreground">
                    {formattedDate}
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
                            disabled={loadingId === client.id}
                          >
                            {loadingId === client.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel className="text-xs">
                          Опції клієнта
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/clients/${client.id}`}
                              className="flex items-center gap-2 cursor-pointer w-full"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Деталі та таймлайн</span>
                            </Link>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() => setEditingClient(client)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Редагувати</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {client.status !== 'ARCHIVED' && (
                          <DropdownMenuItem
                            onClick={() => handleArchive(client.id)}
                            className="flex items-center gap-2 cursor-pointer text-amber-400"
                          >
                            <Archive className="h-3.5 w-3.5" />
                            <span>В архів</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(client.id)}
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
      {editingClient && (
        <ClientDialog
          client={editingClient}
          open={!!editingClient}
          onOpenChange={(open) => {
            if (!open) setEditingClient(null)
          }}
        />
      )}
    </div>
  )
}
