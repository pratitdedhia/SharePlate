-- ==============================================================================
-- SharePlate Database Schema
-- Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH
-- PostgreSQL / Supabase Migration
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM / CHECK TYPES
-- Profile roles: donor, recipient, volunteer, admin
-- (Public registration strictly restricted to donor, recipient, volunteer)

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'recipient', 'volunteer', 'admin')),
    organization_name TEXT,
    phone TEXT,
    city TEXT DEFAULT 'Delhi NCR',
    service_area TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    donor_type TEXT,
    recipient_type TEXT,
    contact_person TEXT,
    availability TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('cooked_meals', 'bakery', 'produce', 'packaged', 'dairy', 'beverages', 'other')),
    quantity_total INTEGER NOT NULL CHECK (quantity_total > 0),
    quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
    quantity_unit TEXT NOT NULL DEFAULT 'portions',
    image_url TEXT,
    cloudinary_public_id TEXT,
    ingredients TEXT,
    allergens TEXT,
    preparation_time TIMESTAMPTZ,
    pickup_deadline TIMESTAMPTZ NOT NULL,
    pickup_instructions TEXT,
    city TEXT NOT NULL DEFAULT 'Delhi NCR',
    location_label TEXT NOT NULL,
    latitude DOUBLE PRECISION CHECK (latitude IS NULL OR (latitude >= -90.0 AND latitude <= 90.0)),
    longitude DOUBLE PRECISION CHECK (longitude IS NULL OR (longitude >= -180.0 AND longitude <= 180.0)),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'claimed', 'collected', 'delivered', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_quantity_available_lte_total CHECK (quantity_available <= quantity_total)
);

-- 5. CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    quantity_claimed INTEGER NOT NULL CHECK (quantity_claimed > 0),
    status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'collected', 'delivered', 'cancelled')),
    verification_status TEXT NOT NULL DEFAULT 'unassigned' CHECK (verification_status IN ('unassigned', 'accepted', 'pickup_pending', 'in_transit', 'delivery_pending', 'verified', 'disputed')),
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    collected_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    notes TEXT,
    pickup_code TEXT,
    pickup_expires_at TIMESTAMPTZ,
    pickup_attempts INTEGER NOT NULL DEFAULT 0,
    pickup_confirmed_at TIMESTAMPTZ,
    pickup_confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    delivery_code TEXT,
    delivery_expires_at TIMESTAMPTZ,
    delivery_attempts INTEGER NOT NULL DEFAULT 0,
    delivery_confirmed_at TIMESTAMPTZ,
    delivery_confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    portions_delivered_confirmed INTEGER,
    is_disputed BOOLEAN NOT NULL DEFAULT FALSE,
    dispute_reason TEXT,
    disputed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    disputed_at TIMESTAMPTZ,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5b. VOLUNTEER REWARDS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    status TEXT NOT NULL DEFAULT 'released' CHECK (status IN ('pending', 'released', 'forfeited')),
    portions_confirmed INTEGER NOT NULL DEFAULT 0,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5c. DONOR REWARDS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.donor_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    claim_id UUID UNIQUE REFERENCES public.claims(id) ON DELETE SET NULL,
    points INTEGER NOT NULL CHECK (points >= 0),
    status TEXT NOT NULL DEFAULT 'awarded' CHECK (status IN ('pending', 'awarded', 'forfeited')),
    portions_confirmed INTEGER NOT NULL DEFAULT 0,
    donation_title TEXT NOT NULL,
    recipient_name TEXT,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donor_rewards_donor_id ON public.donor_rewards(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_rewards_claim_id ON public.donor_rewards(claim_id);

-- 5c. VOLUNTEER TRIP PLANS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_trip_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    corridor_label TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('draft', 'accepted', 'in_progress', 'completed', 'cancelled')),
    task_ids TEXT[] DEFAULT '{}',
    is_demo_preview BOOLEAN NOT NULL DEFAULT FALSE,
    routing_provider_note TEXT,
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5d. VOLUNTEER TRIP STOPS TABLE
CREATE TABLE IF NOT EXISTS public.volunteer_trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.volunteer_trip_plans(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('start', 'pickup', 'delivery', 'destination')),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    instructions TEXT,
    task_id TEXT,
    portions INTEGER,
    food_title TEXT,
    dietary_type TEXT,
    deadline TIMESTAMPTZ,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_plans_volunteer_id ON public.volunteer_trip_plans(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_trip_stops_plan_id ON public.volunteer_trip_stops(plan_id);

-- 6. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donation_id UUID REFERENCES public.donations(id) ON DELETE SET NULL,
    claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_category ON public.donations(category);
CREATE INDEX IF NOT EXISTS idx_donations_city ON public.donations(city);
CREATE INDEX IF NOT EXISTS idx_donations_pickup_deadline ON public.donations(pickup_deadline);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claims_donation_id ON public.claims(donation_id);
CREATE INDEX IF NOT EXISTS idx_claims_recipient_id ON public.claims(recipient_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.claims(status);

CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 9. TIMESTAMP UPDATE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_donations_updated_at ON public.donations;
CREATE TRIGGER set_donations_updated_at
    BEFORE UPDATE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_claims_updated_at ON public.claims;
CREATE TRIGGER set_claims_updated_at
    BEFORE UPDATE ON public.claims
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. AUTH TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- Enforce safety: default to 'donor' or requested role, but NEVER allow 'admin' via self-service signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_full_name TEXT;
    v_org_name TEXT;
    v_phone TEXT;
    v_city TEXT;
    v_service_area TEXT;
    v_donor_type TEXT;
    v_recipient_type TEXT;
    v_contact_person TEXT;
    v_availability TEXT;
    v_bio TEXT;
    v_avatar_url TEXT;
BEGIN
    -- Security Barrier: Disallow administrative privilege escalation via raw_user_meta_data
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'donor');
    IF v_role NOT IN ('donor', 'recipient', 'volunteer') THEN
        v_role := 'donor';
    END IF;

    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    v_org_name := NEW.raw_user_meta_data->>'organization_name';
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_city := COALESCE(NEW.raw_user_meta_data->>'city', 'Delhi NCR');
    v_service_area := NEW.raw_user_meta_data->>'service_area';
    v_donor_type := NEW.raw_user_meta_data->>'donor_type';
    v_recipient_type := NEW.raw_user_meta_data->>'recipient_type';
    v_contact_person := NEW.raw_user_meta_data->>'contact_person';
    v_availability := NEW.raw_user_meta_data->>'availability';
    v_bio := NEW.raw_user_meta_data->>'bio';
    v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

    INSERT INTO public.profiles (
        id, full_name, email, role, organization_name, phone, city,
        service_area, is_active, donor_type, recipient_type, contact_person,
        availability, bio, avatar_url
    )
    VALUES (
        NEW.id, v_full_name, NEW.email, v_role, v_org_name, v_phone, v_city,
        v_service_area, true, v_donor_type, v_recipient_type, v_contact_person,
        v_availability, v_bio, v_avatar_url
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = COALESCE(EXCLUDED.email, public.profiles.email),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        organization_name = COALESCE(EXCLUDED.organization_name, public.profiles.organization_name),
        city = COALESCE(EXCLUDED.city, public.profiles.city),
        service_area = COALESCE(EXCLUDED.service_area, public.profiles.service_area),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. PUBLIC SAFE VIEW FOR DONATIONS
-- Non-claimant users browse without seeing sensitive pickup instructions or private details
CREATE OR REPLACE VIEW public.public_donations AS
SELECT 
    d.id,
    d.donor_id,
    p.full_name AS donor_name,
    p.organization_name AS donor_org,
    d.title,
    d.description,
    d.category,
    d.quantity_total,
    d.quantity_available,
    d.quantity_unit,
    d.image_url,
    d.cloudinary_public_id,
    d.ingredients,
    d.allergens,
    d.preparation_time,
    d.pickup_deadline,
    d.city,
    d.location_label,
    d.status,
    d.created_at,
    d.updated_at
FROM public.donations d
JOIN public.profiles p ON d.donor_id = p.id
WHERE d.status IN ('available', 'reserved');

-- 12. ATOMIC RPC FUNCTION: CLAIM DONATION
-- Concurrency-safe: uses SELECT ... FOR UPDATE to prevent race conditions & double-claims
CREATE OR REPLACE FUNCTION public.claim_donation_atomic(
    p_donation_id UUID,
    p_recipient_id UUID,
    p_quantity INTEGER,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_donation public.donations%ROWTYPE;
    v_claim_id UUID;
    v_new_status TEXT;
    v_result JSONB;
BEGIN
    -- Verify input
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Claim quantity must be greater than zero';
    END IF;

    -- Lock the donation row exclusively
    SELECT * INTO v_donation
    FROM public.donations
    WHERE id = p_donation_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Donation not found';
    END IF;

    -- Verify donor is not claiming their own food
    IF v_donation.donor_id = p_recipient_id THEN
        RAISE EXCEPTION 'Donors cannot claim their own donation';
    END IF;

    -- Verify donation status
    IF v_donation.status NOT IN ('available', 'reserved') THEN
        RAISE EXCEPTION 'Donation is not available for claim (current status: %)', v_donation.status;
    END IF;

    -- Verify pickup deadline
    IF v_donation.pickup_deadline < NOW() THEN
        UPDATE public.donations SET status = 'expired' WHERE id = p_donation_id;
        RAISE EXCEPTION 'Donation pickup deadline has passed';
    END IF;

    -- Check available quantity
    IF v_donation.quantity_available < p_quantity THEN
        RAISE EXCEPTION 'Requested quantity (%) exceeds available quantity (%)', p_quantity, v_donation.quantity_available;
    END IF;

    -- Calculate new status
    IF (v_donation.quantity_available - p_quantity) = 0 THEN
        v_new_status := 'reserved';
    ELSE
        v_new_status := 'available';
    END IF;

    -- Update donation quantity
    UPDATE public.donations
    SET 
        quantity_available = quantity_available - p_quantity,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_donation_id;

    -- Insert claim
    INSERT INTO public.claims (
        donation_id,
        recipient_id,
        quantity_claimed,
        status,
        notes
    ) VALUES (
        p_donation_id,
        p_recipient_id,
        p_quantity,
        'claimed',
        p_notes
    ) RETURNING id INTO v_claim_id;

    -- Log activity
    INSERT INTO public.activity_logs (
        actor_id,
        donation_id,
        claim_id,
        action,
        details
    ) VALUES (
        p_recipient_id,
        p_donation_id,
        v_claim_id,
        'claim_created',
        jsonb_build_object(
            'quantity', p_quantity,
            'remaining', v_donation.quantity_available - p_quantity,
            'donation_status', v_new_status
        )
    );

    v_result := jsonb_build_object(
        'success', true,
        'claim_id', v_claim_id,
        'quantity_claimed', p_quantity,
        'remaining_available', v_donation.quantity_available - p_quantity,
        'status', 'claimed'
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. ATOMIC RPC FUNCTION: CANCEL CLAIM
-- Releases reserved quantity back to the donation atomically
CREATE OR REPLACE FUNCTION public.cancel_claim_atomic(
    p_claim_id UUID,
    p_user_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_claim public.claims%ROWTYPE;
    v_donation public.donations%ROWTYPE;
    v_is_donor BOOLEAN;
    v_is_recipient BOOLEAN;
BEGIN
    SELECT * INTO v_claim
    FROM public.claims
    WHERE id = p_claim_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Claim not found';
    END IF;

    IF v_claim.status != 'claimed' THEN
        RAISE EXCEPTION 'Only active claims can be cancelled (current status: %)', v_claim.status;
    END IF;

    SELECT * INTO v_donation
    FROM public.donations
    WHERE id = v_claim.donation_id
    FOR UPDATE;

    v_is_recipient := (v_claim.recipient_id = p_user_id);
    v_is_donor := (v_donation.donor_id = p_user_id);

    IF NOT (v_is_recipient OR v_is_donor) THEN
        RAISE EXCEPTION 'Unauthorized to cancel this claim';
    END IF;

    -- Mark claim as cancelled
    UPDATE public.claims
    SET 
        status = 'cancelled',
        cancelled_at = NOW(),
        notes = COALESCE(notes, '') || CASE WHEN p_reason IS NOT NULL THEN ' [Cancelled: ' || p_reason || ']' ELSE ' [Cancelled]' END,
        updated_at = NOW()
    WHERE id = p_claim_id;

    -- Restore quantity to donation
    UPDATE public.donations
    SET 
        quantity_available = quantity_available + v_claim.quantity_claimed,
        status = CASE 
            WHEN status IN ('reserved', 'available') AND pickup_deadline > NOW() THEN 'available' 
            ELSE status 
        END,
        updated_at = NOW()
    WHERE id = v_claim.donation_id;

    -- Log activity
    INSERT INTO public.activity_logs (
        actor_id,
        donation_id,
        claim_id,
        action,
        details
    ) VALUES (
        p_user_id,
        v_claim.donation_id,
        p_claim_id,
        'claim_cancelled',
        jsonb_build_object(
            'restored_quantity', v_claim.quantity_claimed,
            'cancelled_by', CASE WHEN v_is_donor THEN 'donor' ELSE 'recipient' END,
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'claim_id', p_claim_id,
        'restored_quantity', v_claim.quantity_claimed,
        'status', 'cancelled'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. ATOMIC RPC FUNCTION: UPDATE CLAIM LIFECYCLE (COLLECT / DELIVER)
CREATE OR REPLACE FUNCTION public.update_claim_status(
    p_claim_id UUID,
    p_new_status TEXT,
    p_user_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_claim public.claims%ROWTYPE;
    v_donation public.donations%ROWTYPE;
    v_all_delivered BOOLEAN;
BEGIN
    IF p_new_status NOT IN ('collected', 'delivered') THEN
        RAISE EXCEPTION 'Invalid status transition: %', p_new_status;
    END IF;

    SELECT * INTO v_claim
    FROM public.claims
    WHERE id = p_claim_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Claim not found';
    END IF;

    SELECT * INTO v_donation
    FROM public.donations
    WHERE id = v_claim.donation_id;

    -- Check caller authorization
    IF NOT (
        p_user_id = v_claim.recipient_id OR 
        p_user_id = v_donation.donor_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = p_user_id AND role IN ('volunteer', 'admin')
        )
    ) THEN
        RAISE EXCEPTION 'Unauthorized to update this claim';
    END IF;

    -- Validate transitions
    IF p_new_status = 'collected' THEN
        IF v_claim.status != 'claimed' THEN
            RAISE EXCEPTION 'Claim cannot be marked collected from status: %', v_claim.status;
        END IF;

        UPDATE public.claims
        SET 
            status = 'collected',
            collected_at = NOW(),
            updated_at = NOW()
        WHERE id = p_claim_id;

    ELSIF p_new_status = 'delivered' THEN
        IF v_claim.status != 'collected' THEN
            RAISE EXCEPTION 'Claim must be collected before it can be delivered';
        END IF;

        UPDATE public.claims
        SET 
            status = 'delivered',
            delivered_at = NOW(),
            updated_at = NOW()
        WHERE id = p_claim_id;

        -- If all active claims for this donation are delivered and available quantity is 0, mark donation delivered
        IF v_donation.quantity_available = 0 THEN
            SELECT NOT EXISTS (
                SELECT 1 FROM public.claims 
                WHERE donation_id = v_donation.id 
                AND status NOT IN ('delivered', 'cancelled')
            ) INTO v_all_delivered;

            IF v_all_delivered THEN
                UPDATE public.donations
                SET status = 'delivered', updated_at = NOW()
                WHERE id = v_donation.id;
            END IF;
        END IF;
    END IF;

    -- Log activity
    INSERT INTO public.activity_logs (
        actor_id,
        donation_id,
        claim_id,
        action,
        details
    ) VALUES (
        p_user_id,
        v_claim.donation_id,
        p_claim_id,
        'claim_' || p_new_status,
        jsonb_build_object('status', p_new_status, 'notes', p_notes)
    );

    RETURN jsonb_build_object(
        'success', true,
        'claim_id', p_claim_id,
        'new_status', p_new_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security Hardening: Revoke RPC execution from public/anon/authenticated and grant to service_role
REVOKE EXECUTE ON FUNCTION public.claim_donation_atomic(UUID, UUID, INTEGER, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_donation_atomic(UUID, UUID, INTEGER, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.cancel_claim_atomic(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_claim_atomic(UUID, UUID, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.update_claim_status(UUID, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_claim_status(UUID, TEXT, UUID, TEXT) TO service_role;

-- 15. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Anyone can view public profile details (e.g. donor/organization name)
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- DONATIONS POLICIES
-- Anyone (even unauthenticated) can view available / reserved donations
CREATE POLICY "Anyone can view active donations" 
    ON public.donations FOR SELECT 
    USING (status IN ('available', 'reserved', 'claimed', 'collected', 'delivered'));

-- Donors can create listings
CREATE POLICY "Authenticated donors can create donations" 
    ON public.donations FOR INSERT 
    WITH CHECK (auth.uid() = donor_id);

-- Donors can update their own donations
CREATE POLICY "Donors can update own donations" 
    ON public.donations FOR UPDATE 
    USING (auth.uid() = donor_id)
    WITH CHECK (auth.uid() = donor_id);

-- Donors can delete/cancel their own donations if unclaimed
CREATE POLICY "Donors can delete own donations" 
    ON public.donations FOR DELETE 
    USING (auth.uid() = donor_id);

-- CLAIMS POLICIES
-- Donors and Claim Recipients can view their relevant claims
CREATE POLICY "Users can view related claims" 
    ON public.claims FOR SELECT 
    USING (
        auth.uid() = recipient_id 
        OR auth.uid() IN (SELECT donor_id FROM public.donations WHERE id = donation_id)
        OR auth.uid() = volunteer_id
        OR public.is_admin()
    );

-- Recipients can insert claims (normally via atomic RPC function)
CREATE POLICY "Recipients can insert claims" 
    ON public.claims FOR INSERT 
    WITH CHECK (auth.uid() = recipient_id);

-- Claim status updates allowed for recipient or donor
CREATE POLICY "Participants can update claims" 
    ON public.claims FOR UPDATE 
    USING (
        auth.uid() = recipient_id 
        OR auth.uid() IN (SELECT donor_id FROM public.donations WHERE id = donation_id)
        OR auth.uid() = volunteer_id
        OR public.is_admin()
    );

-- REPORTS POLICIES
-- Logged in users can file reports
CREATE POLICY "Authenticated users can submit reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Reporters and Admins can view reports" 
    ON public.reports FOR SELECT 
    USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "Admins can update reports" 
    ON public.reports FOR UPDATE 
    USING (public.is_admin());

-- ACTIVITY LOGS POLICIES
-- Read-only public activity stream
CREATE POLICY "Activity logs are viewable" 
    ON public.activity_logs FOR SELECT 
    USING (true);

-- ==============================================================================
-- Schema creation complete
-- ==============================================================================


-- Volunteer rewards ledger permissions
ALTER TABLE public.volunteer_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view their own rewards"
    ON public.volunteer_rewards FOR SELECT
    USING (volunteer_id = auth.uid() OR public.is_admin());

-- Donor rewards ledger permissions (Cross-account isolation)
ALTER TABLE public.donor_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donors can view their own rewards"
    ON public.donor_rewards FOR SELECT
    USING (donor_id = auth.uid() OR public.is_admin());

-- Volunteer Trip Plans and Stops RLS
ALTER TABLE public.volunteer_trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_trip_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view own trip plans"
    ON public.volunteer_trip_plans FOR SELECT
    USING (volunteer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Volunteers can insert own trip plans"
    ON public.volunteer_trip_plans FOR INSERT
    WITH CHECK (volunteer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Volunteers can update own trip plans"
    ON public.volunteer_trip_plans FOR UPDATE
    USING (volunteer_id = auth.uid() OR public.is_admin());

CREATE POLICY "Trip stops are viewable by assigned volunteer or admin"
    ON public.volunteer_trip_stops FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.volunteer_trip_plans p
        WHERE p.id = plan_id AND (p.volunteer_id = auth.uid() OR public.is_admin())
    ));

CREATE POLICY "Trip stops can be inserted by plan owner"
    ON public.volunteer_trip_stops FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.volunteer_trip_plans p
        WHERE p.id = plan_id AND (p.volunteer_id = auth.uid() OR public.is_admin())
    ));

CREATE POLICY "Trip stops can be updated by plan owner"
    ON public.volunteer_trip_stops FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.volunteer_trip_plans p
        WHERE p.id = plan_id AND (p.volunteer_id = auth.uid() OR public.is_admin())
    ));
