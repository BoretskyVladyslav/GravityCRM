-- ==============================================================================
-- GravityCRM: Development Seed Script (Phase 3)
-- Usage: Run in Supabase SQL Editor or via Supabase CLI (`supabase db reset`)
-- Note: Replaces <TEST_USER_ID> with the actual auth.users id of the logged-in user
-- ==============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_client_1 UUID;
    v_client_2 UUID;
    v_client_3 UUID;
    v_project_1 UUID;
    v_project_2 UUID;
BEGIN
    -- 1. Grab first existing user in auth.users or fallback
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No auth.users found. Register or create a user before running seed data.';
        RETURN;
    END IF;

    -- 2. Insert Sample Clients
    INSERT INTO public.clients (owner_id, full_name, username, telegram_id, phone, email, company, source, status, notes, last_contact_at)
    VALUES
        (v_user_id, 'Олександр Мельник', 'oleksandr_m', 987654321, '+380501234567', 'oleksandr@example.com', 'TechHub Kyiv', 'FREELANCEHUNT', 'CLIENT', 'Постійний замовник, оплачує вчасно', now() - interval '2 days')
    RETURNING id INTO v_client_1;

    INSERT INTO public.clients (owner_id, full_name, username, telegram_id, phone, email, company, source, status, notes, last_contact_at)
    VALUES
        (v_user_id, 'Sarah Jenkins', 'sarah_dev', 876543210, '+14155552671', 'sarah@fintech-global.io', 'Fintech Global LLC', 'TELEGRAM', 'ACTIVE', 'Обговорюємо редизайн дашборду', now() - interval '5 hours')
    RETURNING id INTO v_client_2;

    INSERT INTO public.clients (owner_id, full_name, username, telegram_id, phone, email, company, source, status, notes, last_contact_at)
    VALUES
        (v_user_id, 'Дмитро Коваленко', 'dmytro_koval', 765432109, '+380679876543', 'dmytro@startuphouse.ua', 'StartupHouse', 'REFERRAL', 'LEAD', 'Цікавиться розробкою MVP для стартапу', now() - interval '1 day')
    RETURNING id INTO v_client_3;

    -- 3. Insert Sample Projects
    INSERT INTO public.projects (owner_id, client_id, title, description, status, budget, currency, start_date, deadline, notes)
    VALUES
        (v_user_id, v_client_1, 'Корпоративний портал та CRM', 'Розробка Next.js веб-додатку з кастомною базою даних Supabase', 'IN_PROGRESS', 2500.00, 'USD', CURRENT_DATE - 14, CURRENT_DATE + 30, 'Спринт 2 у процесі')
    RETURNING id INTO v_project_1;

    INSERT INTO public.projects (owner_id, client_id, title, description, status, budget, currency, start_date, deadline, notes)
    VALUES
        (v_user_id, v_client_2, 'UI/UX редизайн кабінету клієнта', 'Редизайн компонентів інтерфейсу на Tailwind CSS та shadcn/ui', 'PLANNING', 1200.00, 'USD', CURRENT_DATE - 2, CURRENT_DATE + 15, 'Очікуємо фінальні макети Figma')
    RETURNING id INTO v_project_2;

    -- 4. Insert Sample Payments (Calculated on the fly)
    INSERT INTO public.payments (owner_id, client_id, project_id, amount, currency, status, payment_method, paid_at, description)
    VALUES
        (v_user_id, v_client_1, v_project_1, 1000.00, 'USD', 'PAID', 'Банківський переказ (IBAN)', now() - interval '10 days', 'Авансовий платіж 40%'),
        (v_user_id, v_client_1, v_project_1, 500.00, 'USD', 'PAID', 'Stripe / Картка', now() - interval '2 days', 'Проміжний платіж за етап 1'),
        (v_user_id, v_client_2, v_project_2, 300.00, 'USD', 'PENDING', 'Crypto / USDT', NULL, 'Запланований аванс');

    -- 5. Insert Sample Communication Log
    INSERT INTO public.communication_log (owner_id, client_id, project_id, channel, direction, message, created_at)
    VALUES
        (v_user_id, v_client_1, v_project_1, 'FREELANCEHUNT', 'INCOMING', 'Вітаю! Переглянув перший етап, все виглядає чудово, оплату відправив.', now() - interval '2 days'),
        (v_user_id, v_client_1, v_project_1, 'FREELANCEHUNT', 'OUTGOING', 'Дякую, Олександр! Оплату отримав, приступаємо до другої фази інтеграції.', now() - interval '2 days' + interval '10 minutes'),
        (v_user_id, v_client_2, v_project_2, 'TELEGRAM', 'INCOMING', 'Привіт! Чи зможемо додати темну тему до кінця тижня?', now() - interval '5 hours');

    -- 6. Insert Sample Tasks
    INSERT INTO public.tasks (owner_id, client_id, project_id, title, due_date, status, created_at)
    VALUES
        (v_user_id, v_client_1, v_project_1, 'Налаштувати RLS політики для таблиць угод', CURRENT_DATE + 2, 'OPEN', now()),
        (v_user_id, v_client_2, v_project_2, 'Підготувати презентацію UI компонентів', CURRENT_DATE - 1, 'OPEN', now() - interval '3 days'), -- Overdue demo
        (v_user_id, v_client_3, NULL, 'Відправити комерційну пропозицію для стартапу', CURRENT_DATE + 1, 'OPEN', now());

    RAISE NOTICE 'Demo seed data successfully inserted for user %!', v_user_id;
END $$;
