-- 1. Improve search_path for critical functions to ensure they can access auth and extensions
-- 2. Make RLS policies more robust by checking profiles table as a fallback for JWT claims

-- Update get_jwt_role to include auth schema in search_path
CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
    SELECT auth.jwt()->>'user_role';
$$;

-- Update custom_access_token_hook to include public and extensions
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
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

-- Make ticket insertion more robust by checking the profiles table directly if the JWT claim is missing
DROP POLICY IF EXISTS "tickets_insert_customer" ON public.tickets;
CREATE POLICY "tickets_insert_customer"
    ON public.tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (
        (
            public.get_jwt_role() = 'customer'
            OR EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'customer'
            )
        )
        AND customer_id = auth.uid()
    );

-- Update select/update policies to also be more robust
DROP POLICY IF EXISTS "tickets_select_admin" ON public.tickets;
CREATE POLICY "tickets_select_admin"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (
        public.get_jwt_role() IN ('admin', 'super_admin')
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "tickets_update_admin" ON public.tickets;
CREATE POLICY "tickets_update_admin"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (
        public.get_jwt_role() IN ('admin', 'super_admin')
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        public.get_jwt_role() IN ('admin', 'super_admin')
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

DROP POLICY IF EXISTS "tickets_delete_admin" ON public.tickets;
CREATE POLICY "tickets_delete_admin"
    ON public.tickets
    FOR DELETE
    TO authenticated
    USING (
        public.get_jwt_role() IN ('admin', 'super_admin')
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );
