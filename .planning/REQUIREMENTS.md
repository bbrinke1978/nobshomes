# Requirements: No BS Homes

**Defined:** 2026-04-05
**Core Value:** Distressed homeowners can quickly submit their information and get connected to No BS Homes — every form submission automatically becomes a trackable lead in HouseFinder.

## v1 Requirements

Requirements for this milestone. Each maps to roadmap phases.

### Domain

- [x] **DOM-01**: Site loads on https://no-bshomes.com with valid SSL
- [x] **DOM-02**: Site loads on https://www.no-bshomes.com (redirect or serve)
- [x] **DOM-03**: Old nobshomes.netlify.app URL continues to work (Netlify default)

### Email

- [x] **EMAIL-01**: contact@no-bshomes.com receives email
- [x] **EMAIL-02**: brian@no-bshomes.com receives email
- [x] **EMAIL-03**: shawn@no-bshomes.com receives email
- [x] **EMAIL-04**: Email passes SPF, DKIM, and DMARC authentication checks
- [x] **EMAIL-05**: Contact email updated site-wide to contact@no-bshomes.com

### Lead Integration

- [x] **LEAD-01**: HouseFinder exposes POST /api/leads endpoint accepting name, phone, email, address, message
- [x] **LEAD-02**: HouseFinder /api/leads creates a lead record with leadSource: "website"
- [x] **LEAD-03**: HouseFinder /api/leads validates input and returns appropriate error responses
- [x] **LEAD-04**: HouseFinder /api/leads authenticates requests via API key
- [x] **LEAD-05**: No BS Homes form submits to both Netlify Forms and HouseFinder API
- [x] **LEAD-06**: HouseFinder API failure does not block form submission success for the user
- [x] **LEAD-07**: Website lead appears in HouseFinder dashboard with "Website" source badge

### Contact Info

- [x] **CONT-01**: Phone number updated site-wide to 435-250-3678
- [x] **CONT-02**: Email updated site-wide to contact@no-bshomes.com

### Analytics & SEO

- [ ] **SEO-01**: GA4 tracks pageviews on no-bshomes.com (real-time dashboard confirms)
- [ ] **SEO-02**: Form submission fires a GA4 conversion event
- [ ] **SEO-03**: Google Search Console shows no-bshomes.com as verified property
- [ ] **SEO-04**: /sitemap.xml returns valid XML listing all site pages
- [ ] **SEO-05**: Structured data (JSON-LD LocalBusiness/RealEstateAgent) passes Rich Results Test
- [ ] **SEO-06**: Google Business Profile created for No BS Homes

### Voice Lead Pipeline

- [ ] **VM-01**: Google Apps Script monitors Gmail for Google Voice voicemail emails
- [ ] **VM-02**: Script extracts caller phone number and transcription text from voicemail email
- [ ] **VM-03**: Script POSTs lead to HouseFinder /api/leads with leadSource "voicemail"
- [ ] **VM-04**: Voicemail lead appears in HouseFinder dashboard with source badge

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Content & Conversion

- **CONV-01**: Testimonials / social proof section on homepage
- **CONV-02**: Blog / content marketing pages
- **CONV-03**: Property-specific landing pages

### Advanced Lead Features

- **ADV-01**: Email notification to team when new website lead arrives
- **ADV-02**: SMS auto-response to new website leads
- **ADV-03**: Lead form A/B testing

## Out of Scope

| Feature | Reason |
|---------|--------|
| Logo redesign | Deferred per user request |
| User accounts on marketing site | Not needed — form submission only |
| Property search on marketing site | HouseFinder handles that |
| Chatbot / live chat | Adds complexity without conversion benefit for 2-person team |
| Instant property valuation | High complexity, not core to lead capture |
| Mobile app | Web only for now |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOM-01 | Phase 1 | Complete |
| DOM-02 | Phase 1 | Complete |
| DOM-03 | Phase 1 | Complete |
| EMAIL-01 | Phase 2 | Complete |
| EMAIL-02 | Phase 2 | Complete |
| EMAIL-03 | Phase 2 | Complete |
| EMAIL-04 | Phase 2 | Complete |
| EMAIL-05 | Phase 2 | Complete |
| LEAD-01 | Phase 3 | Complete |
| LEAD-02 | Phase 3 | Complete |
| LEAD-03 | Phase 3 | Complete |
| LEAD-04 | Phase 3 | Complete |
| LEAD-05 | Phase 3 | Complete |
| LEAD-06 | Phase 3 | Complete |
| LEAD-07 | Phase 3 | Complete |
| CONT-01 | Phase 1 | Complete |
| CONT-02 | Phase 1 | Complete |

| SEO-01 | Phase 4 | Pending |
| SEO-02 | Phase 4 | Pending |
| SEO-03 | Phase 4 | Pending |
| SEO-04 | Phase 4 | Pending |
| SEO-05 | Phase 4 | Pending |
| SEO-06 | Phase 4 | Pending |
| VM-01 | Phase 5 | Pending |
| VM-02 | Phase 5 | Pending |
| VM-03 | Phase 5 | Pending |
| VM-04 | Phase 5 | Pending |

**Coverage:**
- v1.0 requirements: 17 total (all complete)
- v1.1 requirements: 10 total (0 complete)
- Mapped to phases: 27
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-05*
*Last updated: 2026-04-07 after v1.1 milestone phases added*
