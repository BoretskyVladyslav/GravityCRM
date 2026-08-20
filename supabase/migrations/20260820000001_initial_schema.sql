-- ==============================================================================
-- GravityCRM: Initial Schema Migration (Phase 3)
-- Description: Core Enums, Tables, Foreign Keys, Indexes, Triggers, and Strict RLS
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE public.client_source AS ENUM (
        'FREELANCEHUNT',
        'TELEGRAM',
        'REFERRAL',
        'WEBSITE',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.client_status AS ENUM (
        'LEAD',
        'ACTIVE',
        'CLIENT',
        'PAUSED',
        'INACTIVE',
        'ARCHIVED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.project_status AS ENUM (
        'LEAD',
        'PLANNING',
        'IN_PROGRESS',
        'WAITING_CLIENT',
        'WAITING_PAYMENT',
        'REVISIONS',
        'COMPLETED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.payment_status AS ENUM (
        'PENDING',
        'PAID',
        'PARTIAL',
        'REFUNDED',
        'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.channel AS ENUM (
        'TELEGRAM',
        'FREELANCEHUNT',
        'EMAIL',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.direction AS ENUM (
        'INCOMING',
        'OUTGOING'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.task_status AS ENUM (
        'OPEN',
        'DONE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.currency AS ENUM (
        'USD',
        'EUR',
        'UAH',
        'PLN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES DEFINITION

-- 3.1. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    username TEXT,
    telegram_id BIGINT UNIQUE,
    phone TEXT,
    email TEXT,
    company TEXT,
    source public.client_source NOT NULL DEFAULT 'FREELANCEHUNT',
    status public.client_status NOT NULL DEFAULT 'LEAD',
    notes TEXT,
    last_contact_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status public.project_status NOT NULL DEFAULT 'LEAD',
    budget NUMERIC(12, 2) DEFAULT 0,
    currency public.currency NOT NULL DEFAULT 'USD',
    start_date DATE,
    deadline DATE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.3. Payments Table (Calculated on-the-fly, no redundant summary fields)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency public.currency NOT NULL DEFAULT 'USD',
    status public.payment_status NOT NULL DEFAULT 'PAID',
    payment_method TEXT,
    paid_at TIMESTAMPTZ DEFAULT now(),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4. Communication Log Table
CREATE TABLE IF NOT EXISTS public.communication_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    channel public.channel NOT NULL DEFAULT 'TELEGRAM',
    direction public.direction NOT NULL DEFAULT 'INCOMING',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.5. Tasks Table (Overdue is calculated dynamically from due_date)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    due_date DATE,
    status public.task_status NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 3.6. Telegram Updates Log Table (Idempotency & deduplication)
CREATE TABLE IF NOT EXISTS public.telegram_updates_log (
    update_id BIGINT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'processed',
    error_message TEXT
);

-- 4. PERFORMANCE & FOREIGN KEY INDEXES
CREATE INDEX IF NOT EXISTS idx_clients_owner_id ON public.clients(owner_id);
CREATE INDEX IF NOT EXISTS idx_clients_telegram_id ON public.clients(telegram_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

CREATE INDEX IF NOT EXISTS idx_payments_owner_id ON public.payments(owner_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

CREATE INDEX IF NOT EXISTS idx_communication_log_owner_id ON public.communication_log(owner_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_client_id ON public.communication_log(client_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_project_id ON public.communication_log(project_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_created_at ON public.communication_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_owner_id ON public.tasks(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 5. AUTOMATIC TIMESTAMP TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_clients_updated_at ON public.clients;
CREATE TRIGGER tr_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_projects_updated_at ON public.projects;
CREATE TRIGGER tr_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_updates_log ENABLE ROW LEVEL SECURITY;

-- 6.1. Clients RLS Policy
DROP POLICY IF EXISTS "Users can manage own clients" ON public.clients;
CREATE POLICY "Users can manage own clients"
    ON public.clients
    FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 6.2. Projects RLS Policy
DROP POLICY IF EXISTS "Users can manage own projects" ON public.projects;
CREATE POLICY "Users can manage own projects"
    ON public.projects
    FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 6.3. Payments RLS Policy
DROP POLICY IF EXISTS "Users can manage own payments" ON public.payments;
CREATE POLICY "Users can manage own payments"
    ON public.payments
    FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 6.4. Communication Log RLS Policy
DROP POLICY IF EXISTS "Users can manage own communication log" ON public.communication_log;
CREATE POLICY "Users can manage own communication log"
    ON public.communication_log
    FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 6.5. Tasks RLS Policy
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.tasks;
CREATE POLICY "Users can manage own tasks"
    ON public.tasks
    FOR ALL
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- 6.6. Telegram Updates Log Policy (Service role has full access; Authenticated can read)
DROP POLICY IF EXISTS "Authenticated users can view telegram updates log" ON public.telegram_updates_log;
CREATE POLICY "Authenticated users can view telegram updates log"
    ON public.telegram_updates_log
    FOR SELECT
    TO authenticated
    USING (true);

-- 7. COMPUTED FINANCIAL SUMMARY VIEW (Calculated on-the-fly)
CREATE OR REPLACE VIEW public.project_financial_summaries AS
SELECT
    p.id AS project_id,
    p.owner_id,
    p.client_id,
    p.title,
    p.budget,
    p.currency,
    p.status AS project_status,
    COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID'), 0) AS total_paid,
    (p.budget - COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID'), 0)) AS remaining_balance,
    CASE
        WHEN COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID'), 0) >= p.budget AND p.budget > 0 THEN 'PAID'
        WHEN COALESCE(SUM(pay.amount) FILTER (WHERE pay.status = 'PAID'), 0) > 0 THEN 'PARTIAL'
        ELSE 'UNPAID'
    END AS computed_payment_status
FROM public.projects p
LEFT JOIN public.payments pay ON p.id = pay.project_id
GROUP BY p.id, p.owner_id, p.client_id, p.title, p.budget, p.currency, p.status;
