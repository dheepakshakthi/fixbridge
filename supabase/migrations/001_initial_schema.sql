-- =============================================================================
-- FixBridge — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Two-sided repair-service marketplace schema covering profiles,
--              service providers, tickets, quotes, deliveries, reviews,
--              notifications, audit events, RLS policies, indexes, and hooks.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS "pg_net";     -- async HTTP (for edge function calls)

-- =============================================================================
-- SECTION 1 — ENUMS
-- =============================================================================

CREATE TYPE ticket_status AS ENUM (
    'draft',
    'submitted',
    'quoted',
    'accepted',
    'in_repair',
    'ready',
    'completed',
    'cancelled',
    'disputed'
);

CREATE TYPE service_mode AS ENUM (
    'dropoff',
    'pickup',
    'delivery'
);

CREATE TYPE urgency_level AS ENUM (
    'urgent',
    'standard',
    'flexible'
);

CREATE TYPE delivery_status AS ENUM (
    'scheduled',
    'pickup_assigned',
    'picked_up',
    'in_transit',
    'delivered'
);

CREATE TYPE quote_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'expired'
);

CREATE TYPE user_role AS ENUM (
    'customer',
    'provider',
    'admin',
    'super_admin'
);

-- =============================================================================
-- SECTION 2 — TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 2.1  profiles
-- Mirrors auth.users 1-to-1.  Created automatically via trigger on signup.
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   text,
    phone       text,
    avatar_url  text,
    role        user_role   NOT NULL DEFAULT 'customer',
    is_active   boolean     NOT NULL DEFAULT true,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.profiles             IS 'One-to-one extension of auth.users with application-level user metadata.';
COMMENT ON COLUMN public.profiles.id          IS 'Must match auth.users.id exactly.';
COMMENT ON COLUMN public.profiles.role        IS 'Application role used in JWT claims and RLS policies.';

-- ---------------------------------------------------------------------------
-- 2.2  service_providers
-- ---------------------------------------------------------------------------
CREATE TABLE public.service_providers (
    id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id        uuid        UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    shop_name         text        NOT NULL,
    description       text,
    logo_url          text,
    device_categories text[]      NOT NULL DEFAULT '{}',
    services_offered  text[]      NOT NULL DEFAULT '{}',
    city              text,
    state             text,
    pincode           text,
    latitude          numeric,
    longitude         numeric,
    is_verified       boolean     NOT NULL DEFAULT false,
    is_active         boolean     NOT NULL DEFAULT true,
    avg_rating        numeric     NOT NULL DEFAULT 0,
    total_reviews     integer     NOT NULL DEFAULT 0,
    working_hours     jsonb       NOT NULL DEFAULT '{}',
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_avg_rating     CHECK (avg_rating   >= 0 AND avg_rating   <= 5),
    CONSTRAINT chk_total_reviews  CHECK (total_reviews >= 0),
    CONSTRAINT chk_latitude       CHECK (latitude      IS NULL OR (latitude  >= -90  AND latitude  <= 90)),
    CONSTRAINT chk_longitude      CHECK (longitude     IS NULL OR (longitude >= -180 AND longitude <= 180))
);

COMMENT ON TABLE  public.service_providers              IS 'Repair shop / technician profiles. A user must hold role=provider to own one.';
COMMENT ON COLUMN public.service_providers.working_hours IS 'JSON map keyed by ISO day (Mon–Sun) with open/close times. Example: {"Mon":{"open":"09:00","close":"18:00"}}.';

-- ---------------------------------------------------------------------------
-- 2.3  tickets
-- ---------------------------------------------------------------------------
CREATE TABLE public.tickets (
    id                  uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number       text            UNIQUE,
    customer_id         uuid            NOT NULL REFERENCES public.profiles(id)          ON DELETE RESTRICT,
    provider_id         uuid                     REFERENCES public.service_providers(id) ON DELETE SET NULL,
    device_type         text            NOT NULL,
    brand               text,
    model               text,
    issue_description   text            NOT NULL,
    issue_images        text[]          NOT NULL DEFAULT '{}',
    status              ticket_status   NOT NULL DEFAULT 'draft',
    service_mode        service_mode    NOT NULL,
    urgency             urgency_level   NOT NULL DEFAULT 'standard',
    customer_address    jsonb,
    preferred_date      date,
    completion_report   text,
    internal_notes      text,
    created_at          timestamptz     NOT NULL DEFAULT now(),
    updated_at          timestamptz     NOT NULL DEFAULT now(),

    CONSTRAINT chk_device_type CHECK (device_type IN ('PC', 'Laptop', 'Console', 'Mobile'))
);

COMMENT ON TABLE  public.tickets                     IS 'A repair request raised by a customer.';
COMMENT ON COLUMN public.tickets.ticket_number       IS 'Human-readable reference in format FXB-YYYY-XXXXXX, generated by trigger.';
COMMENT ON COLUMN public.tickets.customer_address    IS 'Snapshot of the customer address at the time of submission (for pickup/delivery modes).';
COMMENT ON COLUMN public.tickets.internal_notes      IS 'Provider-visible internal notes; not shown to customers.';

-- ---------------------------------------------------------------------------
-- 2.4  quotes
-- ---------------------------------------------------------------------------
CREATE TABLE public.quotes (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id       uuid            NOT NULL REFERENCES public.tickets(id)           ON DELETE CASCADE,
    provider_id     uuid            NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
    amount          numeric         NOT NULL,
    currency        text            NOT NULL DEFAULT 'INR',
    line_items      jsonb           NOT NULL DEFAULT '[]',
    estimated_days  integer,
    notes           text,
    status          quote_status    NOT NULL DEFAULT 'pending',
    valid_until     timestamptz,
    created_at      timestamptz     NOT NULL DEFAULT now(),
    updated_at      timestamptz     NOT NULL DEFAULT now(),

    CONSTRAINT chk_amount         CHECK (amount         >  0),
    CONSTRAINT chk_estimated_days CHECK (estimated_days IS NULL OR (estimated_days >= 1 AND estimated_days <= 90))
);

COMMENT ON TABLE  public.quotes             IS 'Cost estimate submitted by a provider for a ticket.';
COMMENT ON COLUMN public.quotes.line_items  IS 'Array of {label, qty, unit_price} objects for itemised breakdown.';

-- ---------------------------------------------------------------------------
-- 2.5  deliveries
-- ---------------------------------------------------------------------------
CREATE TABLE public.deliveries (
    id                  uuid                PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id           uuid                UNIQUE NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    tracking_code       text                UNIQUE NOT NULL,
    direction           text                NOT NULL,
    status              delivery_status     NOT NULL DEFAULT 'scheduled',
    pickup_address      jsonb,
    delivery_address    jsonb,
    agent_name          text,
    estimated_delivery  timestamptz,
    scheduled_at        timestamptz,
    picked_up_at        timestamptz,
    delivered_at        timestamptz,
    created_at          timestamptz         NOT NULL DEFAULT now(),
    updated_at          timestamptz         NOT NULL DEFAULT now(),

    CONSTRAINT chk_direction CHECK (direction IN ('outbound', 'return'))
);

COMMENT ON TABLE  public.deliveries               IS 'Logistics leg for a ticket that uses pickup or delivery service mode.';
COMMENT ON COLUMN public.deliveries.direction     IS '"outbound" = customer → shop; "return" = shop → customer.';
COMMENT ON COLUMN public.deliveries.tracking_code IS 'Short public-facing code for the anonymous parcel tracker.';

-- ---------------------------------------------------------------------------
-- 2.6  ticket_events  (append-only audit log — no UPDATE/DELETE allowed)
-- ---------------------------------------------------------------------------
CREATE TABLE public.ticket_events (
    id          uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   uuid            NOT NULL REFERENCES public.tickets(id)   ON DELETE CASCADE,
    actor_id    uuid            NOT NULL REFERENCES public.profiles(id)  ON DELETE RESTRICT,
    event_type  text            NOT NULL,
    from_status ticket_status,
    to_status   ticket_status,
    metadata    jsonb           NOT NULL DEFAULT '{}',
    created_at  timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.ticket_events            IS 'Immutable audit trail of all status changes and events on a ticket.';
COMMENT ON COLUMN public.ticket_events.event_type IS 'Free-form slug, e.g. "status_changed", "quote_submitted", "note_added".';

-- ---------------------------------------------------------------------------
-- 2.7  reviews
-- ---------------------------------------------------------------------------
CREATE TABLE public.reviews (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   uuid        UNIQUE NOT NULL REFERENCES public.tickets(id)           ON DELETE CASCADE,
    customer_id uuid        NOT NULL REFERENCES public.profiles(id)                ON DELETE CASCADE,
    provider_id uuid        NOT NULL REFERENCES public.service_providers(id)       ON DELETE CASCADE,
    rating      smallint    NOT NULL,
    comment     text,
    created_at  timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_rating CHECK (rating >= 1 AND rating <= 5)
);

COMMENT ON TABLE  public.reviews IS 'One immutable review per completed ticket, written by the customer.';

-- ---------------------------------------------------------------------------
-- 2.8  notifications
-- ---------------------------------------------------------------------------
CREATE TABLE public.notifications (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title       text        NOT NULL,
    body        text        NOT NULL,
    action_url  text,
    ticket_id   uuid        REFERENCES public.tickets(id) ON DELETE SET NULL,
    is_read     boolean     NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.notifications IS 'In-app notifications for customers, providers and admins.';

-- =============================================================================
-- SECTION 3 — FUNCTIONS AND TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 3.1  update_updated_at_column()
-- Generic BEFORE UPDATE trigger function that stamps updated_at = now().
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Generic trigger function: sets updated_at = now() on every UPDATE.';

-- Attach to all tables with updated_at
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_service_providers_updated_at
    BEFORE UPDATE ON public.service_providers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_quotes_updated_at
    BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_deliveries_updated_at
    BEFORE UPDATE ON public.deliveries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 3.2  Auto-create profile on auth.users INSERT
-- ---------------------------------------------------------------------------
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

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a matching profiles row whenever a new auth.users row is inserted.';

CREATE TRIGGER trg_auth_users_create_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3.3  Ticket number generation  →  FXB-YYYY-XXXXXX
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

COMMENT ON FUNCTION public.generate_ticket_number() IS 'BEFORE INSERT trigger: assigns FXB-YYYY-XXXXXX ticket_number if none provided.';

CREATE TRIGGER trg_tickets_generate_number
    BEFORE INSERT ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

-- ---------------------------------------------------------------------------
-- 3.4  JWT custom access-token hook
-- Supabase calls this function (if configured) during token issuance and
-- passes the current claims envelope as a jsonb event.
-- ---------------------------------------------------------------------------

-- Helper: read the user_role claim from the current JWT
CREATE OR REPLACE FUNCTION public.get_jwt_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT auth.jwt()->>'user_role';
$$;

COMMENT ON FUNCTION public.get_jwt_role() IS 'Returns the user_role custom claim from the current JWT. Used in RLS policies.';

-- Main hook: inject role into JWT claims
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
    -- Extract the user id from the event envelope Supabase provides
    v_user_id := (event->>'user_id')::uuid;

    -- Look up the application role
    SELECT role
    INTO   v_role
    FROM   public.profiles
    WHERE  id = v_user_id;

    -- If no profile yet (race condition during sign-up), default to customer
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

COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS
    'Supabase Auth hook: injects user_role into the JWT claims at token issuance. '
    'Register this under Authentication → Hooks → Custom Access Token in the Supabase dashboard, '
    'or via config.toml: [auth.hook.custom_access_token] enabled = true uri = "pg-functions://postgres/public/custom_access_token_hook".';

-- Grant execution to the supabase_auth_admin role so the hook can be called
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) FROM authenticated, anon, public;

-- ---------------------------------------------------------------------------
-- 3.5  Auto-update provider avg_rating and total_reviews on review insert
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.refresh_provider_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_avg   numeric;
    v_count integer;
BEGIN
    SELECT
        round(avg(rating)::numeric, 2),
        count(*)
    INTO v_avg, v_count
    FROM public.reviews
    WHERE provider_id = NEW.provider_id;

    UPDATE public.service_providers
    SET
        avg_rating    = coalesce(v_avg, 0),
        total_reviews = coalesce(v_count, 0),
        updated_at    = now()
    WHERE id = NEW.provider_id;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.refresh_provider_rating() IS 'After a review is inserted, recalculates avg_rating and total_reviews on service_providers.';

CREATE TRIGGER trg_reviews_refresh_provider_rating
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.refresh_provider_rating();

-- =============================================================================
-- SECTION 4 — ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on every application table
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------

-- All authenticated users can read profiles (public directory info)
CREATE POLICY "profiles_select_authenticated"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Only the owner can update their own profile
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING      (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can update any profile (e.g. to change role or deactivate)
CREATE POLICY "profiles_update_admin"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING      (public.get_jwt_role() IN ('admin', 'super_admin'))
    WITH CHECK (public.get_jwt_role() IN ('admin', 'super_admin'));

-- INSERT is intentionally disabled; the handle_new_user() trigger handles creation.
-- A SECURITY DEFINER trigger runs as the function owner (postgres), bypassing RLS,
-- so no INSERT policy is needed.  Explicit inserts from the client are rejected.

-- DELETE is intentionally disabled (cascade from auth.users handles cleanup).

-- ---------------------------------------------------------------------------
-- SERVICE_PROVIDERS
-- ---------------------------------------------------------------------------

-- Public (anon + authenticated): only see verified and active providers
CREATE POLICY "service_providers_select_public"
    ON public.service_providers
    FOR SELECT
    TO anon, authenticated
    USING (is_verified = true AND is_active = true);

-- Admins see all rows regardless of verification/active status
CREATE POLICY "service_providers_select_admin"
    ON public.service_providers
    FOR SELECT
    TO authenticated
    USING (public.get_jwt_role() IN ('admin', 'super_admin'));

-- A provider can always see their own row (even while pending verification)
CREATE POLICY "service_providers_select_own"
    ON public.service_providers
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

-- Authenticated users (customer or provider) can create a provider profile
-- for onboarding purposes; profile_id must match the caller.
CREATE POLICY "service_providers_insert_authenticated"
    ON public.service_providers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        profile_id = auth.uid()
        AND public.get_jwt_role() IN ('provider', 'customer', 'admin', 'super_admin')
    );

-- Provider can update their own row but cannot flip is_verified themselves
CREATE POLICY "service_providers_update_own"
    ON public.service_providers
    FOR UPDATE
    TO authenticated
    USING      (profile_id = auth.uid())
    WITH CHECK (
        profile_id = auth.uid()
        -- is_verified must remain unchanged; only admins may flip it
        AND is_verified = (SELECT is_verified FROM public.service_providers WHERE id = service_providers.id)
    );

-- Admins can update any field on any provider row (including is_verified)
CREATE POLICY "service_providers_update_admin"
    ON public.service_providers
    FOR UPDATE
    TO authenticated
    USING      (public.get_jwt_role() IN ('admin', 'super_admin'))
    WITH CHECK (public.get_jwt_role() IN ('admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- TICKETS
-- ---------------------------------------------------------------------------

-- Customer sees their own tickets
CREATE POLICY "tickets_select_customer"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- Provider sees tickets assigned to them
CREATE POLICY "tickets_select_provider"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (
        provider_id IN (
            SELECT id FROM public.service_providers WHERE profile_id = auth.uid()
        )
    );

-- Admins see all tickets
CREATE POLICY "tickets_select_admin"
    ON public.tickets
    FOR SELECT
    TO authenticated
    USING (public.get_jwt_role() IN ('admin', 'super_admin'));

-- Only customers may open tickets; customer_id must match the caller
CREATE POLICY "tickets_insert_customer"
    ON public.tickets
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_jwt_role() = 'customer'
        AND customer_id = auth.uid()
    );

-- Customer can update their own tickets (e.g. cancel, approve a quote)
CREATE POLICY "tickets_update_customer"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING      (customer_id = auth.uid())
    WITH CHECK (customer_id = auth.uid());

-- Provider can update tickets that are assigned to them
CREATE POLICY "tickets_update_provider"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING (
        provider_id IN (
            SELECT id FROM public.service_providers WHERE profile_id = auth.uid()
        )
    )
    WITH CHECK (
        provider_id IN (
            SELECT id FROM public.service_providers WHERE profile_id = auth.uid()
        )
    );

-- Admins can update any ticket
CREATE POLICY "tickets_update_admin"
    ON public.tickets
    FOR UPDATE
    TO authenticated
    USING      (public.get_jwt_role() IN ('admin', 'super_admin'))
    WITH CHECK (public.get_jwt_role() IN ('admin', 'super_admin'));

-- Only admins may hard-delete tickets
CREATE POLICY "tickets_delete_admin"
    ON public.tickets
    FOR DELETE
    TO authenticated
    USING (public.get_jwt_role() IN ('admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- QUOTES
-- ---------------------------------------------------------------------------

-- Customer sees quotes on their own tickets
CREATE POLICY "quotes_select_customer"
    ON public.quotes
    FOR SELECT
    TO authenticated
    USING (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE customer_id = auth.uid()
        )
    );

-- Provider sees quotes they submitted
CREATE POLICY "quotes_select_provider"
    ON public.quotes
    FOR SELECT
    TO authenticated
    USING (
        provider_id IN (
            SELECT id FROM public.service_providers WHERE profile_id = auth.uid()
        )
    );

-- Admins see all quotes
CREATE POLICY "quotes_select_admin"
    ON public.quotes
    FOR SELECT
    TO authenticated
    USING (public.get_jwt_role() IN ('admin', 'super_admin'));

-- Only providers may submit quotes; provider_id must match their own provider row
CREATE POLICY "quotes_insert_provider"
    ON public.quotes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_jwt_role() = 'provider'
        AND provider_id IN (
            SELECT id FROM public.service_providers WHERE profile_id = auth.uid()
        )
    );

-- Customer can approve/reject quotes on their own tickets
CREATE POLICY "quotes_update_customer"
    ON public.quotes
    FOR UPDATE
    TO authenticated
    USING (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE customer_id = auth.uid()
        )
    )
    WITH CHECK (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE customer_id = auth.uid()
        )
    );

-- Provider can update their own quotes while still pending (e.g. revise amount)
CREATE POLICY "quotes_update_provider_own_pending"
    ON public.quotes
    FOR UPDATE
    TO authenticated
    USING (
        provider_id IN (
            SELECT id FROM public.service_providers WHERE profile_id = auth.uid()
        )
        AND status = 'pending'
    )
    WITH CHECK (
        provider_id IN (
            SELECT id FROM public.service_providers WHERE profile_id = auth.uid()
        )
    );

-- Admins can update any quote
CREATE POLICY "quotes_update_admin"
    ON public.quotes
    FOR UPDATE
    TO authenticated
    USING      (public.get_jwt_role() IN ('admin', 'super_admin'))
    WITH CHECK (public.get_jwt_role() IN ('admin', 'super_admin'));

-- ---------------------------------------------------------------------------
-- DELIVERIES
-- ---------------------------------------------------------------------------

-- Anonymous public tracker: anyone who knows the tracking_code can look it up
CREATE POLICY "deliveries_select_tracking_code"
    ON public.deliveries
    FOR SELECT
    TO anon, authenticated
    USING (tracking_code IS NOT NULL);   -- client MUST filter by tracking_code

-- Customer sees deliveries for their own tickets
CREATE POLICY "deliveries_select_customer"
    ON public.deliveries
    FOR SELECT
    TO authenticated
    USING (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE customer_id = auth.uid()
        )
    );

-- Provider sees deliveries for tickets assigned to them
CREATE POLICY "deliveries_select_provider"
    ON public.deliveries
    FOR SELECT
    TO authenticated
    USING (
        ticket_id IN (
            SELECT t.id
            FROM   public.tickets t
            JOIN   public.service_providers sp ON sp.id = t.provider_id
            WHERE  sp.profile_id = auth.uid()
        )
    );

-- Admins see all deliveries
CREATE POLICY "deliveries_select_admin"
    ON public.deliveries
    FOR SELECT
    TO authenticated
    USING (public.get_jwt_role() IN ('admin', 'super_admin'));

-- INSERT: service_role only (logistics integration layer)
-- Using USING(false) so no authenticated/anon user can insert directly.
CREATE POLICY "deliveries_insert_service_role_only"
    ON public.deliveries
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (false);

-- UPDATE: service_role only
CREATE POLICY "deliveries_update_service_role_only"
    ON public.deliveries
    FOR UPDATE
    TO authenticated, anon
    USING (false);

-- ---------------------------------------------------------------------------
-- TICKET_EVENTS  (append-only audit log)
-- ---------------------------------------------------------------------------

-- Customer can see events for their own tickets
CREATE POLICY "ticket_events_select_customer"
    ON public.ticket_events
    FOR SELECT
    TO authenticated
    USING (
        ticket_id IN (
            SELECT id FROM public.tickets WHERE customer_id = auth.uid()
        )
    );

-- Provider can see events for tickets assigned to them
CREATE POLICY "ticket_events_select_provider"
    ON public.ticket_events
    FOR SELECT
    TO authenticated
    USING (
        ticket_id IN (
            SELECT t.id
            FROM   public.tickets t
            JOIN   public.service_providers sp ON sp.id = t.provider_id
            WHERE  sp.profile_id = auth.uid()
        )
    );

-- Admins see all events
CREATE POLICY "ticket_events_select_admin"
    ON public.ticket_events
    FOR SELECT
    TO authenticated
    USING (public.get_jwt_role() IN ('admin', 'super_admin'));

-- INSERT: service_role only (backend writes events, not clients)
CREATE POLICY "ticket_events_insert_service_role_only"
    ON public.ticket_events
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (false);

-- UPDATE: nobody
CREATE POLICY "ticket_events_no_update"
    ON public.ticket_events
    FOR UPDATE
    TO authenticated, anon
    USING (false);

-- DELETE: nobody
CREATE POLICY "ticket_events_no_delete"
    ON public.ticket_events
    FOR DELETE
    TO authenticated, anon
    USING (false);

-- ---------------------------------------------------------------------------
-- REVIEWS
-- ---------------------------------------------------------------------------

-- Anyone (including anonymous) can read reviews
CREATE POLICY "reviews_select_public"
    ON public.reviews
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Only customers may insert a review, and only for a completed ticket they own
CREATE POLICY "reviews_insert_customer"
    ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_jwt_role() = 'customer'
        AND customer_id = auth.uid()
        AND EXISTS (
            SELECT 1
            FROM   public.tickets t
            WHERE  t.id          = ticket_id
            AND    t.customer_id = auth.uid()
            AND    t.status      = 'completed'
        )
    );

-- Reviews are immutable: no UPDATE or DELETE from any client role
CREATE POLICY "reviews_no_update"
    ON public.reviews
    FOR UPDATE
    TO authenticated, anon
    USING (false);

CREATE POLICY "reviews_no_delete"
    ON public.reviews
    FOR DELETE
    TO authenticated, anon
    USING (false);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------

-- Users can only read their own notifications
CREATE POLICY "notifications_select_own"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Users can mark their own notifications as read (UPDATE)
CREATE POLICY "notifications_update_own"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING      (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- INSERT: service_role only (backend sends notifications)
CREATE POLICY "notifications_insert_service_role_only"
    ON public.notifications
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (false);

-- Users can delete/dismiss their own notifications
CREATE POLICY "notifications_delete_own"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- =============================================================================
-- SECTION 5 — INDEXES
-- =============================================================================

-- Foreign key and high-cardinality column indexes
CREATE INDEX idx_tickets_customer_id          ON public.tickets(customer_id);
CREATE INDEX idx_tickets_provider_id          ON public.tickets(provider_id);
CREATE INDEX idx_tickets_status               ON public.tickets(status);
CREATE INDEX idx_tickets_ticket_number        ON public.tickets(ticket_number);

CREATE INDEX idx_quotes_ticket_id             ON public.quotes(ticket_id);
CREATE INDEX idx_quotes_provider_id           ON public.quotes(provider_id);

CREATE INDEX idx_deliveries_ticket_id         ON public.deliveries(ticket_id);
CREATE INDEX idx_deliveries_tracking_code     ON public.deliveries(tracking_code);
CREATE INDEX idx_deliveries_status            ON public.deliveries(status);

CREATE INDEX idx_ticket_events_ticket_id      ON public.ticket_events(ticket_id);

CREATE INDEX idx_notifications_user_id        ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read        ON public.notifications(user_id, is_read);

CREATE INDEX idx_service_providers_profile_id   ON public.service_providers(profile_id);
CREATE INDEX idx_service_providers_is_verified  ON public.service_providers(is_verified);

-- GIN index for array-containment queries on device_categories
CREATE INDEX idx_service_providers_device_categories
    ON public.service_providers USING GIN(device_categories);

-- Partial index: fast lookup of all open (non-terminal) tickets
CREATE INDEX idx_tickets_open
    ON public.tickets(status)
    WHERE status NOT IN ('completed', 'cancelled');

-- Partial index: unread notifications
CREATE INDEX idx_notifications_unread
    ON public.notifications(user_id)
    WHERE is_read = false;

-- Composite index for provider listing with geo bounding box
CREATE INDEX idx_service_providers_location
    ON public.service_providers(latitude, longitude)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- =============================================================================
-- SECTION 6 — GRANTS
-- =============================================================================
-- Supabase's anon and authenticated roles need USAGE on the public schema and
-- SELECT/INSERT/UPDATE/DELETE as restricted by RLS above.

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT                         ON public.profiles           TO authenticated;
GRANT UPDATE                         ON public.profiles           TO authenticated;

GRANT SELECT                         ON public.service_providers  TO anon, authenticated;
GRANT INSERT, UPDATE                 ON public.service_providers  TO authenticated;

GRANT SELECT                         ON public.tickets            TO authenticated;
GRANT INSERT, UPDATE, DELETE         ON public.tickets            TO authenticated;

GRANT SELECT                         ON public.quotes             TO authenticated;
GRANT INSERT, UPDATE                 ON public.quotes             TO authenticated;

GRANT SELECT                         ON public.deliveries         TO anon, authenticated;

GRANT SELECT                         ON public.ticket_events      TO authenticated;

GRANT SELECT                         ON public.reviews            TO anon, authenticated;
GRANT INSERT                         ON public.reviews            TO authenticated;

GRANT SELECT, UPDATE, DELETE         ON public.notifications      TO authenticated;

-- =============================================================================
-- SECTION 7 — SEED DATA INSTRUCTIONS
-- =============================================================================

-- To seed test data, run: supabase db seed
-- Seed file location: supabase/seed.sql
--
-- Quick reference — create the four test users in the dashboard or via CLI:
--   supabase db seed --db-url <your-connection-string>
--
-- The seed.sql file inserts:
--   • 1 customer  (customer@fixbridge.dev)
--   • 1 provider  (provider@fixbridge.dev  + service_providers row)
--   • 1 admin     (admin@fixbridge.dev)
--   • 1 super_admin (superadmin@fixbridge.dev)
--   • Sample tickets in representative statuses
