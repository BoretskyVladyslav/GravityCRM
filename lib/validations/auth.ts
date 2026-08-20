import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Введіть коректну адресу електронної пошти'),
  password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
})

export const signupSchema = z
  .object({
    email: z.string().email('Введіть коректну адресу електронної пошти'),
    password: z.string().min(6, 'Пароль має містити щонайменше 6 символів'),
    confirmPassword: z.string().min(6, 'Підтвердження паролю обов’язкове'),
    fullName: z.string().min(2, "Введіть ваше повне ім'я").optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
