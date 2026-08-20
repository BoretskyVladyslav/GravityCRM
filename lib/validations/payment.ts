import { z } from 'zod'
import { currencyEnum } from './project'

export const paymentStatusEnum = z.enum([
  'PENDING',
  'PAID',
  'PARTIAL',
  'REFUNDED',
  'CANCELLED',
])

export const paymentSchema = z.object({
  client_id: z.string().uuid('Оберіть клієнта зі списку'),
  project_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === undefined || val === null || val === '') return 0
      const num = typeof val === 'string' ? parseFloat(val) : val
      return isNaN(num) ? 0 : num
    })
    .refine((val) => val > 0, {
      message: 'Сума платежу має бути більшою за 0',
    }),
  currency: currencyEnum.default('USD'),
  status: paymentStatusEnum.default('PAID'),
  payment_method: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  paid_at: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>
