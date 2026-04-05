# Feature Research

**Domain:** "We buy houses" / cash home buyer marketing site targeting distressed homeowners
**Researched:** 2026-04-05
**Confidence:** MEDIUM — core UX patterns verified via multiple sources; some conversion-specific claims are WebSearch-only

## Context

No BS Homes is an existing site with a functional foundation (homepage, about, FAQ, how-it-works, contact form). This milestone adds:
1. HouseFinder API lead integration (form submissions create leads in the companion dashboard)
2. Custom domain (no-bshomes.com via GoDaddy → Netlify)
3. Updated contact info site-wide

This research focuses on what the site already does well, what it is missing that hurts lead conversion, and what to avoid building.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that distressed homeowners expect when they land on a "we buy houses" site. Missing these causes immediate trust failure or form abandonment.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Phone number visible in hero/header | Distressed sellers want to call, not type. Urgency is high. | LOW | Already present in hero CTA and footer. Add to sticky header. |
| Click-to-call phone link on mobile | 50%+ traffic is mobile; tapping a number is expected | LOW | `href="tel:..."` already implemented via `contactData.phoneHref` |
| Property address field in form | Required to create a meaningful lead; sellers expect to provide it | LOW | Already in form |
| Name + phone as required fields | Industry minimum — name and phone are non-negotiable for follow-up | LOW | Already required in form |
| Clear "no fees / no obligation" reassurance near form | Sellers fear hidden catches; this objection must be pre-handled on the form itself | LOW | Already present ("No obligation. No fees. Just a fair offer.") |
| Privacy statement on form | Sellers sharing home address are cautious about data | LOW | Present as "Your information is private. We never share or sell your data." |
| Form success confirmation | Without it, sellers resubmit or call unsure if it worked | LOW | Implemented with CheckCircle success state |
| Situation list ("we help with X") | Sellers self-identify — seeing "foreclosure" or "tax liens" listed signals relevance | LOW | Already on homepage (8 situations checklist) |
| How It Works process | Sellers need to know what happens next before they submit | LOW | Exists as standalone page and homepage preview |
| Mobile-responsive layout | Distressed sellers search on phones, often in urgent moments | LOW | Tailwind responsive design already in place |
| Error handling on form | Form failure with no message = lead lost | LOW | Error state present but currently redirects to "call us instead" |
| Spam protection | Without it, form submissions become noise in HouseFinder | LOW | Netlify honeypot already implemented |
| Dual submission (Netlify + API) | Backup if API fails; Netlify catches what API misses | MEDIUM | NOT yet implemented — this is the core milestone deliverable |
| Lead source tagging | HouseFinder needs to know this lead came from the website | LOW | HouseFinder schema supports `leadSource: "website"` — must be passed in POST body |

### Differentiators (Competitive Advantage)

Features that are not universally present on "we buy houses" sites but meaningfully improve conversion or trust for No BS Homes specifically.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Named, local founders (Brian & Shawn) | Generic template sites feel scammy; named real people reduce fear. Sellers deal with personal crises and want a human. | LOW | About page exists. Faces/names should appear on homepage or near the form. |
| Utah-specific geographic identity | "Utah's Trusted Home Buyers" signals local expertise, not a national lead-gen mill | LOW | Already in hero badge. Lean into this — mention Price, UT; Carbon/Emery counties if relevant. |
| "The Best Last Option" honest positioning | Counterintuitively, admitting you're a last resort builds trust — it's honest and disarms price objections | LOW | Already in H1. This is a real differentiator. Keep it. |
| Situation-specific empathy copy | Sellers in foreclosure vs. probate vs. divorce have different fears. Matching their exact situation in copy converts better than generic "we help everyone." | MEDIUM | FAQ page covers some situations. Consider situation-specific landing pages as a later enhancement (not this milestone). |
| 24-hour response time commitment | Distressed sellers are time-sensitive. An explicit promise converts skeptics. | LOW | Already in success message ("within 24 hours"). Move this commitment ABOVE the form, not just after submission. |
| Lead confirmation email to seller | Seller gets immediate proof their submission was received — reduces anxiety and cancels "did it work?" calls | MEDIUM | Requires email send from HouseFinder or a Netlify Forms integration. Not in current milestone scope but high value. |
| Preferred contact method field | Some sellers fear phone calls during work hours; offering text or email preference captures more leads who would otherwise abandon | LOW | Not in current form. Adding a "Best way to reach you" select (Phone call / Text / Email) is low complexity and high value. |
| Specific service area clarity | Sellers outside Utah abandon immediately if geography is unclear. Saves both parties time. | LOW | "Utah" is in the badge. Could be more specific (Carbon County, San Juan County, etc.) |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas but create real problems for a small operator at this stage.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Instant automated offer/valuation | Sellers want a number immediately | No BS Homes cannot accurately value properties automatically. Fake estimates destroy trust and waste follow-up time on leads with anchored wrong prices. | Keep "fair cash offer within 24 hours" — the commitment is the value, not the automation. |
| Live chat / chatbot | "Always on" appeal; mimics big companies | Adds complexity, requires monitoring 24/7 or exposes a bot that frustrates distressed sellers in emotional moments. Brian and Shawn can't staff this without a major time commitment. | Click-to-call and the form are sufficient for a two-person operation. |
| Blog / content marketing CMS | SEO value long-term | Wrong milestone. CMS adds infrastructure complexity (headless CMS, authoring workflow) and content takes months to rank. Distraction from lead capture goal. | Defer entirely. Focus on conversion, not acquisition. |
| User accounts / login | "Save your submission" or "track your offer" | No homeowner returns to check a submission status. They expect a phone call. Accounts add auth complexity for zero conversion benefit at this audience size. | Explicitly out of scope per PROJECT.md. |
| Property search / listings | Users expect it because Zillow has it | No BS Homes buys houses — it does not list them. Sellers are not browsing listings. HouseFinder handles the operational side. | Remove any implication that sellers can browse properties. Keep copy seller-focused. |
| Review aggregation widget (Google/Yelp) | Social proof is valuable | No BS Homes is new and may have few reviews. An empty or sparse widget signals low activity, which hurts trust more than no widget. | Use testimonials written directly on site (controlled, human-feeling) until review volume is sufficient. |
| Multi-step form wizard | Higher perceived completion rates | Adds JavaScript complexity, increases failure surface area, and delays the form post to HouseFinder API. For a 4-field form, single-page is lower friction. | Current single-page form is correct for this field count. Add preferred contact method field instead of adding steps. |
| Exit-intent popups | Capture abandoning visitors | Invasive and anxiety-inducing for already-stressed distressed homeowners. Signals desperation, not trustworthiness. | Better form copy and above-the-fold trust signals reduce abandonment without harassment. |
| SMS/text autoresponder | Speed of follow-up matters | Requires Twilio or similar, adds cost and complexity, and automated texts to distressed homeowners can feel predatory. Regulatory risk (TCPA). | Brian or Shawn calling back quickly is more effective and legally simpler at this scale. |

---

## Feature Dependencies

```
Custom Domain (no-bshomes.com)
    └──required by──> Contact info update (email addresses need domain to exist)
    └──required by──> HouseFinder API CORS config (API must allow requests from no-bshomes.com)

HouseFinder API endpoint (/api/leads POST)
    └──required by──> Dual form submission (marketing site cannot POST without the endpoint existing)
    └──required by──> Lead source tagging (endpoint must accept leadSource field)

Dual form submission (Netlify + HouseFinder API)
    └──enhances──> Preferred contact method field (new field flows through to API payload)
    └──requires──> Error handling for API failure (form must succeed even if API is down)

Contact info update (phone, email)
    └──required by──> Custom domain emails working (brian@, shawn@, contact@no-bshomes.com)
```

### Dependency Notes

- **Custom domain must exist before contact info update:** The no-bshomes.com email addresses cannot be set up until the domain is pointed to Netlify and email routing is configured.
- **HouseFinder API endpoint must exist before dual submission:** The marketing site form cannot POST leads until HouseFinder exposes `/api/leads` with authentication.
- **CORS configuration is a hidden dependency:** HouseFinder's API must explicitly allow cross-origin requests from `https://no-bshomes.com` and `https://www.no-bshomes.com`. This is easy to miss and will silently fail in production.
- **Netlify Forms as fallback is architecturally correct:** If the HouseFinder API call fails, the Netlify form submission should still succeed. This means the API call must be non-blocking (fire-and-forget with error logging, not a hard dependency).

---

## MVP Definition

### Launch With (v1 — this milestone)

Minimum to make the milestone complete.

- [x] Custom domain configured (GoDaddy DNS → Netlify) — domain works, HTTPS active
- [x] Contact info updated site-wide (phone: 435-250-3678, email: contact@no-bshomes.com)
- [ ] HouseFinder API endpoint at `/api/leads` accepting POST with `leadSource: "website"`
- [ ] Form dual-submits: Netlify Forms (spam filter/backup) + HouseFinder API (lead creation)
- [ ] API failure is graceful: Netlify submission succeeds even if HouseFinder API is unreachable
- [ ] Custom domain emails working (brian@, shawn@, contact@no-bshomes.com)

### Add After Validation (v1.x)

Add once leads are flowing and working.

- [ ] Preferred contact method field (Phone / Text / Email) — feeds into HouseFinder lead record
- [ ] Move "24-hour response" commitment above the form, not just in success message
- [ ] Founder names/faces near the form (not just on About page) — "You'll hear from Brian or Shawn"
- [ ] Situation-specific copy variants (even if just anchor links to FAQ sections per situation)

### Future Consideration (v2+)

Defer until proven need.

- [ ] Lead confirmation email to seller — requires email infrastructure on HouseFinder side
- [ ] Google Reviews widget — only when review volume is sufficient (10+ reviews)
- [ ] Situation-specific landing pages (e.g., /foreclosure, /probate) for SEO
- [ ] Blog / content marketing — wrong priority until lead flow is established

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| HouseFinder API endpoint (server-side) | HIGH | MEDIUM | P1 |
| Dual form submission (client-side) | HIGH | LOW | P1 |
| Custom domain DNS config | HIGH | LOW | P1 |
| Contact info update site-wide | HIGH | LOW | P1 |
| Custom domain email routing | HIGH | LOW | P1 |
| CORS configuration on HouseFinder | HIGH | LOW | P1 |
| Graceful API failure handling | HIGH | LOW | P1 |
| Preferred contact method field | MEDIUM | LOW | P2 |
| 24hr commitment above form | MEDIUM | LOW | P2 |
| Founder proximity to form | MEDIUM | LOW | P2 |
| Lead confirmation email | HIGH | HIGH | P3 |
| Situation-specific landing pages | MEDIUM | HIGH | P3 |
| Google Reviews widget | LOW | LOW | P3 (wait for reviews) |

**Priority key:**
- P1: Must have for milestone completion
- P2: Should have, add when core is working
- P3: Nice to have, future milestone

---

## Competitor Feature Analysis

Representative "we buy houses" sites in small/mid-market (not iBuyer giants like Opendoor).

| Feature | Typical Competitor | No BS Homes Current | No BS Homes Target |
|---------|-------------------|---------------------|-------------------|
| Phone in sticky header | Common | Phone in hero only | Add to sticky header |
| Form in hero section | Universal | Yes | Keep |
| Named founders/team | 30-40% of local operators | Yes (About page) | Bring closer to form |
| Situation checklist | Common | Yes (8 situations) | Keep |
| "No fees" promise near form | Universal | Yes | Keep |
| Privacy notice on form | Common | Yes | Keep |
| 3-step or 4-step process | Universal | Yes (How It Works) | Keep |
| Click-to-call on mobile | Universal | Yes | Keep |
| Testimonials with real names | High-converting sites | None | P2 — add when available |
| Lead source tagging to CRM | Small operators rare | Not yet | This milestone (HouseFinder) |
| API-backed lead creation | Rare for local operators | Not yet | This milestone |

---

## Sources

- [GrumpyHare: Motivated Seller Mindset for High-Converting Real Estate Websites](https://grumpyhare.com/understanding-the-motivated-sellers-mindset-for-high-converting-real-estate-websites/)
- [Distressed Seller Leads: How to Consistently Find Motivated Homeowners — USLeadList](https://usleadlist.com/resources/distressed-seller-leads)
- [Motivated Seller Leads 2026 — iSpeedToLead](https://ispeedtolead.com/blog/motivated-seller-leads-2026/)
- [Real Estate CRO — Xpezia](https://www.xpezia.com/blog/conversion-rate-optimization-for-real-estate-a-tactical-guide/)
- [65+ Real Estate CTAs That Convert — Propphy](https://www.propphy.com/blog/real-estate-cta-examples-that-convert)
- [Real Estate Lead Form Template — Formware](https://formware.io/templates/real-estate-lead-form-template/)
- [How to Increase Real Estate Conversion Rate — WiserNotify](https://wisernotify.com/blog/increase-real-estate-conversion-rate/)
- [7 Lead-Gen Strategies 2026 — Inman](https://www.inman.com/2026/01/18/7-lead-gen-strategies-to-ignite-your-real-estate-business-in-2026/)
- [Real Estate API Integration Best Practices — Homesage.ai](https://homesage.ai/8-best-real-estate-apis-implementation-practices/)
- [Cash For Houses Scams: How Sellers Evaluate Legitimacy — SoCal Home Buyers](https://socalhomebuyers.com/how-to-spot-avoid-scam-we-buy-homes-companies/)
- [How Real Estate APIs Integrate With CRM Systems 2026 — Homesage.ai](https://homesage.ai/how-to-integrate-real-estate-apis-with-crm-systems-2026/)

---
*Feature research for: No BS Homes — cash home buyer marketing site*
*Researched: 2026-04-05*
