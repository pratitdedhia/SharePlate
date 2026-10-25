# SharePlate 3-Minute Demo Script

## Before The Demo

- Open the GitHub Pages site only after confirming the latest `deploy-pages.yml` run succeeded.
- Set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` as GitHub repository Variables. Verify an actual upload appears in Cloudinary before claiming the upload succeeds. Without those values, the uploader creates a labeled local preview only.
- Use the demo login options for donor, recipient, and volunteer roles. Demo listings and claims are stored in the current browser.
- If repository Variables are not configured, explain that Cloudinary support is implemented but a real upload is not enabled on that deployment.

## Timed Flow

1. **0:00–0:25 | Home and status**
   Open the app and point out the demo notice. Explain that the demo stores data in the browser; Supabase and Express are in the repository but are not deployed.

2. **0:25–1:05 | Donor creates a listing**
   Sign in using the donor demo option. Open **Donate Food**, fill in a food title, quantity, pickup deadline, and location. Select a real JPEG, PNG, or WebP photo smaller than 5 MB. When Cloudinary is configured, confirm the uploader says it uploaded to Cloudinary and shows the returned format/dimensions and measured delivery size. Otherwise show the “Demo preview — not uploaded to Cloudinary” label and do not describe it as an upload.

3. **1:05–1:40 | NGO claims portions**
   Sign in with the recipient demo option, open the listing, and claim a quantity no greater than the available amount. Point out that the browser-local count changes. State that this is a demo flow, not a cross-device atomic reservation.

4. **1:40–2:20 | Volunteer completes delivery**
   Sign in with the volunteer demo option, open the claim/delivery view, mark collection, then mark delivery. Show the updated status.

5. **2:20–2:45 | Impact snapshot**
   Open **Impact**. Explain that listed, reserved, available, and delivered portions come from the same demo records. Rescue rate is delivered portions divided by listed portions; food weight and CO2e are estimates.

6. **2:45–3:00 | Project journey**
   Open **Project Journey (Notion)** if the public URL is configured. Briefly describe the production architecture as code in the repository, not as a deployed backend.

## Likely Judge Questions

1. **Is the backend deployed?** No. GitHub Pages serves the static React demo. Supabase and Express are present in the repository as the production architecture but are not deployed for this demo.
2. **Does the photo really go to Cloudinary?** Only when the deployed build has a Cloudinary cloud name and unsigned upload preset configured. The page shows measured delivery details on success. Without configuration it is a local preview, not a Cloudinary upload.
3. **Where is the Cloudinary API secret?** It is not in client code. The static demo uses a public unsigned preset. The optional signed path uses the Express API when it is configured and reachable.
4. **Can two organizations claim the same portions at once?** The local demo validates quantity in its browser-local store but does not guarantee concurrency across tabs, browsers, or devices. The Supabase schema contains `claim_donation_atomic` for the production path.
5. **Are the impact numbers measured real-world outcomes?** No. They are derived from the current demo donation and claim records. Food weight and emissions use explicit estimates; rescue rate is delivered portions divided by listed portions.
6. **Does SharePlate verify food safety or NGO identities?** No. The prototype supports coordination fields and workflows. Food-safety inspection and NGO verification are roadmap items; donors and recipients remain responsible for safe handling and verification.
