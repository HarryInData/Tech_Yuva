-- ============================================================================
-- TECH YUVA DATABASE SCHEMA — MIGRATION 003
-- Supabase Storage Buckets & Policies for Banners and Avatars
-- ============================================================================

-- 1. Create public storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('event-banners', 'event-banners', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('avatars', 'avatars', true, 2097152, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE 
SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies for 'event-banners'
-- Public read access
DROP POLICY IF EXISTS "Public can view event banners" ON storage.objects;
CREATE POLICY "Public can view event banners"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-banners');

-- Only admins/mentors can upload event banners
DROP POLICY IF EXISTS "Staff can upload event banners" ON storage.objects;
CREATE POLICY "Staff can upload event banners"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'event-banners' 
        AND (public.is_mentor_or_admin() OR auth.role() = 'service_role')
    );

DROP POLICY IF EXISTS "Staff can update/delete event banners" ON storage.objects;
CREATE POLICY "Staff can update/delete event banners"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'event-banners' 
        AND (public.is_admin() OR auth.role() = 'service_role')
    );

-- 3. Storage Policies for 'avatars'
-- Public read access
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Authenticated users can upload and manage their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'service_role')
    );

DROP POLICY IF EXISTS "Users can update/delete own avatar" ON storage.objects;
CREATE POLICY "Users can update/delete own avatar"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'avatars' 
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin() OR auth.role() = 'service_role')
    );
