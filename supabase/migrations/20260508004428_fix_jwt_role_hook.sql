-- Re-grant permissions for the custom access token hook
-- Ensure the function exists and is correctly defined
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id   uuid;
    v_role      user_role;
    v_claims    jsonb;
BEGIN
    -- Extract the user id from the event envelope
    v_user_id := (event->>'user_id')::uuid;

    -- Look up the application role
    SELECT role
    INTO   v_role
    FROM   public.profiles
    WHERE  id = v_user_id;

    -- If no profile yet, default to customer
    IF v_role IS NULL THEN
        v_role := 'customer'::user_role;
    END IF;

    -- Merge custom claim into the existing claims object
    v_claims := coalesce(event->'claims', '{}'::jsonb)
                || jsonb_build_object('user_role', v_role::text);

    -- Return the modified event
    RETURN jsonb_set(event, '{claims}', v_claims);
END;
$$;

-- Grant execution to the necessary roles
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO postgres;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;

-- Ensure get_jwt_role is also solid
CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.jwt()->>'user_role';
$$;
