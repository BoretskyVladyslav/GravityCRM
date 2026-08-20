import { z } from 'zod'

export const communicationChannelEnum = z.enum([
  'TELEGRAM',
  'FREELANCEHUNT',
  'EMAIL',
  'OTHER',
])

export const messageDirectionEnum = z.enum(['INCOMING', 'OUTGOING'])

export const communicationLogSchema = z.object({
  client_id: z.string().uuid('Оберіть клієнта'),
  project_id: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val.trim() ? val.trim() : null)),
  channel: communicationChannelEnum.default('TELEGRAM'),
  direction: messageDirectionEnum.default('OUTGOING'),
  message: z.string().min(1, 'Введіть текст повідомлення або нотатки').transform((val) => val.trim()),
})

export type CommunicationLogFormValues = z.infer<typeof communicationLogSchema>
