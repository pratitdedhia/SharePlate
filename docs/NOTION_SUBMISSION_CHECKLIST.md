# Notion Submission Checklist

## Import The Project Journey

1. Create a Notion page for SharePlate and use the hackathon-required public project-journal/documentation workspace.
2. Import the Markdown files from `docs/notion/` in numerical order (`00_index.md` through `12_final_submission.md`). If importing one file at a time, use the index as the navigation page and link each imported subpage from it.
3. Review headings, tables, Mermaid diagrams, and internal links after import. Notion may require diagrams or relative links to be adjusted.
4. Resolve every `<<FILL: ...>>` placeholder and TODO. Verify the research citations, actual dates, team names/contributions, final tests, and deployment status with the team; do not submit guessed facts.
5. Use Notion's Share/Publish controls to make the project page publicly accessible. Open the public link in a signed-out browser to verify access.
6. Add the exact public page URL as the GitHub repository Actions Variable `VITE_NOTION_URL`. It is a public URL, not a secret. The workflow injects it into the Vite build; a new successful deployment is needed for the app link to appear.
7. Put the same public URL at the top of `README.md` in place of `<<FILL: public Notion page URL>>`.

## Unstop Submission Form

Use the final verified details only:

- Project name: SharePlate.
- Track/theme: Tech for Social Good; Hacktober HackDays 2026, SheBuilds Delhi, powered by MLH.
- Repository: `https://github.com/pratitdedhia/SharePlate`.
- Live demo: `https://pratitdedhia.github.io/SharePlate/` only after the latest Pages workflow succeeds and the URL opens correctly.
- Project journey: the public Notion URL verified in a signed-out browser.
- Cloudinary: describe unsigned-preset uploads only after testing a real upload on the deployed site. If Variables are absent, state that the uploader falls back to a labeled local preview.
- Backend: state that Supabase and Express are in the repository but are not deployed for the demo.
- Team: enter confirmed real names and contributions, not the placeholders in source docs.
- Demo video and metrics: provide only links and numbers that the team has actually checked. Explain that demo impact and environmental figures are local estimates.
