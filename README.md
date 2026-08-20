# 🚀 GravityCRM

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-black?style=flat)](https://ui.shadcn.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)

> **GravityCRM** — сучасна, безпечна та високопродуктивна CRM-система нового покоління для фриланс-проєктів, створена на базі Next.js 16 (App Router), React 19 та Supabase з повноцінним захистом Row-Level Security (RLS), динамічним фінансовим модулем (розрахунок на льоту) та безпечною інтеграцією з Telegram.

---

## 🌟 Ключові особливості

- **🔒 Strict Row-Level Security (RLS):** Абсолютний захист даних на рівні рядків PostgreSQL з першої міграції (`auth.uid() = owner_id`).
- **⚡ Server-First Architecture:** Next.js 16 App Router, React Server Components (RSC) та Server Actions для максимальної швидкодії та безпеки.
- **🤖 Безпечна інтеграція з Telegram:** Обробка вебхуків через Supabase Edge Functions, валідація секретних заголовків, дедуплікація `update_id` та захист токенів від потрапляння у frontend-бандл.
- **💰 Динамічний фінансовий розрахунок (On-the-Fly):** Розрахунок сум оплат, залишків та статусів у реальному часі без дублювання денормалізованих полів у таблицях.
- **🛡️ 100% Type-Safe & Zod Validation:** Повна наскрізна типізація TypeScript від схеми бази даних до UI-компонентів та сувора валідація вхідних даних.
- **🎨 Преміальний UI/UX:** Елегантний інтерфейс на базі Tailwind CSS та компонентів `shadcn/ui` з підтримкою темної теми та плавної анімації.

---

## 🛠️ Технологічний стек

| Компонент | Технологія |
| :--- | :--- |
| **Фреймворк** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Бібліотека** | [React 19](https://react.dev/) |
| **Мова** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Стилізація** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Компоненти** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **База даних & Auth** | [Supabase](https://supabase.com/) (PostgreSQL 15+, Supabase Auth, Storage) |
| **Серверні функції** | [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (Deno) |
| **Схема & Валідація** | [Zod](https://zod.dev/) |
| **Іконки** | [Lucide React](https://lucide.dev/) |

---

## 📂 Структура проєкту

```
GravityCRM/
├── app/                        # Next.js App Router (RSC, layouts, routes)
│   ├── (auth)/login/           # Авторизація користувача
│   ├── (dashboard)/            # Захищений простір CRM
│   │   ├── dashboard/          # Головний дашборд
│   │   ├── clients/            # Модуль клієнтів
│   │   ├── projects/           # Модуль проєктів
│   │   ├── payments/           # Фінансовий модуль
│   │   ├── tasks/              # Модуль задач
│   │   └── settings/           # Налаштування та статус RLS
│   └── api/telegram/webhook/   # Telegram Webhook ендпоінт
├── components/                 # React UI компоненти
│   ├── ui/                     # Атомарні shadcn/ui компоненти
│   ├── clients/                # Компоненти клієнтів
│   ├── projects/               # Компоненти проєктів
│   ├── payments/               # Компоненти платежів
│   └── dashboard/              # Компоненти дашборду
├── lib/
│   ├── supabase/               # Клієнтський, серверний та middleware Supabase хелпери
│   ├── types/                  # TypeScript типи (Database, Domain, View Models)
│   ├── validations/            # Схеми валідації Zod
│   └── utils.ts                # Загальні утиліти
├── supabase/
│   ├── migrations/             # SQL міграції (схеми, RLS, тригери, в'юхи)
│   ├── functions/              # Edge Functions (Telegram Webhook)
│   └── seed.sql                # Демо-дані для розробки
├── crm_discovery_phase0.md     # Повна архітектурна специфікація
├── .env.example                # Шаблон змінних оточення
└── README.md
```

---

## 🗄️ Робота з базою даних Supabase (Phase 3)

### Варіант 1: Застосування через Supabase Dashboard (SQL Editor)
1. Відкрийте ваш проєкт у [Supabase Dashboard](https://app.supabase.com/).
2. Перейдіть до розділу **SQL Editor**.
3. Скопіюйте та виконайте вміст файлу [`supabase/migrations/20260820000001_initial_schema.sql`](supabase/migrations/20260820000001_initial_schema.sql).
4. *(Опційно)* Для заповнення тестовими даними виконайте скрипт [`supabase/seed.sql`](supabase/seed.sql).

### Варіант 2: Застосування через Supabase CLI
```bash
# Ініціалізація або запуск локального Supabase
supabase start

# Застосування міграцій
supabase db reset
# або
supabase migration up
```

---

## 🗺️ Дорожня карта реалізації (15 Фаз)

- [x] **Phase 1: Architecture** — Документ архітектури, ERD, життєві цикли сутностей, безпека.
- [x] **Phase 2: Project Setup** — Next.js 16, TypeScript, Tailwind CSS, shadcn/ui, Supabase helpers, Zod.
- [x] **Phase 3: Database** — Створення таблиць, enum-ів, індексів, тригерів та суворих RLS політик.
- [x] **Phase 4: Auth** — Автентифікація користувача, захист сесій через middleware, кабінет, форми входу/реєстрації.
- [x] **Phase 5: Clients** — Модуль клієнтів (CRUD, швидкий пошук, фільтри за джерелами та статусами, картка клієнта з таймлайном).
- [x] **Phase 6: Projects** — Модуль проєктів (життєвий цикл, дедлайни, прив'язка до клієнтів, розрахунок оплати на льоту).
- [x] **Phase 7: Payments** — Фінансовий модуль із динамічним розрахунком на льоту (без дублювання, статуси транзакцій, мультивалютність).
- [x] **Phase 8: Tasks** — Задачі, контроль термінів, динамічне обчислення overdue-статусу на льоту, інтерактивні чек-листи.
- [x] **Phase 9: Communication** — Ручний лог комунікації, таймлайн взаємодії за каналами та автоматичне оновлення last_contact_at.
- [x] **Phase 10: Telegram** — Двостороння інтеграція через Edge Function / Route Handler, перевірка секретів, дедуплікація update_id та автостворення лідів.
- [x] **Phase 11: Dashboard** — Головна аналітична панель з 4 ключовими блоками (Сьогодні, Проєкти, Гроші, Клієнти).
- [x] **Phase 12: Search & Filters** — Глобальний пошуковий хаб, Command Palette Cmd+K та швидка навігація по всіх сутностях.
- [x] **Phase 13: UX Polish** — Спливаючі сповіщення (Toasts / Sonner), індикатори завантаження, інтерактивні стани та Empty States.
- [x] **Phase 14: Security Audit** — Комплексний аудит RLS, ізоляція секретів від клієнта та наскрізна валідація Zod.
- [x] **Phase 15: Final QA & Release** — Повна верифікація збірки (Turbopack, TypeScript), документація та реліз.

---

## 🚀 Швидкий старт для розробки

1. **Клонуйте репозиторій:**
   ```bash
   git clone https://github.com/BoretskyVladyslav/GravityCRM.git
   cd GravityCRM
   ```

2. **Встановіть залежності:**
   ```bash
   npm install
   ```

3. **Налаштуйте змінні оточення:**
   ```bash
   cp .env.example .env.local
   # Заповніть NEXT_PUBLIC_SUPABASE_URL та NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

4. **Запустіть локальний сервер розробки:**
   ```bash
   npm run dev
   ```
   Відкрийте [http://localhost:3000](http://localhost:3000) у браузері.

---

## 👤 Автор & Репозиторій

- **Репозиторій:** [https://github.com/BoretskyVladyslav/GravityCRM](https://github.com/BoretskyVladyslav/GravityCRM)
- **Розробник:** BoretskyVladyslav
