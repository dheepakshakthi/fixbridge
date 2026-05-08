-- Trigger function to automatically create a service_providers entry when a profile is set to 'provider'
CREATE OR REPLACE FUNCTION public.handle_provider_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role = 'provider'::user_role THEN
        INSERT INTO public.service_providers (
            profile_id,
            shop_name,
            is_verified,
            is_active,
            device_categories
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.full_name, 'New Shop'),
            true, -- Auto-verify for development ease
            true,
            ARRAY['PC', 'Laptop', 'Console', 'Mobile'] -- Default categories
        )
        ON CONFLICT (profile_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

-- Attach the trigger to the profiles table
DROP TRIGGER IF EXISTS trg_profiles_sync_provider ON public.profiles;
CREATE TRIGGER trg_profiles_sync_provider
    AFTER INSERT OR UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_provider_sync();

-- Backfill: Create service_providers for all existing profiles that have the 'provider' role
INSERT INTO public.service_providers (
    profile_id,
    shop_name,
    is_verified,
    is_active,
    device_categories
)
SELECT
    id,
    COALESCE(full_name, 'New Shop'),
    true,
    true,
    ARRAY['PC', 'Laptop', 'Console', 'Mobile']
FROM public.profiles
WHERE role = 'provider'
ON CONFLICT (profile_id) DO NOTHING;
