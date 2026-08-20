'use client'

import { CommunicationItem } from './communication-item'
import { CommunicationForm } from './communication-form'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import type { CommunicationLog } from '@/lib/types'

interface CommunicationTimelineProps {
  logs: Array<
    CommunicationLog & {
      projects?: { id: string; title: string } | null
    }
  >
  clientId: string
  projectId?: string
  projects?: Array<{ id: string; title: string }>
}

export function CommunicationTimeline({
  logs,
  clientId,
  projectId,
  projects = [],
}: CommunicationTimelineProps) {
  return (
    <div className="space-y-4">
      {/* Inline Quick Add Form */}
      <CommunicationForm
        clientId={clientId}
        projectId={projectId}
        projects={projects}
      />

      {/* History Log List */}
      {logs.length > 0 ? (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <CommunicationItem key={log.id} log={log} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border/60">
          <CardHeader className="text-center py-8">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <CardTitle className="text-sm">Історія комунікації порожня</CardTitle>
            <CardDescription className="text-xs">
              Фіксуйте вхідні та вихідні повідомлення за допомогою форми вище.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
