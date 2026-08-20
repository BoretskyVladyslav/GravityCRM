# CRM для фриланс-проєктів — Discovery та архітектура (Phase 0)

*Підготовлено як відправна точка для реалізації в Claude Code. Наступний крок — Phase 1 (Project Setup) у реальному репозиторії, не в цьому документі.*

---

## 1. Рекомендований стек

Стек з master-промпту підтверджений як актуальний станом на серпень 2026:

- **Frontend:** Next.js 16 (App Router, Turbopack за замовчуванням), React 19, TypeScript, Tailwind CSS
- **UI-компоненти:** shadcn/ui — доречно для CRM-панелі, дає готові доступні компоненти (таблиці, форми, діалоги) без ваги повноцінної бібліотеки
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, Row Level Security) — виправдано для проєкту такого розміру: одне середовище закриває базу даних, автентифікацію, файли й серверну логіку без окремого бекенд-сервера
- **Telegram:** Telegram Bot API через webhook на Supabase Edge Function

Next.js 14 вважається застарілим станом на середину 2026 — починати варто одразу з 16.x, не з 14 чи 15.

## 2. Системна архітектура

```
Browser (Next.js App Router, React Server Components)
        ↓
Next.js Server Actions / Route Handlers
        ↓
Supabase Client (SSR + Client, з RLS-захистом на рівні рядків)
        ↓
PostgreSQL (Supabase)

Окремо:
Telegram → webhook → Supabase Edge Function → пошук/створення клієнта → запис у CRM
```

Ключове архітектурне рішення: UI не звертається до Telegram Bot API напряму. Вся Telegram-логіка — на Edge Function (серверна сторона), токен бота ніколи не потрапляє у frontend-бандл.

## 3. Database ERD (текстова схема)

```
clients ──┬── projects ──┬── payments
          │              ├── tasks
          │              └── communication_log
          ├── communication_log
          ├── tasks
          └── notes (опційно окрема таблиця або поле notes на clients/projects)
```

`communication_log` і `tasks` мають опційний `project_id` — повідомлення чи задача може стосуватись клієнта загалом, не конкретного проєкту.

## 4. Таблиці бази даних

**clients**
```
id            uuid, pk
full_name     text, not null
username      text
telegram_id   bigint, unique, nullable
phone         text
email         text
company       text
source        enum(client_source)
status        enum(client_status)
notes         text
created_at    timestamptz, default now()
updated_at    timestamptz
last_contact_at  timestamptz
```

**projects**
```
id            uuid, pk
client_id     uuid, fk → clients, not null
title         text, not null
description   text
status        enum(project_status)
budget        numeric(12,2)
currency      enum(currency)
start_date    date
deadline      date
completed_at  timestamptz
notes         text
created_at    timestamptz
updated_at    timestamptz
```

**payments**
```
id            uuid, pk
client_id     uuid, fk → clients, not null
project_id    uuid, fk → projects, nullable
amount        numeric(12,2), not null
currency      enum(currency)
status        enum(payment_status)
payment_method text
paid_at       timestamptz
description   text
created_at    timestamptz
```

**communication_log**
```
id            uuid, pk
client_id     uuid, fk → clients, not null
project_id    uuid, fk → projects, nullable
channel       enum(channel)
direction     enum(direction)
message       text, not null
created_at    timestamptz, default now()
```

**tasks**
```
id            uuid, pk
client_id     uuid, fk → clients, nullable
project_id    uuid, fk → projects, nullable
title         text, not null
due_date      date
status        enum(task_status)
created_at    timestamptz
completed_at  timestamptz
```

**Enum-и:**
```
client_source: FREELANCEHUNT, TELEGRAM, REFERRAL, WEBSITE, OTHER
client_status: LEAD, ACTIVE, CLIENT, PAUSED, INACTIVE, ARCHIVED
project_status: LEAD, PLANNING, IN_PROGRESS, WAITING_CLIENT, WAITING_PAYMENT, REVISIONS, COMPLETED, CANCELLED
payment_status: PENDING, PAID, PARTIAL, REFUNDED, CANCELLED
channel: TELEGRAM, FREELANCEHUNT, EMAIL, OTHER
direction: INCOMING, OUTGOING
task_status: OPEN, DONE (OVERDUE обчислюється на льоту з due_date, не окремий статус у базі)
currency: USD, EUR, UAH, PLN
```

Індекси: `clients.telegram_id` (unique), `projects.client_id`, `payments.project_id`, `payments.client_id`, `communication_log.client_id`, `tasks.due_date` (для запиту прострочених задач на дашборді).

RLS: увімкнено на всіх таблицях, доступ тільки для автентифікованого власника акаунта — просте правило `auth.uid() = owner_id` з полем `owner_id` на верхньому рівні кожної таблиці, готове розширюватись, якщо в майбутньому буде кілька користувачів команди.

## 5. Client lifecycle

```
LEAD → ACTIVE → CLIENT → (PAUSED ↔ ACTIVE) → INACTIVE → ARCHIVED
```

`LEAD` — контакт є, проєкту ще немає. `ACTIVE` — ведуться перемовини або є активний проєкт. `CLIENT` — має хоч один завершений оплачений проєкт (довгостроковий статус, не втрачається навіть при паузі). `INACTIVE` — давно немає активності, не архівовано. `ARCHIVED` — видалення замінене архівацією, історія зберігається.

## 6. Project lifecycle

```
LEAD → PLANNING → IN_PROGRESS → (WAITING_CLIENT / WAITING_PAYMENT / REVISIONS ↔ IN_PROGRESS) → COMPLETED
                                                                                              ↘ CANCELLED
```

## 7. Payment model

Кожен `payment` прив'язаний до `project_id` (nullable — можлива передоплата ще до створення проєкту, прив'язана тільки до клієнта). Сторінка проєкту рахує на льоту:

```
paid = SUM(payments.amount WHERE status = PAID)
remaining = project.budget - paid
```

Без окремого поля "оплачено" на проєкті — щоб не дублювати дані.

## 8. Communication model

MVP: ручне логування повідомлень (не повноцінний чат-клієнт). Telegram-інтеграція на Phase 10 автоматично створює записи в `communication_log` через webhook, без ручного введення для цього каналу.

## 9. Telegram integration architecture

```
Telegram User → Bot → Webhook (Supabase Edge Function)
                          ↓
              Перевірка секрету webhook
                          ↓
              Пошук клієнта за telegram_id
                          ↓
         Знайдено? → додати запис у communication_log
         Не знайдено? → створити клієнта (status=LEAD, source=TELEGRAM) + запис
                          ↓
              Оновити clients.last_contact_at
```

Ідемпотентність: перевірка `update_id` від Telegram перед записом, щоб повторний webhook-виклик не дублював повідомлення.

## 10. Навігаційна структура

```
Dashboard
Clients
Projects
Payments
Tasks
Settings
```

Без окремих розділів для Communication чи Notes — вони живуть на сторінці клієнта/проєкту.

## 11. Dashboard структура

```
СЬОГОДНІ
— нові ліди
— прострочені задачі
— клієнти, яким треба відповісти

ПРОЄКТИ (згруповано за статусом)
— active / waiting / revision / completed (кількість)

ГРОШІ
— total project value / paid / outstanding

КЛІЄНТИ
— total / active / new цього місяця
```

Максимум 4 блоки, без графіків на MVP.

## 12. MVP-межі

**Входить:** Auth, Clients (CRUD + пошук + фільтри), Projects (CRUD + статуси), Payments (додавання + фінансовий підсумок на сторінці проєкту), Tasks (створення + due date + overdue), Communication timeline (ручний запис), Dashboard, глобальний пошук, Telegram-інтеграція (базова: webhook + client matching + запис у timeline).

**Не входить:** повноцінний чат-клієнт, AI-модуль, складна звітність/BI, ролі й права для команди, інвойси, мультивалютна конвертація за курсом, мобільний нативний застосунок.

## 13. Майбутній roadmap

**v1.1:** покращення Telegram (двосторонні повідомлення прямо з CRM), нагадування про задачі, розширена аналітика по джерелах.
**v1.2:** AI-підсумки розмов, скоринг лідів, автоматичні пропозиції наступної дії (з обов'язковим human approval, без автономних рішень).
**v2:** глибша автоматизація, кілька користувачів команди, права доступу, інвойси, документи, додаткові інтеграції — можливо, саме тут з'єднання з існуючими агентами ставок/гачка/ведення для Freelancehunt, якщо буде сенс.

## 14. Security architecture

Auth і RLS обов'язкові з першої фази, не додаються "потім". Telegram bot token і Supabase service role key — тільки в environment variables на сервері, ніколи у client-бандлі. Webhook endpoint перевіряє секрет і `update_id` для ідемпотентності. Видалення фінансових записів обмежене — тільки архівація для клієнтів/проєктів, для платежів — розгляд статусу `CANCELLED`/`REFUNDED` замість фізичного видалення.

## 15. Структура папок (орієнтовно, Next.js App Router)

```
app/
  (auth)/login/
  (dashboard)/
    dashboard/
    clients/[id]/
    projects/[id]/
    payments/
    tasks/
    settings/
  api/
    telegram/webhook/route.ts
lib/
  supabase/          — client, server, middleware helpers
  types/              — генеровані типи з Supabase schema
  validations/        — Zod-схеми форм
components/
  ui/                 — shadcn/ui компоненти
  clients/
  projects/
  payments/
  dashboard/
supabase/
  migrations/
  functions/
    telegram-webhook/
```

## 16. Поетапний план реалізації

Фази 1-15 з master-промпту залишаються без змін — вони вже добре структуровані й відповідають MVP-межам вище:

```
Phase 1  — Architecture (цей документ закриває більшість цього кроку)
Phase 2  — Project setup (Next.js, TS, Tailwind, shadcn, Supabase, лінтинг)
Phase 3  — Database (міграції, таблиці, enum-и, RLS)
Phase 4  — Auth
Phase 5  — Clients
Phase 6  — Projects
Phase 7  — Payments
Phase 8  — Tasks
Phase 9  — Communication (ручний запис)
Phase 10 — Telegram
Phase 11 — Dashboard
Phase 12 — Search & Filters
Phase 13 — UX polish
Phase 14 — Security audit
Phase 15 — Final QA
```

---

**Наступний крок:** відкрити цей документ у Claude Code разом з master-промптом, підтвердити чи є зауваження до архітектури вище, і почати Phase 2 (Project Setup) у реальному репозиторії.
