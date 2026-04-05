# No BS Homes

## What This Is

Marketing website for No BS Homes — a cash home buying service targeting distressed homeowners in Utah (foreclosure, tax liens, probate). The site drives leads through contact forms that feed into the HouseFinder application dashboard as "website" lead type. Run by brothers Brian and Shawn.

## Core Value

Distressed homeowners can quickly submit their information and get connected to No BS Homes — every form submission automatically becomes a trackable lead in HouseFinder.

## Requirements

### Validated

- ✓ Marketing homepage with value proposition — existing
- ✓ About page with company story — existing
- ✓ FAQ page answering common seller questions — existing
- ✓ How It Works page explaining the process — existing
- ✓ Contact form with Netlify Forms — existing
- ✓ Responsive design with Tailwind CSS — existing
- ✓ Logo kit integrated (horizontal + stamp variants) — existing
- ✓ Deployed on Netlify — existing

### Active

- [ ] Custom domain (no-bshomes.com) configured via GoDaddy → Netlify
- [ ] Form submissions create leads in HouseFinder with leadSource: "website"
- [ ] API endpoint on HouseFinder to accept external lead submissions
- [ ] Updated contact info site-wide (phone: 435-250-3678, email: contact@no-bshomes.com)
- [ ] Custom domain emails working (brian@no-bshomes.com, shawn@no-bshomes.com, contact@no-bshomes.com)

### Out of Scope

- Logo redesign — deferred, will revisit later
- User accounts / login on marketing site — not needed
- Blog / CMS — not for this milestone
- Property search on marketing site — HouseFinder handles that
- Mobile app — web only

## Context

- **Companion app:** HouseFinder (housefinder-app.azurewebsites.net) is the operational backend with lead dashboard, scraper, and deal management. Owned by same team.
- **HouseFinder lead system:** Already supports "website" lead source type in schema and UI. Needs API endpoint at `/api/leads` to accept POST requests from No BS Homes forms.
- **HouseFinder stack:** Next.js, Drizzle ORM, deployed on Azure. Leads table has: status, distressScore, isHot, leadSource, alertSent fields.
- **Current forms:** Using Netlify Forms with honeypot spam protection. Need to also POST to HouseFinder API.
- **Domain:** no-bshomes.com purchased through GoDaddy. DNS needs to point to Netlify.

## Constraints

- **Hosting:** Netlify (already deployed, keep it)
- **Domain registrar:** GoDaddy — DNS configuration needed
- **HouseFinder integration:** Must use HouseFinder's existing lead schema (leads table with propertyId FK)
- **Tech stack:** Next.js 15 + React 19 + Tailwind CSS 4 (already established)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep Netlify hosting | Already deployed and working, free tier sufficient | — Pending |
| HouseFinder API for leads | Direct DB access from marketing site would couple systems; API keeps them independent | — Pending |
| Dual form submission (Netlify + HouseFinder API) | Netlify Forms as backup/spam filter, API for lead creation | — Pending |

---
*Last updated: 2026-04-05 after initialization*
