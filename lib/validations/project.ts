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
  client_id: z.string().uuid('Оберіть клієнта зі списку'),
  title: z.string().min(2, 'Назва проєкту обов’язкова (мінімум 2 символи)'),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  status: projectStatusEnum.default('LEAD'),
  budget: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined || val === null || val === '') return 0
      const num = typeof val === 'string' ? parseFloat(val) : val
      return isNaN(num) || num < 0 ? 0 : num
    }),
  currency: currencyEnum.default('USD'),
  start_date: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  deadline: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
