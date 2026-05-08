-- Update the ticket number generation function to include the extensions schema in its search path.
-- This is necessary because gen_random_bytes() is provided by pgcrypto, which may be in the extensions schema.

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_year    text;
    v_suffix  text;
    v_number  text;
    v_attempt integer := 0;
BEGIN
    -- Only generate if not already set (allows explicit override in tests)
    IF NEW.ticket_number IS NOT NULL THEN
        RETURN NEW;
    END IF;

    v_year := to_char(now(), 'YYYY');

    LOOP
        v_attempt := v_attempt + 1;

        -- 6 random uppercase alphanumeric characters
        v_suffix := upper(
            substring(
                replace(replace(replace(
                    encode(gen_random_bytes(6), 'base64'),
                    '+', 'A'), '/', 'B'), '=', 'C'
                ), 1, 6
            )
        );

        v_number := 'FXB-' || v_year || '-' || v_suffix;

        -- Check uniqueness (extremely unlikely to collide, but safe)
        IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE ticket_number = v_number) THEN
            NEW.ticket_number := v_number;
            RETURN NEW;
        END IF;

        -- Safety valve: give up after 10 attempts (should never happen in practice)
        IF v_attempt >= 10 THEN
            RAISE EXCEPTION 'generate_ticket_number: could not generate unique ticket number after % attempts', v_attempt;
        END IF;
    END LOOP;
END;
$$;
