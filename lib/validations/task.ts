import { z } from 'zod'

export const taskStatusEnum = z.enum(['OPEN', 'DONE'])

export const taskSchema = z.object({
  client_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  project_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  title: z.string().min(2, 'Заголовок задачі обов’язковий (мінімум 2 символи)'),
  due_date: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  status: taskStatusEnum.default('OPEN'),
})

export type TaskFormValues = z.infer<typeof taskSchema>
