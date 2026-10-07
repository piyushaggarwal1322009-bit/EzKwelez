-- ==============================================================================
-- EzyKwelez Supabase Migration: 20261007000001_create_profiles.sql
-- Phase 2: Profiles Foundation & Row Level Security (RLS)
-- Security Hardened: Client Privilege Escalation Prevention
-- ==============================================================================

-- Create profiles table linked 1:1 with auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comments for schema documentation
COMMENT ON TABLE public.profiles IS 'Application-level user profile data linked 1:1 with auth.users.';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users UUID.';
COMMENT ON COLUMN public.profiles.role IS 'User authorization role (student, staff, admin). Server/DB managed only.';

-- Trigger function to protect role column from unauthorized client updates and maintain updated_at
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Enforce immutable role: normal profile updates cannot change role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        NEW.role = OLD.role;
    END IF;
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Trigger to update updated_at and prevent client role escalation
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_role();

-- Trigger function to automatically create a profile entry when a new user signs up in auth.users
-- SECURITY: New public signups ALWAYS receive 'student' role. Client user_metadata role is strictly ignored.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'student' -- Explicitly hardcoded default role for public signups
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        -- role is never updated from user metadata
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- Trigger on auth.users after insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- RLS Policy: Users can only update their own profile (role immutability enforced by trigger)
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- RLS Policy: User insert allowed for matching UUID (with default student role)
CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
