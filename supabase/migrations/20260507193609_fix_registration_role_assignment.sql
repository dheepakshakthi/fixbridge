-- Fix registration role assignment by updating handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            (NEW.raw_user_meta_data->>'user_role')::user_role,
            'customer'::user_role
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;
