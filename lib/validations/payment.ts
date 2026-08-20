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
  client_id: z.string().uuid('Оберіть клієнта'),
  project_id: z.string().uuid().optional().nullable(),
  amount: z.coerce.number().positive('Сума платежу має бути більшою за 0'),
  currency: currencyEnum.default('USD'),
  status: paymentStatusEnum.default('PAID'),
  payment_method: z.string().optional().nullable(),
  paid_at: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>
