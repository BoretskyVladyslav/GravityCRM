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
  username: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim().replace(/^@/, '') : null)),
  telegram_id: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((val) => {
      if (val === undefined || val === null || val === '') return null
      const num = typeof val === 'string' ? parseInt(val, 10) : val
      return isNaN(num) ? null : num
    }),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  email: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null))
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Некоректний формат email',
    }),
  company: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  source: clientSourceEnum.default('FREELANCEHUNT'),
  status: clientStatusEnum.default('LEAD'),
  notes: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
})

export type ClientFormValues = z.infer<typeof clientSchema>
