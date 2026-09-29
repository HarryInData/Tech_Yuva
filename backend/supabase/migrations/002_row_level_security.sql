-- ============================================================================
-- TECH YUVA DATABASE SCHEMA — MIGRATION 002
-- Row Level Security (RLS) Policies for Roles: student, mentor, admin
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS TO QUERY CURRENT USER ROLE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_mentor_or_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('mentor'::public.user_role, 'admin'::public.user_role)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. ENABLE RLS ON ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. PROFILES POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can view public profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (is_public = true OR auth.uid() = id OR public.is_admin());

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile (including changing roles)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. COHORTS POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can read cohorts to check "Admission Open" status
DROP POLICY IF EXISTS "Cohorts are viewable by everyone" ON public.cohorts;
CREATE POLICY "Cohorts are viewable by everyone"
    ON public.cohorts FOR SELECT
    USING (true);

-- Only admins can create, update, or delete cohorts
DROP POLICY IF EXISTS "Admins have full access to cohorts" ON public.cohorts;
CREATE POLICY "Admins have full access to cohorts"
    ON public.cohorts FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. COMMUNITY APPLICATIONS POLICIES
-- ----------------------------------------------------------------------------
-- Anyone (authenticated or guest) can submit an application to join
DROP POLICY IF EXISTS "Anyone can submit a community application" ON public.community_applications;
CREATE POLICY "Anyone can submit a community application"
    ON public.community_applications FOR INSERT
    WITH CHECK (true);

-- Users can view their own application
DROP POLICY IF EXISTS "Users can view their own application" ON public.community_applications;
CREATE POLICY "Users can view their own application"
    ON public.community_applications FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.email() = email 
        OR public.is_admin()
    );

-- Admins and mentors can review/update applications
DROP POLICY IF EXISTS "Staff can review applications" ON public.community_applications;
CREATE POLICY "Staff can review applications"
    ON public.community_applications FOR ALL
    USING (public.is_mentor_or_admin());

-- ----------------------------------------------------------------------------
-- 6. EVENTS POLICIES
-- ----------------------------------------------------------------------------
-- Public can view non-draft events
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events"
    ON public.events FOR SELECT
    USING (status != 'draft'::public.event_status OR public.is_admin());

-- Admins can manage events
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events"
    ON public.events FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. EVENT REGISTRATIONS POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can register for an upcoming event
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;
CREATE POLICY "Users can register for events"
    ON public.event_registrations FOR INSERT
    WITH CHECK (true);

-- Users can view their own registration
DROP POLICY IF EXISTS "Users can view own registration" ON public.event_registrations;
CREATE POLICY "Users can view own registration"
    ON public.event_registrations FOR SELECT
    USING (
        auth.uid() = user_id 
        OR auth.email() = email 
        OR public.is_admin()
    );

-- Users can cancel their own registration
DROP POLICY IF EXISTS "Users can cancel own registration" ON public.event_registrations;
CREATE POLICY "Users can cancel own registration"
    ON public.event_registrations FOR UPDATE
    USING (auth.uid() = user_id OR auth.email() = email)
    WITH CHECK (auth.uid() = user_id OR auth.email() = email);

-- Admins have full access to event registrations
DROP POLICY IF EXISTS "Admins can manage event registrations" ON public.event_registrations;
CREATE POLICY "Admins can manage event registrations"
    ON public.event_registrations FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. ANNOUNCEMENTS POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can view announcements
DROP POLICY IF EXISTS "Announcements viewable by everyone" ON public.announcements;
CREATE POLICY "Announcements viewable by everyone"
    ON public.announcements FOR SELECT
    USING (true);

-- Admins can manage announcements
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements"
    ON public.announcements FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. CONTACT MESSAGES & NEWSLETTER POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can submit a contact message or subscribe to newsletter
DROP POLICY IF EXISTS "Anyone can submit contact message" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact message"
    ON public.contact_messages FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
    ON public.newsletter_subscribers FOR INSERT
    WITH CHECK (true);

-- Only admins can read contact messages & subscriber lists
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages"
    ON public.contact_messages FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view subscribers"
    ON public.newsletter_subscribers FOR ALL
    USING (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. SYSTEM METRICS (Live Impact Stats)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "System metrics are viewable by everyone" ON public.system_metrics;
CREATE POLICY "System metrics are viewable by everyone"
    ON public.system_metrics FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage system metrics" ON public.system_metrics;
CREATE POLICY "Admins can manage system metrics"
    ON public.system_metrics FOR ALL
    USING (public.is_admin());
