-- ==============================================================================
-- SharePlate Realistic Seed Dataset (Demonstration Data)
-- Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH
-- ==============================================================================

-- 1. CLEAN EXISTING DEMO RECORDS (Safe idempotency)
DELETE FROM public.activity_logs WHERE actor_id IN (
    'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004',
    'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001'
);

-- 2. INSERT PROFILES
INSERT INTO public.profiles (id, full_name, email, role, organization_name, phone, city, service_area, avatar_url, is_active)
VALUES
    -- Donors
    ('a0000000-0000-0000-0000-000000000001', 'Priya Sharma', 'donor@shareplate.demo', 'donor', 'DTU Campus Central Canteen', '+91 98110 12345', 'Delhi NCR', 'Rohini & Pitampura', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80', true),
    ('a0000000-0000-0000-0000-000000000002', 'Chef Vikram Malhotra', 'vikram@annapurnacaterers.com', 'donor', 'Annapurna Grand Caterers', '+91 98200 67890', 'Mumbai', 'Andheri & BKC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80', true),
    ('a0000000-0000-0000-0000-000000000003', 'Amit Deshmukh', 'amit@greenleafbistro.in', 'donor', 'Green Leaf Bistro & Bakery', '+91 98900 23456', 'Pune', 'Kothrud & Deccan', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80', true),
    ('a0000000-0000-0000-0000-000000000004', 'Neha Gupta', 'neha@sec62cafeteria.org', 'donor', 'Sector 62 Corporate Cafeteria', '+91 99100 45678', 'Noida', 'Sector 62 & Indirapuram', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', true),
    
    -- Recipients (NGOs / Community Kitchens)
    ('b0000000-0000-0000-0000-000000000001', 'Rajesh Kumar', 'recipient@shareplate.demo', 'recipient', 'Robin Hood Army - Delhi Chapter', '+91 98711 22334', 'Delhi NCR', 'North & West Delhi', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80', true),
    ('b0000000-0000-0000-0000-000000000002', 'Sneha Patil', 'sneha@feedingindia.org', 'recipient', 'Feeding India - Mumbai Hub', '+91 98201 55667', 'Mumbai', 'Western Suburbs', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', true),
    ('b0000000-0000-0000-0000-000000000003', 'Manoj Joshi', 'manoj@punerotibank.org', 'recipient', 'Pune Roti Bank Foundation', '+91 98500 88990', 'Pune', 'Pune Central & Hadapsar', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80', true),

    -- Volunteers
    ('c0000000-0000-0000-0000-000000000001', 'Ananya Sen', 'volunteer@shareplate.demo', 'volunteer', 'Youth For Food Relief', '+91 98118 77665', 'Delhi NCR', 'South Delhi', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80', true),
    ('c0000000-0000-0000-0000-000000000002', 'Rohan Mehta', 'rohan@foodrunnersmumbai.org', 'volunteer', 'Food Runners Mumbai', '+91 98330 44332', 'Mumbai', 'Bandra to Andheri', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80', true),

    -- Admin
    ('e0000000-0000-0000-0000-000000000001', 'SharePlate Ops Admin', 'admin@shareplate.org', 'admin', 'SharePlate Foundation', '+91 11 2345 6789', 'Delhi NCR', 'Pan-India', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80', true)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    organization_name = EXCLUDED.organization_name,
    city = EXCLUDED.city,
    service_area = EXCLUDED.service_area,
    is_active = EXCLUDED.is_active;

-- 3. INSERT REALISTIC DONATIONS
INSERT INTO public.donations (
    id, donor_id, title, description, category, quantity_total, quantity_available, quantity_unit,
    image_url, cloudinary_public_id, ingredients, allergens, preparation_time, pickup_deadline,
    pickup_instructions, city, location_label, latitude, longitude, status, created_at
) VALUES
    -- 1. Vegetable Pulao (DTU Canteen, Delhi) - AVAILABLE
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
     'Fresh Vegetable Biryani & Raita (Hot)',
     'Surplus fragrant basmati rice biryani cooked with carrots, green peas, cauliflower, and mild aromatic spices from lunchtime batch. Packed in thermal containers.',
     'cooked_meals', 45, 45, 'portions',
     'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
     'shareplate/demo/vegetable_biryani_01',
     'Basmati rice, green peas, carrots, beans, onions, ghee, cumin, coriander',
     'Dairy (ghee)', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '4 hours',
     'Report to Gate 2 Security; canteen staff will bring containers down to the vehicle ramp.',
     'Delhi NCR', 'DTU Campus, Rohini Sector 17', 28.7495, 77.1184, 'available', NOW() - INTERVAL '3 hours'),

    -- 2. Fresh Chapati & Paneer Bhurji (Annapurna Caterers, Mumbai) - PARTIALLY CLAIMED (RESERVED)
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002',
     'Whole Wheat Roti & Paneer Bhurji Boxes',
     'Freshly rolled phulkas (rotis) paired with spiced cottage cheese bhurji from corporate luncheon. Individually boxed in eco-friendly meal trays.',
     'cooked_meals', 60, 20, 'portions',
     'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
     'shareplate/demo/paneer_roti_02',
     'Whole wheat flour, cottage cheese (paneer), tomatoes, bell peppers, turmeric, mustard oil',
     'Gluten, Dairy', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '3 hours',
     'Behind Trade World Building, Loading Dock C. Contact Security Supervisor Ramesh.',
     'Mumbai', 'BKC Commercial Hub, Bandra East', 19.0657, 72.8687, 'available', NOW() - INTERVAL '2 hours'),

    -- 3. Artisan Bakery Assortment (Green Leaf Bistro, Pune) - AVAILABLE
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003',
     'Fresh Multigrain Bread Loaves & Dinner Rolls',
     'Day-baked European-style crusty multigrain sourdough loaves and soft dinner buns. Perfectly fresh and sealed in food-grade brown kraft bags.',
     'bakery', 35, 35, 'packs',
     'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
     'shareplate/demo/artisan_bread_03',
     'Wheat flour, rye, oats, flax seeds, active yeast, rock salt, water',
     'Gluten (wheat, rye, oats)', NOW() - INTERVAL '5 hours', NOW() + INTERVAL '12 hours',
     'Pickup from back kitchen alley entrance next to Deccan Gymkhana library.',
     'Pune', 'Deccan Gymkhana, FC Road', 18.5167, 73.8415, 'available', NOW() - INTERVAL '5 hours'),

    -- 4. South Indian Breakfast Feast (Corporate Park, Noida) - DELIVERED
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004',
     'Steamed Idlis, Medu Vada & Piping Hot Sambar',
     'Morning breakfast conference catering surplus. 80 fresh soft idlis with lentil sambar and dry podi accompaniment.',
     'cooked_meals', 40, 0, 'portions',
     'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
     'shareplate/demo/idli_sambar_04',
     'Rice, urad dal, fenugreek, toor dal, drumsticks, pumpkin, curry leaves, tamarind',
     'Mustard, Coconut', NOW() - INTERVAL '1 day', NOW() - INTERVAL '18 hours',
     'Service elevator entrance at Tower B baseline lobby.',
     'Noida', 'Sector 62 IT Hub', 28.6280, 77.3649, 'delivered', NOW() - INTERVAL '1 day'),

    -- 5. Seasonal Fresh Fruits (Annapurna Caterers, Mumbai) - AVAILABLE
    ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002',
     'Whole Fresh Apples, Bananas & Kinnow Oranges',
     'Uncut, washed, high-grade seasonal fruits from wedding buffet setup. Stored in ventilated crates.',
     'produce', 50, 50, 'portions',
     'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
     'shareplate/demo/fresh_fruits_05',
     'Shimla apples, Robusta bananas, Kinnow oranges',
     'None', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '24 hours',
     'Ring service bell at Annapurna Central Kitchen, Sakinaka.',
     'Mumbai', 'Andheri East, Sakinaka', 19.1075, 72.8877, 'available', NOW() - INTERVAL '4 hours'),

    -- 6. Dal Makhani & Jeera Rice Trays (DTU Canteen, Delhi) - DELIVERED
    ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
     'Rich Dal Makhani & Jeera Rice Combo',
     'Slow-cooked black lentils simmered with ginger, garlic, and fresh cream, served with cumin-tempered basmati rice.',
     'cooked_meals', 50, 0, 'portions',
     'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
     'shareplate/demo/dal_makhani_06',
     'Black urad dal, kidney beans, butter, cream, basmati rice, cumin',
     'Dairy', NOW() - INTERVAL '2 days', NOW() - INTERVAL '40 hours',
     'Gate 1 DTU, Administrative block portico.',
     'Delhi NCR', 'Rohini Sector 16', 28.7450, 77.1120, 'delivered', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    quantity_available = EXCLUDED.quantity_available,
    status = EXCLUDED.status;

-- 4. INSERT REALISTIC CLAIMS ACROSS LIFECYCLE
INSERT INTO public.claims (
    id, donation_id, recipient_id, quantity_claimed, status, claimed_at, collected_at, delivered_at, notes
) VALUES
    -- Claim 1: Partially claimed active reservation (Mumbai Roti & Paneer)
    ('f0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000002',
     'b0000000-0000-0000-0000-000000000002',
     40, 'claimed', NOW() - INTERVAL '1 hour', NULL, NULL,
     'Reserved for Dharavi community shelter night meal distribution.'),

    -- Claim 2: Fully delivered claim (Noida Idli Sambar)
    ('f0000000-0000-0000-0000-000000000002',
     'd0000000-0000-0000-0000-000000000004',
     'b0000000-0000-0000-0000-000000000001',
     40, 'delivered', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '21 hours', NOW() - INTERVAL '19 hours',
     'Distributed to children and elderly residents near Sector 62 transit camp.'),

    -- Claim 3: Fully delivered past claim (Delhi Dal Makhani)
    ('f0000000-0000-0000-0000-000000000003',
     'd0000000-0000-0000-0000-000000000006',
     'b0000000-0000-0000-0000-000000000001',
     50, 'delivered', NOW() - INTERVAL '47 hours', NOW() - INTERVAL '45 hours', NOW() - INTERVAL '42 hours',
     'Served at Rohini community shelter.')
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    notes = EXCLUDED.notes;

-- 5. ACTIVITY LOGS
INSERT INTO public.activity_logs (actor_id, donation_id, claim_id, action, details, created_at)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', NULL, 'donation_created', '{"title": "Fresh Vegetable Biryani & Raita (Hot)", "portions": 45}', NOW() - INTERVAL '3 hours'),
    ('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'claim_created', '{"claimed_quantity": 40, "remaining": 20}', NOW() - INTERVAL '1 hour'),
    ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'claim_delivered', '{"beneficiaries": 40, "location": "Noida Sector 62"}', NOW() - INTERVAL '19 hours')
ON CONFLICT (id) DO NOTHING;
