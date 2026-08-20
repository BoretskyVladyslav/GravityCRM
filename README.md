# 🚀 GravityCRM

[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-black?style=flat)](https://ui.shadcn.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)

> **GravityCRM** — сучасна, безпечна та високопродуктивна CRM-система нового покоління, створена на базі Next.js 16 (App Router), React 19 та Supabase з повноцінною безпекою Row-Level Security (RLS), динамічним фінансовим модулем та захищеною інтеграцією з Telegram.

---

## 🌟 Ключові особливості

- **🔒 Strict Row-Level Security (RLS):** Абсолютний захист даних на рівні рядків PostgreSQL з першої міграції. Ізоляція за ролями користувачів (`admin`, `manager`, `agent`).
- **⚡ Server-First Architecture:** Next.js 16 App Router, React Server Components (RSC) та Server Actions для максимальної продуктивності та надійності.
- **🤖 Безпечна інтеграція з Telegram:** Обробка вебхуків через Supabase Edge Functions, валідація секретних заголовків, дедуплікація `update_id` та захист токенів від доступу з клієнта.
- **💰 Динамічний фінансовий розрахунок (On-the-Fly):** Розрахунок сум оплат, залишків та статусів у реальному часі без дублювання денормалізованих полів у базі даних.
- **🛡️ 100% Type-Safe & Zod Validation:** Повна наскрізна типізація TypeScript від бази даних до компонентів та сувора валідація вхідних даних.
- **🎨 Преміальний UI/UX:** Елегантний інтерфейс на базі Tailwind CSS та компонентів `shadcn/ui` з підтримкою темної теми та плавної анімації.

---

## 🛠️ Технологічний стек

| Компонент | Технологія |
| :--- | :--- |
| **Фреймворк** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Бібліотека** | [React 19](https://react.dev/) |
| **Мова** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Стилізація** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Компоненти** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **База даних & Auth** | [Supabase](https://supabase.com/) (PostgreSQL 15+, Supabase Auth, Storage) |
| **Серверні функції** | [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno) |
| **Схема & Валідація** | [Zod](https://zod.dev/) |
| **Іконки** | [Lucide React](https://lucide.dev/) |

---

## 📂 Структура проєкту

```
GravityCRM/
├── crm_discovery_phase0.md     # Головна архітектурна специфікація проєкту
├── docs/
│   └── architecture.md         # Документація та схеми архітектури
├── supabase/                   # Міграції, конфігурація та Edge Functions
│   ├── functions/              # Telegram Webhook & сервісні функції
│   └── migrations/             # SQL міграції (схеми, RLS, тригери, в'юхи)
├── src/
│   ├── app/                    # Next.js App Router (RSC, layouts, routes)
│   ├── components/             # React компоненти (UI, модульні компоненти)
│   ├── lib/                    # Supabase клієнти, валідації Zod, утиліти
│   ├── actions/                # Server Actions
│   └── types/                  # TypeScript типи та інтерфейси
└── README.md
```

---

## 🗺️ Дорожня карта (Roadmap)

- [x] **Phase 0: Discovery & Architecture** — Формування архітектурних вимог, схеми БД, RLS та Telegram потоку.
- [x] **Phase 1: Repository Setup** — Ініціалізація Git, підключення репозиторію, базової документації.
- [ ] **Phase 2: Project Setup** — Ініціалізація Next.js 16, Tailwind CSS, shadcn/ui, налаштування середовища Supabase.
- [ ] **Phase 3: Database & Strict RLS** — Створення таблиць, RLS-політик, тригерів та розрахункових SQL-в'юх.
- [ ] **Phase 4: Telegram Integration** — Розгортання Edge Functions, перевірка секретів, дедуплікація `update_id`.
- [ ] **Phase 5: Core CRM Features** — Модулі лідів, угод, розрахунок оплат, омніканальний чат.
- [ ] **Phase 6: QA, Polish & Release** — Тестування, оптимізація продуктивності, реліз.

---

## 📖 Документація

Детальний опис архітектури, схеми бази даних, діаграми сутностей та протоколи інтеграцій доступні у файлі [`crm_discovery_phase0.md`](crm_discovery_phase0.md).

---

## 👤 Автор & Репозиторій

- **Репозиторій:** [https://github.com/BoretskyVladyslav/GravityCRM](https://github.com/BoretskyVladyslav/GravityCRM)
- **Розробник:** BoretskyVladyslav
