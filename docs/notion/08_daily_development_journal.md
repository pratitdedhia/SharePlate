# 08. Project Journey Notes

**Status:** Repository-based journey outline. Specific dates, sequence, authors, and historical test results were not verified here. Confirm these details with the team before publishing a dated journal.

## Implementation Evidence

- The repository contains a React 18, Vite, TypeScript, and Tailwind web app under `apps/web`, plus an Express API under `apps/api`.
- The web app includes donation creation, browse/detail pages, role dashboards, claim lifecycle UI, and impact views.
- Cloudinary code includes a server signature endpoint and browser upload helper. The Pages demo uses unsigned uploads when configured; the API-backed signed route is an optional architecture path.
- `supabase/` contains the schema and migrations, including the production atomic claim function. The Pages demo uses browser-local demo data and does not call that production path.
- `docs/notion/` contains Markdown source material intended for import into the required Notion project page.

## Confirm With The Team Before Adding Dates

- TODO: add the actual development dates and event milestones.
- TODO: identify who implemented each verifiable change; see `10_team_contributions.md`.
- TODO: replace historical test/build claims with command output observed for the final revision.
