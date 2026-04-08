---
phase: 04-analytics-seo
plan: "01"
subsystem: analytics-seo
tags: [ga4, seo, structured-data, sitemap, robots, json-ld]
dependency_graph:
  requires: []
  provides: [ga4-tracking, lead-conversion-event, sitemap, robots-txt, structured-data]
  affects: [src/app/layout.tsx, src/components/ContactForm.tsx, src/app/faq/page.tsx]
tech_stack:
  added: ["@next/third-parties"]
  patterns: [GoogleAnalytics-component, sendGAEvent, MetadataRoute-sitemap, MetadataRoute-robots, JSON-LD-script-tag]
key_files:
  created:
    - src/app/sitemap.ts
    - src/app/robots.ts
  modified:
    - src/app/layout.tsx
    - src/components/ContactForm.tsx
    - src/app/faq/page.tsx
decisions:
  - "Use @next/third-parties GoogleAnalytics component (official Next.js integration) over manual gtag script"
  - "GA4 gated on NEXT_PUBLIC_GA_ID env var AND production NODE_ENV — no tracking in dev/preview"
  - "RealEstateAgent JSON-LD injected via next/script afterInteractive in layout head — present on every page"
  - "FAQPage schema uses plain script tag with dangerouslySetInnerHTML — valid in React 19, SSR-rendered for crawlers"
  - "LLC address placeholders (PLACEHOLDER_STREET_ADDRESS, PLACEHOLDER_ZIP) — user to supply LLC address later"
  - "generate_lead event fires after Netlify success check, before HouseFinder fire-and-forget — only real submissions tracked"
metrics:
  duration: "2 minutes"
  completed: "2026-04-08"
  tasks_completed: 2
  files_modified: 5
  commits: 2
---

# Phase 04 Plan 01: Analytics & SEO Summary

GA4 analytics with generate_lead conversion tracking, RealEstateAgent JSON-LD structured data, FAQPage schema, XML sitemap, and robots.txt added to the No BS Homes site using @next/third-parties.

## What Was Built

### Task 1: GA4 Integration, Structured Data, Sitemap, Robots

- Installed `@next/third-parties` (official Next.js GA4 integration)
- Updated `src/app/layout.tsx` with:
  - `GoogleAnalytics` component gated on `NEXT_PUBLIC_GA_ID` env var + production environment
  - `RealEstateAgent` JSON-LD schema (8 areaServed cities, founders Brian & Shawn, placeholder LLC address)
- Created `src/app/sitemap.ts` — returns 4 URLs (`/`, `/about`, `/how-it-works`, `/faq`)
- Created `src/app/robots.ts` — allows all crawlers, references `/sitemap.xml`

**Commits:** `14b420a`

### Task 2: Conversion Event and FAQPage Schema

- Updated `src/components/ContactForm.tsx`:
  - Imports `sendGAEvent` from `@next/third-parties/google`
  - Fires `generate_lead` event with `event_category: 'contact_form'` after successful Netlify submission
- Updated `src/app/faq/page.tsx`:
  - Added `FAQPage` JSON-LD schema built dynamically from the `faqs` array
  - Injected via `<script dangerouslySetInnerHTML>` — SSR-rendered for Google crawlers

**Commits:** `c143eb1`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All checks passed:
- `npm run build` succeeded clean (both tasks)
- `/sitemap.xml` and `/robots.txt` routes confirmed in build output
- `GoogleAnalytics` import + component present in layout.tsx
- `sendGAEvent('event', 'generate_lead', ...)` present in ContactForm.tsx
- `RealEstateAgent` type present in layout.tsx JSON-LD
- `FAQPage` type present in faq/page.tsx

## Pending Actions (Post-Deploy)

1. Set `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` in Netlify environment variables (GA4 measurement ID)
2. Replace `PLACEHOLDER_STREET_ADDRESS` and `PLACEHOLDER_ZIP` in `src/app/layout.tsx` once LLC address is available
3. Submit `https://no-bshomes.com/sitemap.xml` to Google Search Console

## Self-Check: PASSED

All files confirmed present. Both commits (14b420a, c143eb1) verified in git history.
