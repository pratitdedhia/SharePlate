# 03. Target User Personas

**Focus:** Human-Centered Design for Fast-Turnaround Food Rescue  
**Scope:** 4 Distinct Role Personas with Tailored Navigation, Permissions & UX Workflows  

---

## Persona 1: Priya Sharma — Campus Dining Hall Supervisor
- **Role:** `donor` (Surplus Food Producer)
- **Organization:** Central Campus Dining Hall, DTU (Delhi Technological University), Rohini, Delhi
- **Demographics:** Age 34, Diploma in Hospitality Management, manages a kitchen staff of 14 cooks and helpers.
- **Context & Daily Reality:**
  - Manages lunch service from 11:30 AM to 2:30 PM for 1,200 residential and day scholars.
  - Due to fluctuating timetable turnouts (e.g. rain delays, exam study leaves), the kitchen frequently ends lunch with **35 to 60 portions of fresh, untouched Vegetable Biryani, Dal Makhani, or Paneer Sabzi** hot in insulated bain-maries.
  - Her afternoon cleaning shift ends strictly at 3:30 PM; she cannot sit at a desktop computer or answer repeated WhatsApp coordination queries while inspecting dish pits.
- **Core Goals:**
  - Create a verified listing in **under 60 seconds** from her smartphone camera.
  - Automatically have the food photo cropped to show the full plate clearly without manual editing.
  - Provide vehicle gate security clearance without exposing her personal WhatsApp or cell number publicly.
- **Pain Points & Frustrations:**
  - Hates typing long descriptions or dietary codes on greasy kitchen screens.
  - Refuses to participate in chaotic WhatsApp broadcast groups where random callers disturb her off-hours.
- **SharePlate UX Journey:**
  - Logs in to a focused **Donor Dashboard** with clutter-free navigation (no irrelevant "Browse Food" or "Impact Insights" tabs).
  - Taps `+ Donate Food`, uploads a camera photo.
  - Cloudinary's content-aware **AI Food Recognition** automatically detects `"Vegetable Biryani", "Cooked Meal", "Perishable"`, pre-filling category and suggested allergen tags.
  - Sets 4-hour pickup deadline, enters loading dock instructions, and publishes.
  - Receives live notification when a nearby NGO claims the batch.

---

## Persona 2: Rajesh Kumar — Non-Profit Operations Coordinator
- **Role:** `recipient` (Community Shelter Manager)
- **Organization:** Robin Hood Army / Hope Feeding Foundation, North Delhi Cluster
- **Demographics:** Age 41, Social Worker & Logistics Lead, oversees food distribution across 3 night shelters and 2 community schools.
- **Context & Daily Reality:**
  - Manages daily feeding for 180 children and destitute residents across Jahangirpuri and Rohini.
  - Operating budget is tightly constrained by fluctuating grain donations; commercial vegetable and dairy costs are prohibitive.
  - Needs reliable, hygienic, wholesome cooked meal batches available between 3:00 PM and 7:00 PM to serve before evening lock-in.
- **Core Goals:**
  - Discover nearby food surpluses within a 6 km transit perimeter.
  - Reserve exactly the portion quantity required (e.g., claiming 35 portions from a 60-portion listing) without double-booking disasters.
  - Review dietary safety (Veg/Non-Veg, dairy, spices) before feeding vulnerable children.
- **Pain Points & Frustrations:**
  - Driving a volunteer van 8 km through Delhi traffic only to discover another NGO already picked up the food.
  - Unclear gate directions causing security guards to turn drivers away at corporate campus boom barriers.
- **SharePlate UX Journey:**
  - Logs in to **Recipient Dashboard** (tailored feed focused on "Browse Food" and "My Claims").
  - Filters by `Veg` and `Cooked Meals` in `Delhi NCR`.
  - Sees DTU Canteen listing with Cloudinary 4:3 auto-cropped photo and `f_auto` WebP bandwidth savings.
  - Enters `35 portions` and hits `Reserve Portions`.
  - The atomic database RPC instantly locks the 35 portions, updates remaining portions to 25 across all web clients, and reveals the private loading dock gate code and supervisor phone.

---

## Persona 3: Ananya Sen — Logistics Volunteer Runner
- **Role:** `volunteer` (Last-Mile Food Rescue Runner & Logistics Courier)
- **Organization:** Delhi Youth Climate & Relief Cohort
- **Demographics:** Age 21, undergraduate student, commutes by two-wheeler (Honda Activa) equipped with insulated delivery bags.
- **Context & Daily Reality:**
  - Wants to contribute tangible social impact between college classes without committing to full-time NGO employment.
  - Operates as the **last-mile bridge** between donor kitchens that lack vehicles and community shelters that lack drivers.
- **Core Goals:**
  - Pick up surplus food parcels within a 15-minute response window and transport them within 45 minutes to retain thermal food safety ($>60^\circ\text{C}$).
  - Seamless mobile workflow: view pickup point, confirm dock arrival with a PIN code, and confirm dropoff at the shelter.
- **Pain Points & Frustrations:**
  - Getting stranded at campus security gates because the guard won't let two-wheelers past the boom barrier without an authorized gate pass.
  - No way to verify handoffs, leading to disputes over whether food actually reached the shelter.
- **SharePlate UX Journey:**
  - Logs in to specialized **Volunteer Dashboard** (showing active pickup requests and assigned routes).
  - Taps `Accept Route` for the DTU $\rightarrow$ Rohini Shelter run.
  - Shows digital gate clearance pass on her phone to DTU security.
  - Taps `Confirm Pickup`, loads thermal crate, rides 3.8 km to Rohini shelter.
  - Taps `Confirm Drop-off & Complete Rescue`, automatically updating platform carbon metrics.

---

## Persona 4: Vikram Malhotra — Platform Administrator & Safety Auditor
- **Role:** `admin` (Trust, Safety & Governance Operator)
- **Organization:** Municipal Civil Society Alliance / SharePlate Core Operations
- **Demographics:** Age 46, former supply chain manager and data analyst.
- **Context & Daily Reality:**
  - Responsible for platform integrity, FSSAI regulatory compliance, donor identity verification, and dispute resolution.
  - Must report accurate, verifiable social impact metrics (meals rescued, kg diverted, $CO_2e$ avoided) to sponsors and government partners.
- **Core Goals:**
  - Maintain a transparent, real-time audit ledger of **Who Donated** and **Who Received**.
  - Monitor portion conversion funnels (Listed $\rightarrow$ Claimed $\rightarrow$ Picked Up $\rightarrow$ Delivered) to identify operational drop-offs.
  - Review user logins, manage user accounts (Add, Edit, Deactivate abusive accounts), and resolve hygiene flags.
- **SharePlate UX Journey:**
  - Accesses full **Admin Dashboard** featuring 5 high-utility tabs:
    1. *Full Insights & Graphs:* Visual portion funnel, city-by-city volume, category breakdown, and verified $CO_2e$ avoided.
    2. *Who Donated Ledger:* Complete history of food contributions by donor organization and city.
    3. *Who Received Ledger:* Complete distribution history by recipient NGO with claim fulfillment ratios.
    4. *User Governance:* Add new institutional accounts, edit roles, toggle active status, or delete spam profiles.
    5. *Safety & Moderation:* Queue of reported listings for immediate investigation.

