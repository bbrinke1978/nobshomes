# Roadmap: No BS Homes

## Overview

Three sequential phases that wire an existing marketing site to production-grade infrastructure. Phase 1 points the custom domain at the live Netlify deployment. Phase 2 provisions custom email addresses and updates contact info site-wide. Phase 3 builds the HouseFinder API endpoint and wires the contact form to dual-submit, so every form submission becomes a trackable lead.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Custom Domain** - Point no-bshomes.com at Netlify and update site-wide contact text
- [x] **Phase 2: Custom Email** - Provision custom email addresses with full deliverability authentication
- [ ] **Phase 3: Lead Integration** - Build HouseFinder API endpoint and wire dual-submit contact form

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
- [ ] 02-01-PLAN.md — Set up Zoho Mail account, verify domain, configure DNS records (MX, SPF, DKIM, DMARC), create 3 mailboxes
- [ ] 02-02-PLAN.md — Verify all email requirements: MXToolbox checks, test delivery, deliverability, site contact email

### Phase 3: Lead Integration
**Goal**: Every contact form submission becomes a trackable lead in HouseFinder with source "Website"
**Depends on**: Phase 1
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07
**Success Criteria** (what must be TRUE):
  1. Submitting the contact form creates a lead record in the HouseFinder dashboard with a "Website" source badge
  2. The lead appears in HouseFinder within seconds of form submission
  3. Submitting the form shows the user a success state even if HouseFinder is temporarily unreachable
  4. The HouseFinder API key is not visible in browser network requests or the client bundle
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Custom Domain | 1/1 | Complete ✓ | 2026-04-05 |
| 2. Custom Email | 2/2 | Complete ✓ | 2026-04-05 |
| 3. Lead Integration | 0/TBD | Not started | - |
