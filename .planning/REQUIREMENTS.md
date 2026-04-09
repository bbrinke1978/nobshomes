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

- [x] **SEO-01**: GA4 tracks pageviews on no-bshomes.com (real-time dashboard confirms)
- [x] **SEO-02**: Form submission fires a GA4 conversion event
- [x] **SEO-03**: Google Search Console shows no-bshomes.com as verified property
- [x] **SEO-04**: /sitemap.xml returns valid XML listing all site pages
- [x] **SEO-05**: Structured data (JSON-LD LocalBusiness/RealEstateAgent) passes Rich Results Test
- [x] **SEO-06**: Google Business Profile created for No BS Homes (pending postcard verification)

### Voice Lead Pipeline

- [x] **VM-01**: Google Apps Script monitors Gmail for Google Voice voicemail emails
- [x] **VM-02**: Script extracts caller phone number and transcription text from voicemail email
- [x] **VM-03**: Script POSTs lead to HouseFinder /api/leads with leadSource "voicemail"
- [x] **VM-04**: Voicemail lead appears in HouseFinder dashboard with source badge

### Content & Gallery

- [x] **CONTENT-01**: Homepage has testimonials section with placeholder cards
- [x] **CONTENT-02**: /blog route lists blog posts with titles, dates, and excerpts
- [x] **CONTENT-03**: Blog posts render from local markdown files (no external CMS)
- [x] **CONTENT-04**: /gallery route displays responsive image grid of past projects
- [x] **CONTENT-05**: Gallery images loadable by adding files to public/images/gallery/
- [x] **CONTENT-06**: Header navigation includes Blog and Gallery links

### Admin Portal

- [x] **ADMIN-01**: /admin requires Google OAuth login — unauthenticated users redirected
- [x] **ADMIN-02**: Only allowlisted @no-bshomes.com emails (brian, shawn, admin) can access admin
- [x] **ADMIN-03**: Admin can drag-and-drop upload gallery images to Azure Blob Storage
- [x] **ADMIN-04**: Admin can manage gallery images (add, reorder, delete, edit captions)
- [x] **ADMIN-05**: Admin can create and edit blog posts with rich text editor
- [x] **ADMIN-06**: Admin can delete blog posts
- [x] **ADMIN-07**: Admin can add, edit, and delete testimonials
- [x] **ADMIN-08**: Public gallery, blog, and testimonials pages render from database
- [x] **ADMIN-09**: Database tables (gallery_images, blog_posts, testimonials) in HouseFinder PostgreSQL
- [x] **ADMIN-10**: Images served from Azure Blob Storage URLs with optimization

## v2 Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Content & Conversion
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

| SEO-01 | Phase 4 | Complete |
| SEO-02 | Phase 4 | Complete |
| SEO-03 | Phase 4 | Complete |
| SEO-04 | Phase 4 | Complete |
| SEO-05 | Phase 4 | Complete |
| SEO-06 | Phase 4 | Complete |
| VM-01 | Phase 5 | Complete |
| VM-02 | Phase 5 | Complete |
| VM-03 | Phase 5 | Complete |
| VM-04 | Phase 5 | Complete |
| CONTENT-01 | Phase 6 | Complete |
| CONTENT-02 | Phase 6 | Complete |
| CONTENT-03 | Phase 6 | Complete |
| CONTENT-04 | Phase 6 | Complete |
| CONTENT-05 | Phase 6 | Complete |
| CONTENT-06 | Phase 6 | Complete |
| ADMIN-01 | Phase 7 | Complete |
| ADMIN-02 | Phase 7 | Complete |
| ADMIN-03 | Phase 7 | Complete |
| ADMIN-04 | Phase 7 | Complete |
| ADMIN-05 | Phase 7 | Complete |
| ADMIN-06 | Phase 7 | Complete |
| ADMIN-07 | Phase 7 | Complete |
| ADMIN-08 | Phase 7 | Complete |
| ADMIN-09 | Phase 7 | Complete |
| ADMIN-10 | Phase 7 | Complete |

**Coverage:**
- v1.0 requirements: 17 total (all complete)
- v1.1 requirements: 10 total (0 complete)
- Mapped to phases: 27
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-05*
*Last updated: 2026-04-07 after v1.1 milestone phases added*
