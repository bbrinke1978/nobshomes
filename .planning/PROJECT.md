# No BS Homes

## What This Is

Full-featured marketing website and content management system for No BS Homes — a cash home buying service targeting distressed homeowners in Utah (foreclosure, tax liens, probate). The site drives leads through contact forms and voicemail, both feeding automatically into the HouseFinder application dashboard. Includes an authenticated admin portal for managing gallery photos, blog posts, and testimonials. Run by brothers Brian and Shawn.

## Core Value

Distressed homeowners can quickly submit their information and get connected to No BS Homes — every form submission and voicemail automatically becomes a trackable lead in HouseFinder.

## Requirements

### Validated

- ✓ Custom domain no-bshomes.com live with SSL — Phase 1
- ✓ Custom email via Google Workspace (brian@, shawn@, admin@no-bshomes.com) — Phase 2
- ✓ Contact form dual-submits to Netlify Forms + HouseFinder API — Phase 3
- ✓ HouseFinder /api/leads endpoint with Zod validation + x-api-key auth — Phase 3
- ✓ Website leads appear in HouseFinder dashboard with "Website" badge — Phase 3
- ✓ GA4 tracking (G-33FK8CFR8D) with form conversion events — Phase 4
- ✓ Google Search Console verified with sitemap — Phase 4
- ✓ JSON-LD structured data (RealEstateAgent + FAQPage) — Phase 4
- ✓ Google Business Profile created (admin@no-bshomes.com) — Phase 4
- ✓ Google Voice voicemail → HouseFinder lead automation via Apps Script — Phase 5
- ✓ Voicemail leads show "Voicemail" badge in HouseFinder — Phase 5
- ✓ Blog system with markdown rendering — Phase 6, migrated to DB in Phase 7
- ✓ Gallery page with responsive image grid — Phase 6, migrated to DB in Phase 7
- ✓ Testimonials section on homepage — Phase 6, migrated to DB in Phase 7
- ✓ Admin portal at /admin with Google OAuth (NextAuth v5) — Phase 7
- ✓ Gallery admin with drag-and-drop upload to Azure Blob Storage — Phase 7
- ✓ Blog admin with TipTap rich text editor — Phase 7
- ✓ Testimonials admin with CRUD + reorder — Phase 7
- ✓ All public content pages render from PostgreSQL database — Phase 7

### Active

(None — all current requirements shipped)

### Out of Scope

- Logo redesign — deferred, will revisit later
- Property search on marketing site — HouseFinder handles that
- Mobile app — web only
- City-specific landing pages — deferred
- SMS auto-response to leads — deferred
- Lead form A/B testing — deferred

## Context

- **Companion app:** HouseFinder (housefinder-app.azurewebsites.net) on Azure — lead dashboard, scraper, deal management
- **Shared database:** HouseFinder PostgreSQL on Azure Flexible Server (v16). nobshomes uses nbs_ prefixed tables via Drizzle ORM with tablesFilter
- **Image storage:** Azure Blob Storage (housefinderstorage/nobshomes container), SAS URL pattern (public access blocked)
- **Lead pipeline:** Contact form → Netlify Forms + server proxy → HouseFinder /api/leads. Voicemail → Google Voice → Gmail → Apps Script → /api/leads
- **Domain:** no-bshomes.com on GoDaddy DNS → Netlify. MX records point to Google Workspace
- **Auth:** Google OAuth via NextAuth v5, JWT sessions, allowlisted emails only
- **Analytics:** GA4 (G-33FK8CFR8D), GSC verified, GBP under admin@no-bshomes.com

## Constraints

- **Hosting:** Netlify (serverless functions, 6MB body limit — image uploads bypass via SAS URLs)
- **Domain registrar:** GoDaddy DNS (locked decision — preserves MX record control)
- **Database:** Shared with HouseFinder — nbs_ prefix required, tablesFilter isolation, max 3 connections
- **Tech stack:** Next.js 15 + React 19 + Tailwind CSS 4 + Drizzle ORM

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep Netlify hosting | Already deployed, free tier sufficient | ✓ Good |
| HouseFinder API for leads | Keeps systems independent, API key auth | ✓ Good |
| Dual form submission | Netlify as backup/spam filter, API for lead creation | ✓ Good |
| GoDaddy DNS (no transfer) | Preserves MX record control for email | ✓ Good |
| Google Workspace for email | Already had it, no Zoho needed | ✓ Good |
| Apps Script for voicemail | Free, runs on Google infra, no new services | ✓ Good |
| Shared DB with nbs_ prefix | No new database needed, clean isolation | ✓ Good |
| Azure Blob with SAS URLs | Existing storage account, secure by default | ✓ Good |
| TipTap for blog editor | Lightweight, no AI dependency, outputs HTML | ✓ Good |
| Google OAuth for admin | Team uses Google Workspace, no passwords | ✓ Good |

---
*Last updated: 2026-04-08 after Phase 7 completion*
