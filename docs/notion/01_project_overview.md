# 01. Project Overview & Social Vision

**Product Name:** SharePlate  
**Tagline:** Rescue Food. Reduce Waste. Feed Communities.  
**Track:** Tech for Social Good  

---

## 1. Problem Statement
Every day, commercial food establishments—including university dining halls, banquet caterers, corporate park cafeterias, and bakeries—prepare surplus food that remains fresh, untouched, and fully edible at the end of service. Due to a lack of immediate, decentralized coordination tools, this food is routinely discarded into municipal waste streams.

At the same time, community kitchens, transit shelters, and non-profit organizations face chronic resource shortages in providing daily nutritious meals to vulnerable populations.

## 2. Our Solution: SharePlate
SharePlate is a food-rescue prototype. The GitHub Pages demo runs in browser-local demo mode; Supabase and Express are repository production architecture and are not deployed with the demo.
1. **Donor workflow:** The demo can create listings with portion estimates, allergen tags, pickup deadlines, and a food image. Real Cloudinary uploads require the configured cloud name and unsigned preset.
2. **Recipient workflow:** Demo users can claim available portions. The demo store checks available quantity and deadline; it does not provide cross-device concurrency guarantees.
3. **Production claim path:** The Supabase schema contains `claim_donation_atomic`; this is not the deployed demo path.
4. **Impact snapshot:** Home and Impact calculate listed, reserved, available, and delivered portions from the same demo records. Rescue rate is delivered portions divided by listed portions.

## 3. Product Scope & Guardrails
- **What SharePlate IS:** A community coordination tool that accelerates the rescue of fresh surplus food.
- **What SharePlate IS NOT:** A food safety certification body. We factually communicate that donors are responsible for accurate food disclosures, and recipients must follow standard hygiene upon pickup.
