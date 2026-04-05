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

- [ ] **EMAIL-01**: contact@no-bshomes.com receives email
- [ ] **EMAIL-02**: brian@no-bshomes.com receives email
- [ ] **EMAIL-03**: shawn@no-bshomes.com receives email
- [ ] **EMAIL-04**: Email passes SPF, DKIM, and DMARC authentication checks
- [ ] **EMAIL-05**: Contact email updated site-wide to contact@no-bshomes.com

### Lead Integration

- [ ] **LEAD-01**: HouseFinder exposes POST /api/leads endpoint accepting name, phone, email, address, message
- [ ] **LEAD-02**: HouseFinder /api/leads creates a lead record with leadSource: "website"
- [ ] **LEAD-03**: HouseFinder /api/leads validates input and returns appropriate error responses
- [ ] **LEAD-04**: HouseFinder /api/leads authenticates requests via API key
- [ ] **LEAD-05**: No BS Homes form submits to both Netlify Forms and HouseFinder API
- [ ] **LEAD-06**: HouseFinder API failure does not block form submission success for the user
- [ ] **LEAD-07**: Website lead appears in HouseFinder dashboard with "Website" source badge

### Contact Info

- [x] **CONT-01**: Phone number updated site-wide to 435-250-3678
- [x] **CONT-02**: Email updated site-wide to contact@no-bshomes.com

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Content & Conversion

- **CONV-01**: Testimonials / social proof section on homepage
- **CONV-02**: Blog / content marketing pages
- **CONV-03**: Property-specific landing pages
- **CONV-04**: Google Analytics / conversion tracking

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
| EMAIL-01 | Phase 2 | Pending |
| EMAIL-02 | Phase 2 | Pending |
| EMAIL-03 | Phase 2 | Pending |
| EMAIL-04 | Phase 2 | Pending |
| EMAIL-05 | Phase 2 | Pending |
| LEAD-01 | Phase 3 | Pending |
| LEAD-02 | Phase 3 | Pending |
| LEAD-03 | Phase 3 | Pending |
| LEAD-04 | Phase 3 | Pending |
| LEAD-05 | Phase 3 | Pending |
| LEAD-06 | Phase 3 | Pending |
| LEAD-07 | Phase 3 | Pending |
| CONT-01 | Phase 1 | Complete |
| CONT-02 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-05*
*Last updated: 2026-04-05 after initial definition*
