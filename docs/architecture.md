# GravityCRM Architecture & Discovery

Повний архітектурний документ фази Discovery знаходиться у файлі [`crm_discovery_phase0.md`](../crm_discovery_phase0.md).

## Швидкий підсумок архітектури:
- **Frontend:** Next.js 16 (App Router, React Server Components, Server Actions), React 19, Tailwind CSS, shadcn/ui.
- **Backend & Database:** Supabase (PostgreSQL 15+ зі строгим Row-Level Security, Auth з SSR сесіями, Realtime, Storage).
- **Telegram Integration:** Supabase Edge Functions з валідацією секретних токенів, дедуплікацією `update_id` та ізольованим API.
- **Financial Module:** Динамічний розрахунок балансів та оплат на льоту (без дублювання полів).
- **Type Safety & Validation:** 100% покриття типами TypeScript + Zod.
