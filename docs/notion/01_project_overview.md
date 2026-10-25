# 01. Project Overview & Social Vision

**Product Name:** SharePlate  
**Tagline:** Rescue Food. Reduce Waste. Feed Communities.  
**Track:** Tech for Social Good  
**Event:** Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH  
**Live URL:** [https://pratitdedhia.github.io/SharePlate/](https://pratitdedhia.github.io/SharePlate/)  
**GitHub Repository:** [https://github.com/pratitdedhia/SharePlate](https://github.com/pratitdedhia/SharePlate)  

---

## 1. Executive Summary & The Urban Paradox

In contemporary Indian metropolitan corridors—most notably the Delhi NCR region (Rohini, Connaught Place, Gurugram Cyber City, Noida) and Mumbai—two stark realities unfold simultaneously within mere kilometers of each other:

1. **Massive Institutional Food Surplus Discard:** University dining halls (such as DTU, NSUT, and Delhi University colleges), corporate campus cafeterias, banquet venues, and commercial bakeries routinely conclude their daily lunch and dinner shifts with **30 to 120 unserved, piping-hot, high-nutrition portions**. Lacking a frictionless, instant dispatch system, commercial kitchen staff are forced to dump this wholesome food into standard municipal solid waste (MSW) skips to clear counters for the subsequent shift.
2. **Acute Resource Deprivation Across Vulnerable Populations:** Simultaneously, community-run transit shelters (e.g., DUSIB night shelters), non-profit children's learning centers, migrant worker bastis, and old-age ashrams struggle daily with spiraling food grain costs, volunteer burnout, and fluctuating donation funding, frequently rationing lentils and flatbreads.

**SharePlate** bridges this fatal logistics gap. We replace slow, chaotic WhatsApp broadcast chains and late-night phone trees with an ultra-responsive, real-time food rescue platform that converts surplus meals into delivered community nourishment in under 90 minutes.

```
+--------------------------+          +-------------------------+          +------------------------+
|   Commercial Kitchens    |          |    SharePlate Engine    |          |   Community Shelters   |
| (Canteens, Caterers,     |  ====>   |  • Instant Listing      |  ====>   |  (NGOs, DUSIB Night    |
|  Bakeries in Delhi NCR)  |          |  • Cloudinary AI Media  |          |   Shelters, Ashrams)   |
|                          |          |  • Atomic Claim Lock    |          |                        |
|  Surplus: 30-100 meals   |          |  • Protected Logistics  |          |  Nutritious Food in    |
|  Time window: 2-3 hours  |          |  • Runner GPS Routing   |          |  <90 Minutes           |
+--------------------------+          +-------------------------+          +------------------------+
```

---

## 2. Core Value Pillars

SharePlate is architected around four non-negotiable operational pillars designed to overcome the friction points that cause real-world food redistribution initiatives to fail:

### Pillar I: 60-Second Low-Friction Listing for Donors
Commercial canteen operators cannot be burdened with multi-screen onboarding or complex metadata entry during peak closing rushes. SharePlate provides a streamlined donor listing interface:
- **Fast Upload:** A single camera snap uploaded via Cloudinary with automatic WebP/AVIF format optimization (`f_auto`) and intelligent compression (`q_auto`).
- **AI Food Recognition:** Cloudinary's content-aware AI auto-tagging scans the meal (identifying rice, curry, vegetables, breads) and suggests allergen and shelf-life flags instantly.
- **Auto-Calculated Safe Lifespan:** Default pickup deadlines (e.g., 4-hour countdown) based on FSSAI hot-holding food guidance.

### Pillar II: Atomic Race-Condition-Proof Reservations
In high-density urban areas, multiple NGOs and volunteer coordinators often discover the same surplus listing simultaneously. If two shelters dispatch drivers for the same 40 portions, one arrives at an empty loading dock—wasting precious volunteer fuel and goodwill.
- SharePlate guarantees **concurrency-safe atomic reservations** through database transactions (`claim_donation_atomic` RPC in Supabase/PostgreSQL with `FOR UPDATE` row-level locks).
- If a listing has 40 portions and Shelter A claims 25, the remaining 15 portions are instantly reflected in real time across all open client browsers via Supabase Realtime websockets. Double-booking is mathematically impossible.

### Pillar III: Protected Logistics & Anti-Scraping Security
Surplus food listings must never expose raw kitchen loading dock PINs, vehicle ramp passes, or private cell numbers of kitchen managers to unverified public scrapers or internet crawlers.
- **Public Feed:** Displays general locality (e.g., "North Campus, Delhi", "Sector 62, Noida"), portion count, category, and Cloudinary food photo.
- **Claim-Locked Disclosure:** Full pickup directions, vehicle gate clearance codes, and donor contact numbers are masked and revealed **exclusively** to the verified claimant upon confirmed reservation.

### Pillar IV: Real-World Volunteer Courier Enablement
Food rescue fails when donor kitchens have food but no transport, while recipient shelters have hungry residents but no drivers.
- SharePlate explicitly empowers **Volunteer Food Runners**: local college students and youth couriers with two-wheelers who accept transfer routes, unlock dock access via secure PIN, transport food in thermal crates, and complete handoffs at shelter doors.

---

## 3. Measurable Social & Environmental Impact

Food waste is not merely an ethical catastrophe; it is one of the leading contributors to anthropogenic greenhouse gas emissions:

### A. Carbon Abatement Calculations
- According to the United Nations Environment Programme (UNEP) and FAO lifecycle analyses, municipal food waste decomposing anaerobically in unmanaged landfill conditions (such as Delhi's Ghazipur and Bhalswa landfills) releases massive plumes of methane gas ($CH_4$).
- Methane has a **Global Warming Potential 28 times greater than $CO_2$** over a 100-year horizon.
- Every standard meal portion rescued (average 420 grams of cooked food) diverts approximately 0.42 kg of organic matter from open landfills, **averting an estimated 1.05 kg of $CO_2$ equivalent emissions** ($2.5\text{ kg } CO_2e\text{ per kg food waste}$).

$$\text{CO}_2\text{e Avoided (kg)} = \text{Rescued Portions} \times 0.42\text{ kg} \times 2.5\text{ kg CO}_2\text{e/kg}$$

### B. Life-Saving Nutritional Support
Rescuing 10,000 portions of cooked lentil curries, vegetable biryanis, and whole-wheat breads delivers approximately:
- **4.2 million kilocalories** of wholesome nutritional intake.
- Essential protein, fiber, and micronutrients directly to vulnerable women, children, and elderly citizens across urban shelter networks.

---

## 4. Guardrails, Safety & FSSAI Compliance

SharePlate maintains transparent, defensible legal and operational guardrails:

| Boundary | SharePlate Stance | Operating Procedure |
| :--- | :--- | :--- |
| **Food Safety Liability** | SharePlate is an open digital coordination layer, **not** a licensed food testing laboratory. | Donors affirm under FSSAI Good Hygiene Practices that food was prepared under sanitary conditions and held within safe thermal limits. |
| **Strict Expiry Deadlines** | Listings must have an active `pickup_deadline` (maximum 6 hours for cooked hot food). | Listings past deadline automatically change status to `expired` and are removed from the active claim feed. |
| **Delivery Verification** | Portions are not credited to impact until handoff is verified. | 3-stage state machine: `Reserved` $\rightarrow$ `Picked Up` $\rightarrow$ `Delivered`. If a courier cancels, portions immediately release back to the surplus pool. |

---

## 5. SheBuilds & MLH Hacktober HackDays 2026 Alignment

SharePlate was conceived and built specifically for the **SheBuilds Delhi Chapter — Hacktober HackDays 2026 (MLH)** under the **Tech for Social Good** track:
- **Cloudinary Requirement:** Fully satisfies and exceeds mandatory sponsor tech by implementing browser-direct uploads (dual signed + unsigned preset architecture), responsive derivative `srcset` breakpoints, dynamic `f_auto, q_auto` compression saving up to 83% bandwidth on mobile data networks, content-aware auto-cropping (`c_fill, g_auto`), and AI food recognition tagging.
- **Notion Requirement:** Complete 13-document engineering and product portfolio recording our architectural blueprints, schema designs, concurrency proofs, test suites, and team contributions.

