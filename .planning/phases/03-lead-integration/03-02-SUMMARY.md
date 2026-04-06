---
phase: 03-lead-integration
plan: "02"
subsystem: api
tags: [netlify-forms, next-api-routes, form-submission, lead-integration, housefinder]

# Dependency graph
requires:
  - phase: 03-lead-integration/03-01
    provides: HouseFinder /api/leads endpoint with x-api-key auth

provides:
  - Netlify shadow form file (public/__forms.html) for build-time form discovery
  - Server-side proxy route (src/app/api/submit-lead/route.ts) that forwards leads to HouseFinder with API key kept server-side
  - Updated ContactForm with dual-submit: awaited Netlify Forms POST then fire-and-forget HouseFinder call

affects: [deploy, netlify-env-vars, azure-env-vars, housefinder-leads]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Fire-and-forget side-effect pattern: secondary fetch with .catch(() => {}) never blocks primary UX
    - Server-side secret proxy: env vars without NEXT_PUBLIC_ prefix stay off client bundle and network tab
    - Netlify shadow form: static HTML file in public/ for build scanner to discover dynamic JS forms

key-files:
  created:
    - public/__forms.html
    - src/app/api/submit-lead/route.ts
  modified:
    - src/components/ContactForm.tsx

key-decisions:
  - "POST target changed from '/' to '/__forms.html' — Netlify Forms requires the static shadow form URL as submission target, not the page root"
  - "HouseFinder fetch is fire-and-forget with .catch() — user success is gated only on Netlify response; HouseFinder downtime is invisible to user"
  - "HOUSEFINDER_API_KEY kept in process.env (no NEXT_PUBLIC_) — never exposed in browser network requests or JS bundle"

patterns-established:
  - "Dual-submit pattern: await primary (user-facing) fetch, then fire-and-forget secondary fetch for CRM/backend side-effects"
  - "Shadow form pattern: public/__forms.html mirrors dynamic React form fields for Netlify build-time scanner"

requirements-completed: [LEAD-05, LEAD-06]

# Metrics
duration: 12min
completed: 2026-04-05
---

# Phase 3 Plan 02: Lead Integration (Form Submission) Summary

**Dual-submit contact form using Netlify Forms as primary (spam-filtered backup) and fire-and-forget server-side proxy to HouseFinder, with API key kept entirely server-side**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-05T18:57:28Z
- **Completed:** 2026-04-05T19:09:00Z
- **Tasks:** 2 auto + 1 checkpoint (human-verify pending)
- **Files modified:** 3

## Accomplishments

- Created `public/__forms.html` shadow form with field names matching ContactForm.tsx so Netlify build scanner registers the form
- Created `src/app/api/submit-lead/route.ts` server-side proxy that reads `HOUSEFINDER_API_URL` and `HOUSEFINDER_API_KEY` from `process.env` and forwards lead data to HouseFinder with `x-api-key` header
- Updated `ContactForm.tsx` to dual-submit: awaited POST to `/__forms.html` (Netlify, user-facing), then fire-and-forget JSON POST to `/api/submit-lead` (HouseFinder, silent on failure)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create shadow form and proxy route** - `fd6570c` (feat)
2. **Task 2: Update ContactForm for dual-submit** - `bb7cc5f` (feat)
3. **Task 3: Verify E2E lead flow** - Checkpoint — awaiting human verification after deploy

**Plan metadata:** (pending final commit after checkpoint resolution)

## Files Created/Modified

- `public/__forms.html` - Static HTML shadow form for Netlify build scanner; mirrors all ContactForm field names including `form-name`
- `src/app/api/submit-lead/route.ts` - Next.js App Router API route that proxies lead data server-side to HouseFinder `/api/leads` with `x-api-key` auth; returns 502 on HouseFinder failure
- `src/components/ContactForm.tsx` - Updated `handleSubmit`: POST target changed from `"/"` to `"/__forms.html"`, added fire-and-forget fetch to `/api/submit-lead`

## Decisions Made

- POST target changed from `"/"` to `"/__forms.html"`: Netlify Forms requires the shadow form URL as the submission target when using JavaScript form handling in a Next.js/SPA context
- HouseFinder fetch is fire-and-forget: user success state is gated only on Netlify response; HouseFinder downtime has zero UX impact
- `HOUSEFINDER_API_KEY` uses no `NEXT_PUBLIC_` prefix: kept entirely server-side, invisible in browser DevTools network tab

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

Before the E2E verification checkpoint will pass, set these environment variables on Netlify:

- `HOUSEFINDER_API_URL` — Azure App Service URL for HouseFinder (e.g., `https://housefinder-app.azurewebsites.net`)
- `HOUSEFINDER_API_KEY` — Same value as `WEBSITE_LEAD_API_KEY` set on Azure in Plan 01

Also ensure on Azure App Service:
- `WEBSITE_LEAD_API_KEY` is set in App Service Configuration
- Drizzle migration from Plan 01 has been applied (makes `propertyId` nullable)

## Next Phase Readiness

- Form submission pipeline is complete end-to-end in code
- Verification (Task 3 checkpoint) requires: Netlify deploy + env vars set + live form test
- After verification: all Phase 3 requirements are met — lead integration is complete
- Resume signal: type "approved" after verifying submissions appear in both Netlify Forms dashboard and HouseFinder dashboard

---
*Phase: 03-lead-integration*
*Completed: 2026-04-05*
