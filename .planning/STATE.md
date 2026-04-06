# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-05)

**Core value:** Distressed homeowners can quickly submit their information and get connected to No BS Homes — every form submission automatically becomes a trackable lead in HouseFinder.
**Current focus:** Phase 3 — Lead Integration

## Current Position

Phase: 3 of 3 (Lead Integration)
Plan: 1 of TBD in current phase
Status: In progress
Last activity: 2026-04-06 — 03-01 complete (HouseFinder Lead Ingest Endpoint)

Progress: [███████░░░] 70%

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

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3: HouseFinder `propertyId` nullability unknown — must audit Drizzle schema before building endpoint; if NOT NULL a migration is required
- Phase 3: API key header format discrepancy between research docs (Authorization: Bearer vs x-api-key) — must decide before writing any code
- Phase 3: Azure App Service portal CORS settings may conflict silently with code-level CORS — check portal before adding OPTIONS handler

## Session Continuity

Last session: 2026-04-06
Stopped at: Completed 03-01-PLAN.md (HouseFinder Lead Ingest Endpoint) — ready for 03-02 (No BS Homes form submission)
Resume file: None
