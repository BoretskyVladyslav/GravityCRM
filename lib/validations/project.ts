import { z } from 'zod'

export const projectStatusEnum = z.enum([
  'LEAD',
  'PLANNING',
  'IN_PROGRESS',
  'WAITING_CLIENT',
  'WAITING_PAYMENT',
  'REVISIONS',
  'COMPLETED',
  'CANCELLED',
])

export const currencyEnum = z.enum(['USD', 'EUR', 'UAH', 'PLN'])

export const projectSchema = z.object({
  client_id: z.string().uuid('Оберіть клієнта'),
  title: z.string().min(2, 'Назва проєкту обов’язкова'),
  description: z.string().optional().nullable(),
  status: projectStatusEnum.default('LEAD'),
  budget: z.coerce.number().min(0, 'Бюджет має бути додатним числом').default(0),
  currency: currencyEnum.default('USD'),
  start_date: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
