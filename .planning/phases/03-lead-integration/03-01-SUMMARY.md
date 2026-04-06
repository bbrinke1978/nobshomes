---
phase: 03-lead-integration
plan: 01
subsystem: api
tags: [drizzle, postgresql, zod, next.js, api-routes, lead-ingest]

# Dependency graph
requires:
  - phase: 03-lead-integration
    provides: HouseFinder database schema and existing leads/leadNotes tables
provides:
  - POST /api/leads endpoint in HouseFinder for external website lead ingest
  - drizzle/0007 migration making leads.propertyId nullable
  - x-api-key authentication pattern for server-to-server calls
affects: [03-02-nobshomes-form, 03-03-lead-integration]

# Tech tracking
tech-stack:
  added: []
  patterns: [x-api-key header auth for server-to-server API calls, Zod v4 validation in Next.js App Router route handlers, nullable FK for leads without a scraper-matched property]

key-files:
  created:
    - housefinder/app/src/app/api/leads/route.ts
    - housefinder/app/drizzle/0007_nullable_lead_property_id.sql
  modified:
    - housefinder/app/src/db/schema.ts

key-decisions:
  - "Use x-api-key header (not Authorization: Bearer) — simpler for server-to-server, no token type parsing needed"
  - "Store contact details in leadNotes as structured plain text (Name/Phone/Address/Message) rather than separate columns — consistent with existing note pattern"
  - "propertyId stays nullable+unique — website leads have no scraper-matched property but uniqueness constraint preserved for scraping-originated leads"
  - "WEBSITE_LEAD_API_KEY must be set in Azure App Service Configuration before endpoint can authenticate requests"

patterns-established:
  - "Server-to-server API auth: x-api-key header vs process.env.WEBSITE_LEAD_API_KEY"
  - "Zod import: use zod/v4 not zod in HouseFinder codebase"
  - "Website leads: propertyId=null, leadSource='website', contact details in leadNotes"

requirements-completed: [LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-07]

# Metrics
duration: 3min
completed: 2026-04-06
---

# Phase 03 Plan 01: HouseFinder Lead Ingest Endpoint Summary

**POST /api/leads endpoint with x-api-key auth and Zod validation inserts a leads row (propertyId: null, leadSource: 'website') plus structured leadNotes row from website form submissions**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-06T02:51:39Z
- **Completed:** 2026-04-06T02:54:34Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Made `leads.propertyId` nullable in Drizzle schema and created migration SQL ready to apply
- Created POST /api/leads with x-api-key auth, Zod WebLeadSchema validation, dual-insert (leads + leadNotes), and CORS/OPTIONS preflight
- TypeScript compiles cleanly for all new files (one pre-existing unrelated error in enrollment-actions.ts deferred)

## Task Commits

Each task was committed atomically:

1. **Task 1: Drizzle migration — make propertyId nullable** - `387a857` (feat)
2. **Task 2: POST /api/leads route handler with Zod validation and x-api-key auth** - `69da66c` (feat)

**Plan metadata:** (docs commit to follow)

## Files Created/Modified
- `housefinder/app/src/db/schema.ts` - Removed `.notNull()` from leads.propertyId
- `housefinder/app/drizzle/0007_nullable_lead_property_id.sql` - ALTER TABLE migration to drop NOT NULL constraint
- `housefinder/app/src/app/api/leads/route.ts` - POST endpoint with auth, validation, DB insert, CORS

## Decisions Made
- Used x-api-key header over Authorization: Bearer — simpler parsing for server-to-server calls, no token type handling needed
- Contact details stored in leadNotes as structured plain text matching existing note pattern in HouseFinder dashboard
- propertyId kept as unique (not dropped) so existing scraping-originated leads remain constrained; only nullability removed
- Email field accepted in request body and logged in note for forward compatibility (LEAD-01) even though not yet used

## Deviations from Plan

None - plan executed exactly as written.

One pre-existing TypeScript error found in `src/lib/enrollment-actions.ts` (line 61) related to `owner_contacts.property_id` — out of scope, logged as deferred.

## Issues Encountered
- Pre-existing TS error in `enrollment-actions.ts` (TS2769) unrelated to this plan's changes — deferred, not fixed.

## User Setup Required

Before the endpoint can authenticate requests:

1. Generate API key: `openssl rand -hex 32`
2. Set in Azure Portal: App Service > Configuration > Application settings > `WEBSITE_LEAD_API_KEY`
3. The migration SQL must also be applied: run `npx drizzle-kit push` against production DATABASE_URL or apply `drizzle/0007_nullable_lead_property_id.sql` manually via psql/Azure Data Studio

Verification after setup:
```bash
curl -X POST https://housefinder-app.azurewebsites.net/api/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY_HERE" \
  -d '{"name":"Test User","phone":"435-555-1234","address":"123 Main St, Price, UT","message":"Test submission"}'
# Expected: {"ok":true,"leadId":"<uuid>"}
```

## Next Phase Readiness
- HouseFinder endpoint ready to receive POST requests once WEBSITE_LEAD_API_KEY is set and migration applied
- Next: Build No BS Homes contact form submission that fires to this endpoint (03-02)
- Blocker: WEBSITE_LEAD_API_KEY must be set in Azure before end-to-end testing

---
*Phase: 03-lead-integration*
*Completed: 2026-04-06*
