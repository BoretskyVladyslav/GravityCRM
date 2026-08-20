import { z } from 'zod'

export const clientSourceEnum = z.enum([
  'FREELANCEHUNT',
  'TELEGRAM',
  'REFERRAL',
  'WEBSITE',
  'OTHER',
])

export const clientStatusEnum = z.enum([
  'LEAD',
  'ACTIVE',
  'CLIENT',
  'PAUSED',
  'INACTIVE',
  'ARCHIVED',
])

export const clientSchema = z.object({
  full_name: z.string().min(2, "Ім'я клієнта обов'язкове (мінімум 2 символи)"),
  username: z.string().optional().nullable(),
  telegram_id: z.coerce.number().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Некоректний email').optional().nullable().or(z.literal('')),
  company: z.string().optional().nullable(),
  source: clientSourceEnum.default('FREELANCEHUNT'),
  status: clientStatusEnum.default('LEAD'),
  notes: z.string().optional().nullable(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
