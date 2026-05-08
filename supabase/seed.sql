-- =============================================================================
-- FixBridge — Seed Data
-- File: supabase/seed.sql
-- Run via: supabase db seed  (or psql -f seed.sql)
--
-- WARNING: This file is intended for LOCAL DEVELOPMENT only.
--          Never run this against a production database.
--
-- Passwords are stored as Supabase/bcrypt hashes.
-- Plain-text equivalents for local testing:
--   customer@fixbridge.dev   → Password1!
--   provider@fixbridge.dev   → Password1!
--   admin@fixbridge.dev      → Password1!
--   superadmin@fixbridge.dev → Password1!
--
-- The bcrypt hash below is for "Password1!" with cost factor 10.
-- Regenerate with: SELECT crypt('Password1!', gen_salt('bf', 10));
-- =============================================================================

DO $$
DECLARE
    -- -------------------------------------------------------------------------
    -- Fixed UUIDs for deterministic, repeatable seeds
    -- -------------------------------------------------------------------------

    -- auth.users UUIDs
    v_customer_auth_id    uuid := 'aaaaaaaa-0001-4000-8000-000000000001';
    v_provider_auth_id    uuid := 'aaaaaaaa-0002-4000-8000-000000000002';
    v_admin_auth_id       uuid := 'aaaaaaaa-0003-4000-8000-000000000003';
    v_superadmin_auth_id  uuid := 'aaaaaaaa-0004-4000-8000-000000000004';

    -- service_providers UUID
    v_provider_sp_id      uuid := 'bbbbbbbb-0001-4000-8000-000000000001';

    -- tickets UUIDs — one per representative status
    v_ticket_draft        uuid := 'cccccccc-0001-4000-8000-000000000001';
    v_ticket_submitted    uuid := 'cccccccc-0002-4000-8000-000000000002';
    v_ticket_quoted       uuid := 'cccccccc-0003-4000-8000-000000000003';
    v_ticket_accepted     uuid := 'cccccccc-0004-4000-8000-000000000004';
    v_ticket_in_repair    uuid := 'cccccccc-0005-4000-8000-000000000005';
    v_ticket_ready        uuid := 'cccccccc-0006-4000-8000-000000000006';
    v_ticket_completed    uuid := 'cccccccc-0007-4000-8000-000000000007';
    v_ticket_cancelled    uuid := 'cccccccc-0008-4000-8000-000000000008';
    v_ticket_disputed     uuid := 'cccccccc-0009-4000-8000-000000000009';

    -- bcrypt hash of "Password1!" (cost 10)
    v_password_hash       text := '$2a$10$PgSFmGQWBp3dCdXnLGc.iuOJuBFd8MkG6r9Z4YlH3vCbSQXaE0L3m';

BEGIN

-- =============================================================================
-- STEP 1 — auth.users
-- We insert directly into auth.users which Supabase owns.
-- The handle_new_user() trigger will create matching profiles rows.
-- =============================================================================

    INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    )
    VALUES
    -- Customer
    (
        v_customer_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'customer@fixbridge.dev',
        v_password_hash,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Aryan Mehta"}',
        now(),
        now(),
        '', '', '', ''
    ),
    -- Provider
    (
        v_provider_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'provider@fixbridge.dev',
        v_password_hash,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"TechFix Solutions"}',
        now(),
        now(),
        '', '', '', ''
    ),
    -- Admin
    (
        v_admin_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'admin@fixbridge.dev',
        v_password_hash,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Priya Admin"}',
        now(),
        now(),
        '', '', '', ''
    ),
    -- Super Admin
    (
        v_superadmin_auth_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        'superadmin@fixbridge.dev',
        v_password_hash,
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Ravi SuperAdmin"}',
        now(),
        now(),
        '', '', '', ''
    )
    ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 2 — profiles
-- The trigger already inserts rows with full_name from raw_user_meta_data.
-- Here we upsert to fill in phone and, crucially, set the correct role.
-- =============================================================================

    INSERT INTO public.profiles (id, full_name, phone, role, is_active, created_at, updated_at)
    VALUES
    (v_customer_auth_id,   'Aryan Mehta',       '+91-98765-43210', 'customer',    true, now(), now()),
    (v_provider_auth_id,   'TechFix Solutions',  '+91-98765-43211', 'provider',    true, now(), now()),
    (v_admin_auth_id,      'Priya Admin',        '+91-98765-43212', 'admin',       true, now(), now()),
    (v_superadmin_auth_id, 'Ravi SuperAdmin',    '+91-98765-43213', 'super_admin', true, now(), now())
    ON CONFLICT (id) DO UPDATE SET
        full_name  = EXCLUDED.full_name,
        phone      = EXCLUDED.phone,
        role       = EXCLUDED.role,
        updated_at = now();

-- =============================================================================
-- STEP 3 — service_providers
-- =============================================================================

    INSERT INTO public.service_providers (
        id,
        profile_id,
        shop_name,
        description,
        device_categories,
        services_offered,
        city,
        state,
        pincode,
        latitude,
        longitude,
        is_verified,
        is_active,
        working_hours
    )
    VALUES (
        v_provider_sp_id,
        v_provider_auth_id,
        'TechFix Solutions',
        'Expert repair centre specialising in laptops, PCs, consoles and mobile devices. All repairs carry a 90-day warranty.',
        ARRAY['Laptop', 'PC', 'Console', 'Mobile'],
        ARRAY['Screen Replacement', 'Battery Replacement', 'Motherboard Repair', 'Data Recovery', 'Software Troubleshooting', 'Virus Removal'],
        'Mumbai',
        'Maharashtra',
        '400001',
        18.9322,
        72.8264,
        true,   -- is_verified
        true,   -- is_active
        '{
            "Mon": {"open": "09:00", "close": "19:00"},
            "Tue": {"open": "09:00", "close": "19:00"},
            "Wed": {"open": "09:00", "close": "19:00"},
            "Thu": {"open": "09:00", "close": "19:00"},
            "Fri": {"open": "09:00", "close": "19:00"},
            "Sat": {"open": "10:00", "close": "17:00"},
            "Sun": {"open": "closed", "close": "closed"}
        }'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 4 — tickets  (one per status)
-- We provide explicit ticket_numbers to skip the random-generation trigger.
-- =============================================================================

    INSERT INTO public.tickets (
        id,
        ticket_number,
        customer_id,
        provider_id,
        device_type,
        brand,
        model,
        issue_description,
        issue_images,
        status,
        service_mode,
        urgency,
        customer_address,
        preferred_date
    )
    VALUES

    -- 1. draft — customer has started but not submitted
    (
        v_ticket_draft,
        'FXB-2025-DRAFT1',
        v_customer_auth_id,
        NULL,
        'Laptop',
        'Dell',
        'XPS 15 9500',
        'Screen flickering intermittently. Occurs mostly when lid is moved.',
        ARRAY[]::text[],
        'draft',
        'dropoff',
        'standard',
        NULL,
        NULL
    ),

    -- 2. submitted — customer has submitted, waiting for provider to pick up
    (
        v_ticket_submitted,
        'FXB-2025-SUBM01',
        v_customer_auth_id,
        NULL,
        'Mobile',
        'Apple',
        'iPhone 14 Pro',
        'Cracked back glass and rear camera not focusing after a drop.',
        ARRAY['https://cdn.fixbridge.dev/seed/iphone-crack-1.jpg']::text[],
        'submitted',
        'pickup',
        'urgent',
        '{"line1":"42 Marine Drive","city":"Mumbai","state":"Maharashtra","pincode":"400020"}'::jsonb,
        CURRENT_DATE + 1
    ),

    -- 3. quoted — provider has submitted a quote, customer to review
    (
        v_ticket_quoted,
        'FXB-2025-QUOT01',
        v_customer_auth_id,
        v_provider_sp_id,
        'PC',
        'Custom Build',
        'Intel i9 / RTX 4080',
        'System does not POST. No video output. Fans spin but beep codes indicate RAM issue.',
        ARRAY[]::text[],
        'quoted',
        'dropoff',
        'standard',
        NULL,
        CURRENT_DATE + 3
    ),

    -- 4. accepted — customer approved the quote
    (
        v_ticket_accepted,
        'FXB-2025-ACCP01',
        v_customer_auth_id,
        v_provider_sp_id,
        'Laptop',
        'Lenovo',
        'ThinkPad X1 Carbon Gen 11',
        'Battery drains from 100% to 0% within 45 minutes. Needs battery replacement.',
        ARRAY[]::text[],
        'accepted',
        'delivery',
        'flexible',
        '{"line1":"7 Link Road","city":"Pune","state":"Maharashtra","pincode":"411001"}'::jsonb,
        CURRENT_DATE + 5
    ),

    -- 5. in_repair — device is currently being worked on
    (
        v_ticket_in_repair,
        'FXB-2025-REPR01',
        v_customer_auth_id,
        v_provider_sp_id,
        'Console',
        'Sony',
        'PlayStation 5',
        'HDMI port damaged. No display output. Second HDMI port bent pin visible.',
        ARRAY['https://cdn.fixbridge.dev/seed/ps5-hdmi-1.jpg']::text[],
        'in_repair',
        'dropoff',
        'standard',
        NULL,
        NULL
    ),

    -- 6. ready — repair complete, awaiting pickup/dispatch
    (
        v_ticket_ready,
        'FXB-2025-RDY001',
        v_customer_auth_id,
        v_provider_sp_id,
        'Mobile',
        'Samsung',
        'Galaxy S23 Ultra',
        'Charging port not working. Phone charges only on wireless, USB-C port unresponsive.',
        ARRAY[]::text[],
        'ready',
        'dropoff',
        'standard',
        NULL,
        NULL
    ),

    -- 7. completed — all done, eligible for review
    (
        v_ticket_completed,
        'FXB-2025-CMPL01',
        v_customer_auth_id,
        v_provider_sp_id,
        'Laptop',
        'HP',
        'Spectre x360 14',
        'Keyboard keys sticking after liquid spill. Several keys non-functional.',
        ARRAY[]::text[],
        'completed',
        'dropoff',
        'urgent',
        NULL,
        NULL
    ),

    -- 8. cancelled — customer cancelled before work started
    (
        v_ticket_cancelled,
        'FXB-2025-CNCL01',
        v_customer_auth_id,
        NULL,
        'Mobile',
        'OnePlus',
        'OnePlus 11',
        'Display has green tint. Decided to claim warranty instead.',
        ARRAY[]::text[],
        'cancelled',
        'pickup',
        'flexible',
        '{"line1":"15 SV Road","city":"Bangalore","state":"Karnataka","pincode":"560001"}'::jsonb,
        NULL
    ),

    -- 9. disputed — customer and provider disagree on outcome
    (
        v_ticket_disputed,
        'FXB-2025-DISP01',
        v_customer_auth_id,
        v_provider_sp_id,
        'PC',
        'ASUS',
        'ROG Strix G15',
        'GPU fan was repaired but customer reports new thermal throttling issue not present before service.',
        ARRAY[]::text[],
        'disputed',
        'dropoff',
        'urgent',
        NULL,
        NULL
    )

    ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 5 — quotes  (for the tickets that need them)
-- =============================================================================

    INSERT INTO public.quotes (
        id,
        ticket_id,
        provider_id,
        amount,
        currency,
        line_items,
        estimated_days,
        notes,
        status,
        valid_until
    )
    VALUES

    -- Quote for the "quoted" ticket (pending approval)
    (
        'dddddddd-0001-4000-8000-000000000001',
        v_ticket_quoted,
        v_provider_sp_id,
        3500.00,
        'INR',
        '[
            {"label": "RAM Module (16GB DDR5)", "qty": 2, "unit_price": 1200.00},
            {"label": "Diagnostic & Bench Fee",  "qty": 1, "unit_price":  500.00},
            {"label": "Labour",                  "qty": 1, "unit_price":  600.00}
        ]'::jsonb,
        3,
        'Will test all four RAM slots individually. If motherboard slots are damaged, additional cost may apply.',
        'pending',
        now() + interval '7 days'
    ),

    -- Quote for the "accepted" ticket (approved by customer)
    (
        'dddddddd-0002-4000-8000-000000000002',
        v_ticket_accepted,
        v_provider_sp_id,
        2200.00,
        'INR',
        '[
            {"label": "OEM Replacement Battery (72Wh)", "qty": 1, "unit_price": 1800.00},
            {"label": "Labour",                         "qty": 1, "unit_price":  400.00}
        ]'::jsonb,
        2,
        'Genuine Lenovo FRU battery. Includes full cycle calibration on completion.',
        'approved',
        now() + interval '5 days'
    ),

    -- Quote for the "in_repair" ticket (approved)
    (
        'dddddddd-0003-4000-8000-000000000003',
        v_ticket_in_repair,
        v_provider_sp_id,
        1800.00,
        'INR',
        '[
            {"label": "HDMI Port Replacement",      "qty": 1, "unit_price": 1200.00},
            {"label": "Labour & Micro-soldering",   "qty": 1, "unit_price":  600.00}
        ]'::jsonb,
        4,
        'Requires micro-soldering under 30x magnification. Chip-level repair.',
        'approved',
        now() + interval '3 days'
    ),

    -- Quote for the "ready" ticket (approved, work done)
    (
        'dddddddd-0004-4000-8000-000000000004',
        v_ticket_ready,
        v_provider_sp_id,
        900.00,
        'INR',
        '[
            {"label": "USB-C Port Replacement", "qty": 1, "unit_price": 600.00},
            {"label": "Labour",                 "qty": 1, "unit_price": 300.00}
        ]'::jsonb,
        2,
        NULL,
        'approved',
        now() + interval '2 days'
    ),

    -- Quote for the "completed" ticket (approved, archived)
    (
        'dddddddd-0005-4000-8000-000000000005',
        v_ticket_completed,
        v_provider_sp_id,
        4500.00,
        'INR',
        '[
            {"label": "Keyboard Assembly Replacement", "qty": 1, "unit_price": 3500.00},
            {"label": "Internal Cleaning",             "qty": 1, "unit_price":  500.00},
            {"label": "Labour",                        "qty": 1, "unit_price":  500.00}
        ]'::jsonb,
        3,
        'Full keyboard deck replacement. Internal traces dried and no corrosion found.',
        'approved',
        now() - interval '2 days'  -- already past valid_until (completed)
    ),

    -- Quote for the "disputed" ticket (approved but contested)
    (
        'dddddddd-0006-4000-8000-000000000006',
        v_ticket_disputed,
        v_provider_sp_id,
        2500.00,
        'INR',
        '[
            {"label": "GPU Fan x2 Replacement", "qty": 1, "unit_price": 1800.00},
            {"label": "Thermal Paste & Pads",   "qty": 1, "unit_price":  200.00},
            {"label": "Labour",                 "qty": 1, "unit_price":  500.00}
        ]'::jsonb,
        3,
        'Fans were seized. Replaced both fans and refreshed thermal compound.',
        'approved',
        now() - interval '5 days'
    )

    ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 6 — deliveries  (for tickets with delivery/pickup service mode)
-- =============================================================================

    INSERT INTO public.deliveries (
        id,
        ticket_id,
        tracking_code,
        direction,
        status,
        pickup_address,
        delivery_address,
        agent_name,
        estimated_delivery,
        scheduled_at
    )
    VALUES
    -- Outbound delivery for the "accepted" ticket (Pune → TechFix Mumbai)
    (
        'eeeeeeee-0001-4000-8000-000000000001',
        v_ticket_accepted,
        'FXB-DLV-A4B7C2',
        'outbound',
        'scheduled',
        '{"line1":"7 Link Road","city":"Pune","state":"Maharashtra","pincode":"411001"}'::jsonb,
        '{"line1":"Shop 3 Andheri East","city":"Mumbai","state":"Maharashtra","pincode":"400069"}'::jsonb,
        NULL,
        now() + interval '1 day',
        now() + interval '4 hours'
    )

    ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 7 — reviews  (only for completed tickets)
-- =============================================================================

    INSERT INTO public.reviews (
        id,
        ticket_id,
        customer_id,
        provider_id,
        rating,
        comment,
        created_at
    )
    VALUES (
        'ffffffff-0001-4000-8000-000000000001',
        v_ticket_completed,
        v_customer_auth_id,
        v_provider_sp_id,
        5,
        'Excellent service! Keyboard works perfectly. Turnaround was faster than promised and the team kept me updated throughout. Highly recommend TechFix Solutions.',
        now() - interval '1 day'
    )
    ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STEP 8 — notifications  (sample in-app notifications)
-- =============================================================================

    INSERT INTO public.notifications (
        id,
        user_id,
        title,
        body,
        action_url,
        ticket_id,
        is_read,
        created_at
    )
    VALUES

    -- Notify customer: quote received for v_ticket_quoted
    (
        '11111111-0001-4000-8000-000000000001',
        v_customer_auth_id,
        'New Quote Received',
        'TechFix Solutions has submitted a quote of ₹3,500 for your PC repair (FXB-2025-QUOT01). Review and approve to proceed.',
        '/tickets/cccccccc-0003-4000-8000-000000000003/quotes',
        v_ticket_quoted,
        false,
        now() - interval '2 hours'
    ),

    -- Notify customer: device is ready for v_ticket_ready
    (
        '11111111-0002-4000-8000-000000000002',
        v_customer_auth_id,
        'Your Device is Ready!',
        'Your Samsung Galaxy S23 Ultra (FXB-2025-RDY001) has been repaired and is ready for pickup.',
        '/tickets/cccccccc-0006-4000-8000-000000000006',
        v_ticket_ready,
        false,
        now() - interval '30 minutes'
    ),

    -- Notify provider: new ticket submitted (v_ticket_submitted)
    (
        '11111111-0003-4000-8000-000000000003',
        v_provider_auth_id,
        'New Repair Request',
        'A customer has submitted a new ticket for an iPhone 14 Pro screen/camera repair (FXB-2025-SUBM01). Submit your quote to claim it.',
        '/provider/tickets/cccccccc-0002-4000-8000-000000000002',
        v_ticket_submitted,
        false,
        now() - interval '3 hours'
    ),

    -- Notify admin: dispute raised
    (
        '11111111-0004-4000-8000-000000000004',
        v_admin_auth_id,
        'Dispute Raised',
        'Ticket FXB-2025-DISP01 (ASUS ROG Strix G15) has been moved to disputed status. Review required.',
        '/admin/tickets/cccccccc-0009-4000-8000-000000000009',
        v_ticket_disputed,
        false,
        now() - interval '1 hour'
    )

    ON CONFLICT (id) DO NOTHING;

END $$;

-- =============================================================================
-- Verification queries (comment-out in CI if you don't want output)
-- =============================================================================

SELECT 'auth.users'        AS tbl, count(*) FROM auth.users           WHERE email LIKE '%fixbridge.dev';
SELECT 'profiles'          AS tbl, count(*) FROM public.profiles;
SELECT 'service_providers' AS tbl, count(*) FROM public.service_providers;
SELECT 'tickets'           AS tbl, count(*) FROM public.tickets;
SELECT 'quotes'            AS tbl, count(*) FROM public.quotes;
SELECT 'deliveries'        AS tbl, count(*) FROM public.deliveries;
SELECT 'reviews'           AS tbl, count(*) FROM public.reviews;
SELECT 'notifications'     AS tbl, count(*) FROM public.notifications;

-- =============================================================================
-- Quick sanity check: provider avg_rating should reflect the seeded review
-- =============================================================================
SELECT shop_name, avg_rating, total_reviews
FROM   public.service_providers
WHERE  id = 'bbbbbbbb-0001-4000-8000-000000000001';
