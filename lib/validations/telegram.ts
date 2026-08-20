import { z } from 'zod'

export const telegramUserSchema = z.object({
  id: z.number(),
  is_bot: z.boolean().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
})

export const telegramChatSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  type: z.string(),
  title: z.string().optional(),
})

export const telegramMessageSchema = z.object({
  message_id: z.number(),
  from: telegramUserSchema.optional(),
  chat: telegramChatSchema,
  date: z.number(),
  text: z.string().optional(),
})

export const telegramWebhookUpdateSchema = z.object({
  update_id: z.number(),
  message: telegramMessageSchema.optional(),
  edited_message: telegramMessageSchema.optional(),
})

export type TelegramWebhookUpdate = z.infer<typeof telegramWebhookUpdateSchema>
