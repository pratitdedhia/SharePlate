# SharePlate Registration & Onboarding
**Hacktober HackDays 2026 | SheBuilds Delhi Chapter | Powered by MLH**

---

## 1. Registration Architecture

SharePlate provides a multi-role onboarding experience at `/register`. Users select their role via interactive, visual cards that dynamically render relevant organizational and logistical fields without resetting previously entered common details.

---

## 2. Permitted Registration Roles

Public registration is strictly permitted for:
1. **Food Donor (`donor`):** Restaurants, college canteens, corporate caterers, bakeries with surplus edible food.
2. **Recipient Organization (`recipient`):** NGOs, community kitchens, homeless shelters, food banks, and care homes. The demo does not verify organization status.
3. **Volunteer Logistics Courier (`volunteer`):** Individuals assisting in rapid meal transport between donor kitchens and distribution centers.

> [!CAUTION]
> **Administrative Role Security:** Registration as an administrator (`admin`) via public signup is strictly prohibited both on the frontend form and through the PostgreSQL database trigger `handle_new_user()`. Attempting to pass `role: 'admin'` in user metadata automatically defaults to `donor`.

---

## 3. Field Specifications & Validation

### Common Account Fields
- **Full Legal Name:** Min 2 characters.
- **Email Address:** Validated RFC 5322 format. Duplicate emails are safely rejected.
- **Indian Mobile Number:** Validates 10-digit format starting with digits 6, 7, 8, or 9 (with or without `+91`).
- **City:** Selection of Indian metropolitan hubs (Delhi NCR, Mumbai, Pune, Noida, Bengaluru, Kolkata, Chennai, Hyderabad).
- **Password & Confirm Password:** Minimum 6 characters with inline mismatch detection and show/hide toggles.
- **Optional Profile Avatar:** URL pointing to an authorized image or Cloudinary asset.

### Conditional Role Fields

#### A. Donor Fields
- **Business / Kitchen Name:** (Required) e.g., DTU Central Canteen.
- **Donor Type:** Selection between `restaurant`, `canteen`, `caterer`, `event_organizer`, `bakery`, `other`.
- **Pickup City & Service Corridor:** Specific campus gates or commercial pickup zones.
- **Contact Person:** Kitchen manager or chef on duty.

#### B. Recipient Fields
- **Organization Name:** (Required) e.g., Robin Hood Army Delhi.
- **Organization Type:** Selection between `ngo`, `shelter`, `community_kitchen`, `food_bank`, `orphanage`, `other`.
- **Distribution Area:** Slum settlements, shelters, or community feeding points.
- **Contact Person:** Relief operations lead.

#### C. Volunteer Fields
- **Service Corridor:** Preferred delivery corridors (e.g. South Delhi to Noida).
- **Availability Window:** Weekdays, Weekends, Evenings, or Flexible/On-Call.
- **Introduction / Vehicle Bio:** Optional transport vehicle details (bicycle, scooter, car).

---

## 4. Post-Registration Workflow

1. Form data is sanitized and submitted to `supabase.auth.signUp()`.
2. Database trigger `on_auth_user_created` creates the authoritative row in `public.profiles`.
3. If email verification is enabled in Supabase, an alert prompts the user to check their inbox.
4. If session is immediately established, the user is navigated directly to `/dashboard/{selected_role}`.
