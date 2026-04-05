# Project Research Summary

**Project:** No BS Homes — Lead Integration + Custom Domain Milestone
**Domain:** Cash home buying marketing site — cross-origin API integration, custom DNS, custom email
**Researched:** 2026-04-05
**Confidence:** HIGH (stack, architecture, pitfalls); MEDIUM (features, email provider specifics)

## Executive Summary

No BS Homes is an existing Next.js 15 / React 19 / Tailwind CSS 4 marketing site deployed on Netlify, targeting distressed homeowners in Utah. The current milestone is a tightly scoped integration task: wire the existing contact form to the HouseFinder companion app's lead database via an API, point the `no-bshomes.com` GoDaddy domain at the Netlify deployment, and provision custom email addresses on that domain. No new dependencies are required — all three deliverables use patterns native to the existing stack.

The recommended approach is a dual-submit architecture where the contact form posts to Netlify Forms first (as spam filter and backup capture) and then fires a fire-and-forget POST to a Next.js proxy route handler that forwards leads to HouseFinder's `/api/leads` endpoint using a server-side secret. This keeps the API key out of the browser bundle, ensures no lead data is lost if HouseFinder is temporarily unavailable, and adds zero new packages to the project. DNS should stay on GoDaddy using A and CNAME records pointed at Netlify — do not transfer nameservers — because this allows email MX records to be managed independently without risk of outage.

The dominant risk in this milestone is sequencing: three systems (DNS, Netlify Forms, HouseFinder API) each have a non-obvious prerequisite that causes silent failure if skipped. DNS must be verified working from multiple resolvers before email is configured. The `public/__forms.html` shadow file must exist before Netlify will detect the form. HouseFinder's `/api/leads` route must export an `OPTIONS` handler with exact-origin CORS headers, and its `propertyId` column must be confirmed nullable before the endpoint is built. These are all resolvable in one focused build session if addressed in the right order.

## Key Findings

### Recommended Stack

The existing stack (Next.js 15.5.13, React 19.1.0, Tailwind CSS 4) handles all milestone requirements without modification. The only new code is a Next.js route handler at `app/api/submit-lead/route.ts` (a ~30-line proxy) and a static `public/__forms.html` shadow file (a ~10-line HTML form). Environment variables are managed via Netlify's dashboard — not committed to `.env.local`. Email is handled by Zoho Mail's free plan (5 users, 5 GB, 1 domain), with GoDaddy's MX records configured to Zoho's servers.

**Core technologies:**
- **Next.js 15 route handler** — server-side proxy for HouseFinder API call — keeps secret off the client and is already available in the project with no new installs
- **Netlify Forms** — spam filtering and backup lead capture — requires `public/__forms.html` workaround specific to Next.js App Router
- **Zoho Mail free plan** — custom domain email (brian@, shawn@, contact@no-bshomes.com) — free for up to 5 users; one-click GoDaddy DNS integration available
- **GoDaddy A/CNAME records** — point apex and www to Netlify load balancer without transferring nameserver authority

**What NOT to use:**
- `NEXT_PUBLIC_` prefix on API secrets — embeds them in the client bundle
- Netlify Functions (separate Lambda) — redundant; a Next.js route handler is the correct unit
- `output: 'export'` in next.config.ts — disables all route handlers
- Wildcard CORS (`Access-Control-Allow-Origin: *`) on HouseFinder — allows any site to flood the lead database

### Expected Features

The site already has all table stakes features for a "we buy houses" conversion site. This milestone's feature work is the API integration plumbing, not new UX.

**Must have (table stakes — this milestone):**
- HouseFinder `/api/leads` endpoint accepting POST with `leadSource: "website"` — not yet built
- Dual form submission (Netlify Forms + HouseFinder API) — not yet implemented
- Graceful API failure: Netlify submission succeeds even if HouseFinder is unreachable
- Custom domain live with HTTPS (GoDaddy DNS → Netlify)
- Contact info updated site-wide (phone: 435-250-3678, email: contact@no-bshomes.com)
- Custom domain email working (brian@, shawn@, contact@no-bshomes.com)
- SPF, DKIM, and DMARC DNS records configured for email deliverability

**Should have (add after core is working):**
- Preferred contact method field (Phone / Text / Email) — feeds into HouseFinder lead record
- "24-hour response" commitment moved above the form, not just in success message
- Founder names/faces near the form — "You'll hear from Brian or Shawn"

**Defer (v2+):**
- Lead confirmation email to seller — requires email infrastructure on HouseFinder side
- Google Reviews widget — only meaningful once 10+ reviews exist
- Situation-specific landing pages (/foreclosure, /probate) — SEO play, wrong priority now
- Blog/CMS — zero ROI until lead flow is established and proven

**Anti-features to avoid at any stage:**
- Instant automated valuation/offer — No BS Homes cannot accurately value properties; fake estimates destroy trust
- Live chat or chatbot — two-person team cannot staff it; distressed homeowners are poorly served by bots
- Multi-step form wizard — single-page is correct for 4 fields; adds complexity for no conversion gain
- Exit-intent popups — anxiety-inducing for already-stressed sellers; signals desperation

### Architecture Approach

The system is a one-way lead ingestion bridge: the No BS Homes marketing site (Netlify) sends leads via HTTPS POST to the HouseFinder app (Azure). The marketing site has no direct database access and knows nothing about HouseFinder's schema. ContactForm.tsx posts to Netlify first (URL-encoded, same-origin), shows the user a success state immediately, then fires a fire-and-forget JSON POST to HouseFinder via the server-side proxy route. HouseFinder's route handler validates the API key, runs Zod validation, sets internal fields (distressScore, isHot, alertSent) to safe defaults, and persists via Drizzle ORM. This keeps the two systems fully decoupled at the network boundary.

**Major components:**
1. **ContactForm.tsx (No BS Homes)** — collects input, dual-submits, shows status; the only client-side component that changes this milestone
2. **`app/api/submit-lead/route.ts` (No BS Homes)** — server-side proxy; reads secret from env, forwards to HouseFinder; the only new file on the marketing site
3. **`public/__forms.html` (No BS Homes)** — static shadow form for Netlify Forms build-time detection; 10-line HTML file, no logic
4. **`app/api/leads/route.ts` (HouseFinder)** — external ingest endpoint; validates API key + Zod schema; inserts lead with `leadSource: "website"`; must export OPTIONS handler for CORS preflight
5. **`lib/validations/lead-submission.ts` (HouseFinder)** — Zod schema accepting only the fields the marketing form sends; internal fields set server-side only

### Critical Pitfalls

1. **Nameserver transfer kills email** — If GoDaddy nameservers are transferred to Netlify before email DNS records (MX, SPF, DKIM) are recreated in Netlify DNS, email breaks immediately. Prevention: stay on GoDaddy DNS for web hosting using A/CNAME records only; no nameserver transfer needed for this milestone.

2. **Netlify Forms silently ignores React forms in Next.js 15** — Netlify's build scanner never sees JSX `<form>` components. Forms appear to work but no submissions are captured. Prevention: create `public/__forms.html` with shadow form definition before any testing; POST to `/__forms.html` (not `/`) from the submit handler.

3. **CORS preflight fails on HouseFinder API** — Browser fires OPTIONS preflight before any cross-origin POST with custom headers. If HouseFinder's route handler does not export `OPTIONS`, the request is blocked and no lead is created. Azure App Service also has its own CORS setting that silently overrides code-level CORS headers — configure in code only, not in the Azure portal.

4. **SPF/DKIM/DMARC missing sends email to spam** — Adding only MX records is not enough. Google and Microsoft now enforce all three authentication records. DMARC at `p=none` takes 5 minutes to add and provides monitoring with no risk. Do not mark email "done" until MXToolbox confirms all three pass.

5. **HouseFinder `propertyId` may be NOT NULL** — Website submissions have no `propertyId`. If the Drizzle schema enforces NOT NULL, every API submission fails with a 500. Prevention: audit the schema and write a nullable migration before building the endpoint.

## Implications for Roadmap

Based on the dependency graph across all four research files, the milestone decomposes into three sequential phases. Phase 1 unblocks Phase 2 (custom domain is required before email addresses and before CORS configuration uses the final domain). Phase 2 is parallel internal work across two codebases. Phase 3 wires them together.

### Phase 1: Custom Domain + DNS

**Rationale:** Domain is a hard prerequisite for everything else. Email addresses (brian@, shawn@, contact@no-bshomes.com) cannot be created until the domain exists and resolves. HouseFinder's CORS allowlist must reference the final production domain. Netlify will not provision a TLS certificate until DNS resolves.

**Delivers:** `https://no-bshomes.com` live with valid SSL; `https://www.no-bshomes.com` redirecting correctly; Netlify confirming domain is active.

**Addresses:** Custom domain table stakes feature; enables contact info update.

**Avoids:** Nameserver-transfer-kills-email pitfall (use A/CNAME in GoDaddy, no NS transfer); DNS propagation confusion (lower TTL to 300s 24 hours before any changes, verify from multiple resolvers via whatsmydns.net).

### Phase 2: Custom Email Setup

**Rationale:** Must happen after domain resolves (Phase 1) but is independent of HouseFinder API work. Sets up Zoho Mail free plan, configures MX + SPF + DKIM + DMARC records in GoDaddy DNS, and updates contact info site-wide.

**Delivers:** brian@, shawn@, contact@no-bshomes.com working; email lands in Gmail inbox (not spam); MXToolbox confirms all four DNS records pass; contact info updated on site.

**Uses:** Zoho Mail free plan; GoDaddy DNS manager; Zoho one-click GoDaddy integration.

**Avoids:** SPF/DKIM/DMARC pitfall (all four records: MX, SPF TXT, DKIM TXT, DMARC TXT); do not mark done until MXToolbox passes all three authentication checks.

### Phase 3: HouseFinder API Integration + Dual-Submit Form

**Rationale:** Requires Phase 1 (domain must exist for CORS allowlist and for Netlify env vars to be correct). HouseFinder endpoint must be built and tested before the marketing site form is wired. Schema audit (`propertyId` nullable check) must happen before endpoint code is written.

**Delivers:** Contact form dual-submits to Netlify Forms and HouseFinder; test submission appears in HouseFinder dashboard with `leadSource: "website"`; API key confirmed absent from browser bundle; graceful degradation if HouseFinder is unreachable.

**Uses:** Next.js route handler proxy (`app/api/submit-lead/route.ts`); `public/__forms.html` shadow file; HouseFinder `app/api/leads/route.ts` with OPTIONS export; Zod validation schema; Drizzle ORM insert.

**Implements:** Dual-submit architecture; server-side API key proxy; fire-and-forget HouseFinder call.

**Avoids:** Netlify Forms silent ignore (create `__forms.html` first, before testing); CORS preflight failure (OPTIONS handler on HouseFinder, no Azure portal CORS); API key in client bundle (server-only env var, proxy route); `propertyId` schema failure (audit schema first).

### Phase Ordering Rationale

- Domain comes first because it is the hard dependency that blocks email addresses and finalizes the CORS allowlist domain string.
- Email comes before API integration because it is independent work and eliminates a class of "is contact info correct?" questions before leads start flowing.
- API integration comes last because it depends on both the domain (for CORS) and requires coordination with whoever builds the HouseFinder endpoint — that build-then-test sequence is the most complex part and should not be interrupted by DNS propagation delays.

### Research Flags

Phases with well-documented patterns (skip additional research):
- **Phase 1 (Custom Domain):** GoDaddy-to-Netlify DNS with A/CNAME records is a fully documented, standard configuration. Netlify IP `75.2.60.5` and CNAME pattern verified against official docs.
- **Phase 2 (Custom Email):** Zoho Mail free plan setup with GoDaddy is documented in Zoho's own DNS mapping guide. No unknown patterns.

Phases likely needing validation before or during implementation:
- **Phase 3 (API Integration) — HouseFinder schema audit:** The `propertyId` nullability is an internal schema detail not visible from outside the codebase. This must be checked in the actual Drizzle schema file before the endpoint is written. If it is NOT NULL, a migration is required and must be planned.
- **Phase 3 — HouseFinder API authentication header:** STACK.md uses `Authorization: Bearer` while ARCHITECTURE.md uses `x-api-key`. The two research threads made different assumptions. The team must decide which header format HouseFinder will use and make both codebases consistent before implementation.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core patterns verified against official Next.js and Netlify docs; no new dependencies reduces risk |
| Features | MEDIUM | Conversion UX patterns from multiple sources; site already has all table stakes; new features in this milestone are plumbing, not UX |
| Architecture | HIGH (core), MEDIUM (HouseFinder internals) | Dual-submit pattern and route handler proxy are well-established; HouseFinder schema internals not directly inspectable |
| Pitfalls | HIGH | All critical pitfalls verified against official Netlify, Azure, and Next.js docs; recovery paths documented |

**Overall confidence:** HIGH for the approach and sequence; MEDIUM for HouseFinder internals that require in-codebase validation.

### Gaps to Address

- **API key header format discrepancy:** STACK.md recommends `Authorization: Bearer [token]`; ARCHITECTURE.md uses `x-api-key: [key]` and `NEXT_PUBLIC_` prefix (which contradicts the security guidance in the same file). Resolve before writing any code: pick one header name, confirm it is server-only, apply consistently to both `submit-lead/route.ts` and HouseFinder's validation logic.

- **Zoho free plan current availability:** Zoho occasionally changes free tier terms. Verify the free plan still exists and covers 5 users + custom domain at time of setup. Fallback is GoDaddy Professional Email (~$1-3/user/month) or Google Workspace ($7/user/month).

- **HouseFinder `propertyId` schema:** Cannot be determined from the marketing site codebase. Requires opening the HouseFinder Drizzle schema file and checking the column definition before Phase 3 begins.

- **HouseFinder deploy environment:** Azure App Service CORS configuration in the portal conflicts silently with code-level CORS. Confirm whether any CORS rules exist in the Azure portal before adding the OPTIONS handler in code.

## Sources

### Primary (HIGH confidence)
- [Next.js: Building APIs with Next.js](https://nextjs.org/blog/building-apis-with-nextjs) — Route handler patterns, proxy pattern, environment variable security
- [Netlify: Configure external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/) — A record IP 75.2.60.5, CNAME pattern
- [OpenNext: Using Netlify Forms with Next.js](https://opennext.js.org/netlify/forms) — `public/__forms.html` workaround for App Router
- [Netlify: Forms Setup](https://docs.netlify.com/manage/forms/setup/) — Form detection and AJAX submission requirements
- [Netlify: Set up Netlify DNS](https://docs.netlify.com/manage/domains/set-up-netlify-dns/) — Nameserver change requirements, MX record preservation warning
- [Microsoft Learn: Host a RESTful API with CORS on Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-rest-api) — Platform CORS vs. code CORS conflict
- [Zoho Mail: GoDaddy DNS mapping](https://www.zoho.com/mail/help/adminconsole/godaddy.html) — One-click GoDaddy integration and MX record values

### Secondary (MEDIUM confidence)
- [Zoho Mail: Custom domain email free plan](https://www.zoho.com/mail/custom-domain-email.html) — 5 users, 5 GB, 1 domain free tier (verify at signup)
- [Wisp CMS: Handling Common CORS Errors in Next.js 15](https://www.wisp.blog/blog/handling-common-cors-errors-in-nextjs-15) — CORS header patterns, OPTIONS handler
- [Next.js GitHub Discussion #52933](https://github.com/vercel/next.js/discussions/52933) — App Router CORS implementation
- [InfraForge: SPF, DKIM, DMARC Common Setup Mistakes](https://www.infraforge.ai/blog/spf-dkim-dmarc-common-setup-mistakes) — Email authentication requirements

### Tertiary (LOW confidence)
- [SalesHive: DKIM, DMARC, SPF Best Practices 2025](https://saleshive.com/blog/dkim-dmarc-spf-best-practices-email-security-deliverability/) — Single blog source; core claims corroborated by Zoho and MXToolbox documentation

---
*Research completed: 2026-04-05*
*Ready for roadmap: yes*
