import { z } from 'zod'

export const taskStatusEnum = z.enum(['OPEN', 'DONE'])

export const taskSchema = z.object({
  client_id: z.string().uuid().optional().nullable(),
  project_id: z.string().uuid().optional().nullable(),
  title: z.string().min(2, 'Заголовок задачі обов’язковий'),
  due_date: z.string().optional().nullable(),
  status: taskStatusEnum.default('OPEN'),
})

export type TaskFormValues = z.infer<typeof taskSchema>
