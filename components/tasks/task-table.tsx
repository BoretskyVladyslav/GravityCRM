'use client'

import { useState } from 'react'
import { TaskItem, type TaskWithRelations } from './task-item'
import { TaskDialog } from './task-dialog'
import type { Task } from '@/lib/types'

interface TaskTableProps {
  tasks: TaskWithRelations[]
  clients?: Array<{ id: string; full_name: string; company: string | null }>
  projects?: Array<{ id: string; client_id: string; title: string }>
}

export function TaskTable({
  tasks,
  clients = [],
  projects = [],
}: TaskTableProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onEdit={(t) => setEditingTask(t)}
          />
        ))}
      </div>

      {/* Controlled Edit Dialog */}
      {editingTask && (
        <TaskDialog
          task={editingTask}
          clients={clients}
          projects={projects}
          open={!!editingTask}
          onOpenChange={(open) => {
            if (!open) setEditingTask(null)
          }}
        />
      )}
    </div>
  )
}
