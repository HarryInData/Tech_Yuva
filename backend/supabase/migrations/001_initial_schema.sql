-- ============================================================================
-- TECH YUVA DATABASE SCHEMA — MIGRATION 001
-- Tables, Enums, Foreign Keys, Triggers, and Constraints
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'mentor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_mode AS ENUM ('online', 'offline', 'hybrid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('draft', 'upcoming', 'ongoing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('confirmed', 'waitlist', 'cancelled', 'attended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE contact_status AS ENUM ('new', 'read', 'replied', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------------------
-- 2. USER PROFILES (Linked 1-to-1 with Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    bio TEXT,
    college TEXT,
    city TEXT,
    interests TEXT[] DEFAULT '{}',
    github_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    phone TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to create a profile automatically when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        avatar_url,
        college,
        city,
        interests
    )
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role),
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'college',
        new.raw_user_meta_data->>'city',
        CASE
            WHEN new.raw_user_meta_data->'interests' IS NOT NULL
            THEN ARRAY(SELECT json_array_elements_text(new.raw_user_meta_data->'interests'))
            ELSE '{}'::text[]
        END
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. COHORTS & ADMISSIONS (Powers "Admission Open · New Cohort 2026")
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,                         -- e.g. "New Cohort 2026"
    code TEXT NOT NULL UNIQUE,                  -- e.g. "cohort-2026"
    year INTEGER NOT NULL DEFAULT 2026,
    badge_label TEXT NOT NULL DEFAULT 'Admission Open · New Cohort 2026',
    description TEXT,
    is_admissions_open BOOLEAN NOT NULL DEFAULT true,
    start_date DATE,
    end_date DATE,
    application_deadline TIMESTAMPTZ,
    max_capacity INTEGER NOT NULL DEFAULT 250,
    accepted_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 4. COMMUNITY APPLICATIONS (Join Community / Cohort Application Form)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    cohort_id UUID REFERENCES public.cohorts(id) ON DELETE RESTRICT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT NOT NULL,
    city TEXT NOT NULL,
    interests TEXT[] NOT NULL DEFAULT '{}',     -- ['AI', 'Web3', 'Cyber Security', 'Web Dev', 'Startups']
    github_url TEXT,
    portfolio_url TEXT,
    statement_of_purpose TEXT,
    cohort_year INTEGER NOT NULL DEFAULT 2026,
    status application_status NOT NULL DEFAULT 'pending',
    review_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    welcome_email_sent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_email_per_cohort UNIQUE (cohort_id, email)
);

-- Index for speedy queries on applications
CREATE INDEX IF NOT EXISTS idx_comm_app_email ON public.community_applications(email);
CREATE INDEX IF NOT EXISTS idx_comm_app_status ON public.community_applications(status);
CREATE INDEX IF NOT EXISTS idx_comm_app_cohort ON public.community_applications(cohort_id);

-- ----------------------------------------------------------------------------
-- 5. EVENTS (DropHack'26, Workshops, Meetups)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    duration TEXT NOT NULL,                      -- e.g. "10 Hours Offline"
    mode event_mode NOT NULL DEFAULT 'offline',
    venue TEXT NOT NULL,                         -- Physical venue or meeting link
    capacity INTEGER NOT NULL DEFAULT 200,
    registered_count INTEGER NOT NULL DEFAULT 0,
    banner_url TEXT,
    prize_pool TEXT,                             -- e.g. "₹50,000+"
    team_size TEXT DEFAULT '2–4 Members',
    themes TEXT[] DEFAULT '{}',                  -- ['FinTech', 'AI', 'Web3', 'Cybersecurity', 'Healthcare']
    stages JSONB DEFAULT '[]'::jsonb,            -- Qualifier, Finale stages
    registration_link TEXT,                      -- Fallback e.g. Unstop link
    status event_status NOT NULL DEFAULT 'upcoming',
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);

-- ----------------------------------------------------------------------------
-- 6. EVENT REGISTRATIONS (Direct RSVPs & Attendee Management)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT,
    team_name TEXT,
    team_members JSONB DEFAULT '[]'::jsonb,
    status registration_status NOT NULL DEFAULT 'confirmed',
    confirmation_email_sent BOOLEAN NOT NULL DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_event_registration UNIQUE (event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON public.event_registrations(user_id);

-- ----------------------------------------------------------------------------
-- 7. ANNOUNCEMENTS / GUILD UPDATES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',     -- 'Cohort', 'Hackathon', 'Workshop'
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 8. CONTACT MESSAGES & NEWSLETTER
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status contact_status NOT NULL DEFAULT 'new',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    source TEXT DEFAULT 'footer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 9. DYNAMIC COUNTER CACHE / STATS LOG
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_metrics (
    key TEXT PRIMARY KEY,
    numeric_value INTEGER NOT NULL DEFAULT 0,
    label TEXT NOT NULL,
    display_suffix TEXT DEFAULT '+',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ----------------------------------------------------------------------------
-- 10. HELPER FUNCTIONS & TRIGGERS FOR AUTO-UPDATING TIMESTAMPS & COUNTS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    new.updated_at = timezone('utc'::text, now());
    RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER update_cohorts_timestamp BEFORE UPDATE ON public.cohorts FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER update_applications_timestamp BEFORE UPDATE ON public.community_applications FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER update_events_timestamp BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER update_registrations_timestamp BEFORE UPDATE ON public.event_registrations FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Trigger to increment/decrement event registered_count
CREATE OR REPLACE FUNCTION public.handle_event_capacity_change()
RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND new.status = 'confirmed') THEN
        UPDATE public.events SET registered_count = registered_count + 1 WHERE id = new.event_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (old.status = 'confirmed' AND new.status != 'confirmed') THEN
            UPDATE public.events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = new.event_id;
        ELSIF (old.status != 'confirmed' AND new.status = 'confirmed') THEN
            UPDATE public.events SET registered_count = registered_count + 1 WHERE id = new.event_id;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND old.status = 'confirmed') THEN
        UPDATE public.events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = old.event_id;
    END IF;
    RETURN coalesce(new, old);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_event_capacity_change ON public.event_registrations;
CREATE TRIGGER trg_event_capacity_change
    AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
    FOR EACH ROW EXECUTE PROCEDURE public.handle_event_capacity_change();
