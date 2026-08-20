import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'GravityCRM — High-Performance Freelance CRM',
    template: '%s | GravityCRM',
  },
  description:
    'Modern, secure CRM for freelancers and agencies built with Next.js 16, React 19, Supabase and Telegram integration.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="uk" className={cn(geistSans.variable, geistMono.variable, 'dark')}>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  )
}
