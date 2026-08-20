import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Введіть коректну адресу електронної пошти'),
  password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
})

export type LoginInput = z.infer<typeof loginSchema>
