# 02. Problem Research & Food Waste in India

**Research Pillar:** Tech for Social Good  
**References:** UNEP Food Waste Index Report 2024, FAO Global Food Losses, FSSAI Recovery of Surplus Food Regulations (2019), Ministry of Consumer Affairs, Food & Public Distribution  

---

## 1. The Macro Picture: Food Waste in Urban India

India presents one of the sharpest paradoxes in global food logistics. According to the **United Nations Environment Programme (UNEP) Food Waste Index Report (2024)**:
- Indian urban households and institutional food services generate an estimated **68,760,163 tonnes of food waste annually** (approx. 55 kg per capita per year).
- In high-density metros such as Delhi NCR, commercial and institutional food services account for an estimated **35% to 42% of total discard volume**, primarily driven by:
  - University canteens and hostel mess halls (preparing buffer portions for fluctuating student attendances).
  - Corporate tech parks (cafeterias in DLF Cyber City, Noida Sector 62, and Bengaluru Outer Ring Road with unpredictable hybrid work attendances).
  - Large-scale wedding banquet corridors (such as GT Karnal Road, Chattarpur, and MG Road) where over-catering by 20–30% is culturally mandatory.

```
Institutional Food Loss Spectrum (Metropolitan Delhi NCR):
+---------------------------------------------------------------------------------+
| University Canteens: 30-80 portions/day (predictable, hot cooked meals)        |
| Corporate Tech Cafeterias: 40-120 meal boxes/day (packaged, high hygiene)       |
| Commercial Bakeries: 20-50 kg bread/pastries/day (ambient, long shelf life)    |
| Wedding & Event Banquets: 100-300 feast portions/event (spontaneous, late night)|
+---------------------------------------------------------------------------------+
```

---

## 2. Why Existing Workarounds Fail

Before engineering SharePlate, our team conducted qualitative research into how food establishments and volunteer networks currently handle surplus food:

### Inefficient Workaround 1: Informal WhatsApp Broadcast Groups
- **The Process:** A mess manager takes a photo of three trays of leftover dal and rice, posting to a city-wide "Food Rescue" WhatsApp group with 300+ members.
- **Why It Fails:**
  1. *Signal-to-Noise Ratio:* Important alerts are buried under conversational chatter, emojis, and off-topic forward messages.
  2. *Zero Concurrency Control:* Multiple NGOs see the message and simultaneously send drivers. If Shelter A arrives first and collects the trays, Shelter B’s driver arrives 15 minutes later to an empty kitchen—burning valuable fuel.
  3. *Zero Privacy Protection:* Publishing the kitchen manager's phone number and gate directions to 300 unknown individuals leads to spam calls during working hours.

### Inefficient Workaround 2: Spontaneous Cold-Calling
- **The Process:** NGO coordinators call caterers or restaurant managers late at night (10:30 PM) asking if food is available.
- **Why It Fails:** Staff have usually already discarded the food into municipal waste bins by 10:00 PM to finish their cleanup shifts and catch the last metro or bus home.

### Inefficient Workaround 3: Large Specialized Logistics Fleets
- **The Process:** Centralized NGOs dispatch large insulated vans to collect food.
- **Why It Fails:** Scheduled vans cannot react to sudden 30-portion surpluses with a 90-minute lifespan. The fuel cost of a 4-wheeler van often exceeds the economic value of the food being rescued.

---

## 3. Regulatory Alignment: FSSAI Guidelines

In 2019, the Food Safety and Standards Authority of India promulgated the **Food Safety and Standards (Recovery and Distribution of Surplus Food) Regulations, 2019**. SharePlate directly aligns with these statutory recommendations:

1. **Hygiene Verification at Source:** Donors must ensure surplus food was held within safe thermal limits (hot food above $60^\circ\text{C}$ or chilled below $5^\circ\text{C}$). SharePlate incorporates this as a required pre-listing checklist.
2. **Clear Labeling of Preparation Time & Expiry:** Under Regulation 4(2), rescued food must be consumed within its remaining safe shelf life. SharePlate enforces mandatory `prepared_at` timestamps and auto-calculates strict `pickup_deadline` countdowns.
3. **Traceability of Surplus Distribution:** Donors and recipients are required to maintain basic transaction logs of distributed surplus. SharePlate automates this via real-time audit tables and role-based administration reports.

---

## 4. Quantitative Supply-Demand Field Hypotheses

| Metric | Working Assumption | Field Validation Protocol |
| :--- | :--- | :--- |
| **Donor Listing Friction** | Canteen staff will list surplus if the form requires $\le 60\text{ seconds}$ and $\le 5\text{ clicks}$. | Tested via single-page form with auto-crop camera presets and AI tag generation. |
| **Time-to-Claim SLA** | In dense zones (e.g. North Campus), 80% of listings will be reserved within 45 minutes of publishing. | Validated in real-time websocket feed with dynamic portion countdowns. |
| **Last-Mile Transport** | 2-wheeler student/youth runners can complete pickups within a 4 km radius for batches $\le 50\text{ portions}$. | Enabled by dedicated Volunteer Runner portal with PIN dock unlock. |

