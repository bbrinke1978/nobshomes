# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-05)

**Core value:** Distressed homeowners can quickly submit their information and get connected to No BS Homes — every form submission automatically becomes a trackable lead in HouseFinder.
**Current focus:** Phase 5 — Voice Lead Pipeline

## Current Position

Phase: 5 of 5 (Voice Lead Pipeline)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-04-07 — Phase 4 complete (Analytics & SEO)

Progress: [████████░░] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 04 P01 | 2 | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Setup: Stay on GoDaddy DNS (A/CNAME records only) — no nameserver transfer to avoid breaking email MX records during domain setup
- Setup: Dual-submit form (Netlify Forms first, then fire-and-forget to HouseFinder API proxy) — Netlify as spam filter and backup; API key kept server-side
- Setup: Use Zoho Mail free plan for custom email — covers 5 users, 5 GB, 1 domain; verify availability at signup
- 03-01: Use x-api-key header (not Authorization: Bearer) for server-to-server auth — simpler parsing, no token type handling
- 03-01: Store contact details in leadNotes as structured plain text matching existing note pattern
- 03-01: propertyId stays nullable+unique — website leads have no scraper-matched property, uniqueness preserved for scraped leads
- 03-01: WEBSITE_LEAD_API_KEY must be set in Azure App Service Configuration before endpoint can authenticate requests
- 03-02: POST target changed to "/__forms.html" (not "/") — required for Netlify Forms to capture JS-submitted form data
- 03-02: HouseFinder fetch is fire-and-forget with .catch() — user success gated only on Netlify response
- 03-02: HOUSEFINDER_API_KEY kept server-side (no NEXT_PUBLIC_) — invisible in browser DevTools
- [Phase 04]: Use @next/third-parties GoogleAnalytics component for GA4 (official integration)
- [Phase 04]: GA4 gated on NEXT_PUBLIC_GA_ID + production NODE_ENV — no tracking in dev/preview
- [Phase 04]: LLC address placeholders used in JSON-LD — user to supply address when available

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3: HouseFinder `propertyId` nullability unknown — must audit Drizzle schema before building endpoint; if NOT NULL a migration is required
- Phase 3: API key header format discrepancy between research docs (Authorization: Bearer vs x-api-key) — must decide before writing any code
- Phase 3: Azure App Service portal CORS settings may conflict silently with code-level CORS — check portal before adding OPTIONS handler

## Session Continuity

Last session: 2026-04-07
Stopped at: Phase 4 complete — GA4 (G-33FK8CFR8D), GSC verified, sitemap submitted, structured data live, GBP created under admin@no-bshomes.com (pending postcard). Ready for Phase 5 (Voice Lead Pipeline).
Resume file: None
