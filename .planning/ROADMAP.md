# Roadmap: No BS Homes

## Overview

Phases 1-3 (v1.0) wired the marketing site to production infrastructure: custom domain, email, and lead integration. Phases 4-5 (v1.1) add analytics/SEO visibility and a voicemail-to-lead pipeline.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Custom Domain** - Point no-bshomes.com at Netlify and update site-wide contact text
- [x] **Phase 2: Custom Email** - Provision custom email addresses with full deliverability authentication
- [x] **Phase 3: Lead Integration** - Build HouseFinder API endpoint and wire dual-submit contact form
- [x] **Phase 4: Analytics & SEO** - GA4, Google Search Console, sitemap, structured data, Google Business Profile
- [ ] **Phase 5: Voice Lead Pipeline** - Google Voice voicemail transcription → HouseFinder lead automation

## Phase Details

### Phase 1: Custom Domain
**Goal**: The site is live on the custom domain and contact info reflects the real business details
**Depends on**: Nothing (first phase)
**Requirements**: DOM-01, DOM-02, DOM-03, CONT-01, CONT-02
**Success Criteria** (what must be TRUE):
  1. Visiting https://no-bshomes.com loads the site with a valid HTTPS padlock
  2. Visiting https://www.no-bshomes.com loads the site (redirects or serves correctly)
  3. The old nobshomes.netlify.app URL still loads the site without error
  4. The phone number 435-250-3678 appears site-wide wherever contact info is shown
  5. The email contact@no-bshomes.com appears site-wide wherever contact info is shown
**Plans**: 1 plan
Plans:
- [x] 01-01-PLAN.md — Configure GoDaddy DNS, register custom domain in Netlify, deploy, and verify

### Phase 2: Custom Email
**Goal**: The team can send and receive email from @no-bshomes.com addresses that land in inboxes, not spam
**Depends on**: Phase 1
**Requirements**: EMAIL-01, EMAIL-02, EMAIL-03, EMAIL-04, EMAIL-05
**Success Criteria** (what must be TRUE):
  1. A test email sent to contact@no-bshomes.com arrives in the correct inbox
  2. A test email sent to brian@no-bshomes.com arrives in the correct inbox
  3. A test email sent to shawn@no-bshomes.com arrives in the correct inbox
  4. MXToolbox confirms SPF, DKIM, and DMARC all pass for the domain
  5. A test email from a @no-bshomes.com address arrives in a Gmail inbox (not spam folder)
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — Email configured via Google Workspace (not Zoho) with MX/SPF/DKIM/DMARC
- [x] 02-02-PLAN.md — All email requirements verified: deliverability confirmed

### Phase 3: Lead Integration
**Goal**: Every contact form submission becomes a trackable lead in HouseFinder with source "Website"
**Depends on**: Phase 1
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07
**Success Criteria** (what must be TRUE):
  1. Submitting the contact form creates a lead record in the HouseFinder dashboard with a "Website" source badge
  2. The lead appears in HouseFinder within seconds of form submission
  3. Submitting the form shows the user a success state even if HouseFinder is temporarily unreachable
  4. The HouseFinder API key is not visible in browser network requests or the client bundle
**Plans**: 2 plans
Plans:
- [x] 03-01-PLAN.md — HouseFinder: Drizzle migration (nullable propertyId) + POST /api/leads endpoint with Zod validation and x-api-key auth
- [x] 03-02-PLAN.md — No BS Homes: Netlify shadow form, server-side proxy route, and dual-submit ContactForm update

### Phase 4: Analytics & SEO
**Goal**: Site is tracked in GA4 with form conversion events, verified in GSC with sitemap, has structured data for local SEO, and Google Business Profile is claimed
**Depends on**: Phase 1
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, SEO-06
**Success Criteria** (what must be TRUE):
  1. GA4 real-time dashboard shows pageviews when visiting no-bshomes.com
  2. Form submission fires a GA4 conversion event
  3. Google Search Console shows no-bshomes.com as a verified property
  4. /sitemap.xml returns valid XML with all site pages
  5. Google Rich Results Test shows valid LocalBusiness structured data
  6. Google Business Profile is created and pending/verified
**Plans**: 2 plans
Plans:
- [x] 04-01-PLAN.md — GA4 analytics, form conversion tracking, sitemap, robots.txt, and structured data (JSON-LD)
- [x] 04-02-PLAN.md — GA4 property setup, GSC verification, GBP creation (manual checkpoints)

### Phase 5: Voice Lead Pipeline
**Goal**: Voicemails left on 435-250-3678 automatically create leads in HouseFinder with source "voicemail"
**Depends on**: Phase 3
**Requirements**: VM-01, VM-02, VM-03, VM-04
**Success Criteria** (what must be TRUE):
  1. A voicemail left on 435-250-3678 creates a lead in HouseFinder within 5 minutes
  2. The lead has the caller's phone number and voicemail transcription text
  3. The lead appears in HouseFinder dashboard with "Voicemail" source badge
  4. Pipeline handles garbled transcriptions gracefully (phone number always captured)
**Plans**: 3 plans
Plans:
- [ ] 05-01-PLAN.md — HouseFinder API: accept optional source field, make name/address optional for voicemail leads
- [ ] 05-02-PLAN.md — Google Apps Script: Gmail monitor, email parsing, API POST with label-based deduplication
- [ ] 05-03-PLAN.md — End-to-end verification: test voicemail creates lead with Voicemail badge

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Custom Domain | 1/1 | Complete | 2026-04-05 |
| 2. Custom Email | 2/2 | Complete | 2026-04-05 |
| 3. Lead Integration | 2/2 | Complete ✓ | 2026-04-06 |
| 4. Analytics & SEO | 2/2 | Complete ✓ | 2026-04-07 |
| 5. Voice Lead Pipeline | 0/3 | Not started | - |
