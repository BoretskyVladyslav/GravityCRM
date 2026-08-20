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
import { Badge } from '@/components/ui/badge'
import { ProjectStatusBadge } from './project-status-badge'
import { ProjectDialog } from './project-dialog'
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  User,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { updateProjectStatus, deleteProject } from '@/app/(dashboard)/projects/actions'
import type { Project, ProjectStatus } from '@/lib/types'

export interface ProjectWithClientAndFinances extends Project {
  clients?: {
    id: string
    full_name: string
    company: string | null
  } | null
  total_paid?: number
  remaining_balance?: number
}

interface ProjectTableProps {
  projects: ProjectWithClientAndFinances[]
  clients?: Array<{ id: string; full_name: string; company: string | null }>
}

export function ProjectTable({ projects, clients = [] }: ProjectTableProps) {
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleStatusChange(id: string, status: ProjectStatus) {
    setLoadingId(id)
    setActionError(null)
    const res = await updateProjectStatus(id, status)
    if (res.error) setActionError(res.error)
    setLoadingId(null)
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        'Ви впевнені, що бажаєте видалити цей проєкт? Всі пов’язані задачі та записи будуть відкріплені.'
      )
    )
      return
    setLoadingId(id)
    setActionError(null)
    const res = await deleteProject(id)
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
              <TableHead className="w-[280px]">Проєкт / Клієнт</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Бюджет</TableHead>
              <TableHead>Оплата (On-the-Fly)</TableHead>
              <TableHead>Дедлайн</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => {
              const totalPaid = Number(project.total_paid) || 0
              const budget = Number(project.budget) || 0
              const remaining = Math.max(0, budget - totalPaid)
              const percentPaid =
                budget > 0 ? Math.min(100, Math.round((totalPaid / budget) * 100)) : 0

              const isCompleted = project.status === 'COMPLETED'
              const isOverdue =
                !isCompleted &&
                project.deadline &&
                new Date(project.deadline) < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <TableRow key={project.id} className="group">
                  {/* Title and Client */}
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {project.title}
                      </Link>
                      {project.clients && (
                        <Link
                          href={`/clients/${project.clients.id}`}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-0.5"
                        >
                          <User className="h-3 w-3" />
                          <span>{project.clients.full_name}</span>
                          {project.clients.company && (
                            <span className="text-muted-foreground/60">
                              • {project.clients.company}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <ProjectStatusBadge status={project.status} />
                  </TableCell>

                  {/* Budget */}
                  <TableCell>
                    <span className="font-semibold text-sm">
                      ${budget.toFixed(2)}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        {project.currency}
                      </span>
                    </span>
                  </TableCell>

                  {/* Payment Progress */}
                  <TableCell>
                    <div className="flex flex-col gap-1 w-32">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-500 font-medium">${totalPaid.toFixed(0)}</span>
                        <span className="text-muted-foreground">
                          {percentPaid}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            percentPaid === 100
                              ? 'bg-emerald-500'
                              : percentPaid > 0
                              ? 'bg-sky-500'
                              : 'bg-transparent'
                          }`}
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                      {remaining > 0 && (
                        <span className="text-[10px] text-muted-foreground/70">
                          Залишок: ${remaining.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Deadline */}
                  <TableCell>
                    {project.deadline ? (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span
                          className={
                            isOverdue
                              ? 'text-destructive font-semibold flex items-center gap-1'
                              : 'text-muted-foreground'
                          }
                        >
                          {new Date(project.deadline).toLocaleDateString('uk-UA')}
                          {isOverdue && <AlertTriangle className="h-3 w-3" />}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
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
                            disabled={loadingId === project.id}
                          >
                            {loadingId === project.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">
                          Опції проєкту
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          render={
                            <Link
                              href={`/projects/${project.id}`}
                              className="flex items-center gap-2 cursor-pointer w-full"
                            >
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>Деталі та фінанси</span>
                            </Link>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() => setEditingProject(project)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Редагувати</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">
                          Швидка зміна статусу
                        </DropdownMenuLabel>
                        {project.status !== 'IN_PROGRESS' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(project.id, 'IN_PROGRESS')}
                            className="text-xs cursor-pointer"
                          >
                            ▶ В роботу
                          </DropdownMenuItem>
                        )}
                        {project.status !== 'WAITING_PAYMENT' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(project.id, 'WAITING_PAYMENT')}
                            className="text-xs cursor-pointer"
                          >
                            ⏳ Очікує оплати
                          </DropdownMenuItem>
                        )}
                        {project.status !== 'COMPLETED' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(project.id, 'COMPLETED')}
                            className="text-xs cursor-pointer text-emerald-400"
                          >
                            ✓ Завершити
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => handleDelete(project.id)}
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
      {editingProject && (
        <ProjectDialog
          project={editingProject}
          clients={clients}
          open={!!editingProject}
          onOpenChange={(open) => {
            if (!open) setEditingProject(null)
          }}
        />
      )}
    </div>
  )
}
