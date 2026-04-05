# Pitfalls Research

**Domain:** Cash home buying marketing site — custom domain DNS, cross-origin form-to-API integration, custom email setup
**Researched:** 2026-04-05
**Confidence:** MEDIUM-HIGH (verified against Netlify official docs, Azure official docs, and multiple community sources)

---

## Critical Pitfalls

### Pitfall 1: Switching GoDaddy Nameservers to Netlify Breaks Email Before It's Configured

**What goes wrong:**
The Netlify-recommended path is to delegate the entire domain to Netlify DNS by swapping GoDaddy's nameservers. When you do this, GoDaddy's MX records (and any SPF/DKIM TXT records) are immediately orphaned — they no longer exist in the authoritative DNS zone. Email to contact@no-bshomes.com fails instantly for anyone whose resolver has cached the new NS records.

**Why it happens:**
Developers focus on getting the website working and don't realize that changing nameservers transfers authority for *all* DNS records, not just the A/CNAME records for the site. GoDaddy's email DNS records disappear from the authoritative zone the moment Netlify's nameservers answer for the domain.

**How to avoid:**
Before touching nameservers, audit every DNS record in GoDaddy's DNS manager (MX, TXT for SPF/DKIM, any existing CNAMEs). Recreate all of them in Netlify DNS first, then switch nameservers. Netlify's own documentation explicitly calls this out: "If you have any existing records on your current DNS provider, such as MX records for email service, make sure to copy them to Netlify DNS first."

Since email for this project isn't set up yet at DNS-switch time, the safe sequence is:
1. Choose your email provider (Google Workspace, Zoho, etc.)
2. Get the MX and TXT records from that provider
3. Add them to Netlify DNS
4. Then switch nameservers from GoDaddy

**Warning signs:**
- Sent a test email to contact@no-bshomes.com and it bounced immediately after the nameserver change
- MXToolbox shows "No MX records found" for no-bshomes.com after the switch

**Phase to address:**
Custom Domain phase — before any nameserver change, checklist must confirm email DNS records are ready

---

### Pitfall 2: Netlify Forms Are Silently Ignored in Next.js 15

**What goes wrong:**
Netlify Forms work by scanning static HTML at deploy time to discover form definitions. Next.js 15 does not emit fully-static HTML pages — every page can be revalidated at runtime. As a result, any `data-netlify="true"` attribute on a React `<form>` component is never seen by Netlify's form detection bot, and form submissions produce no error — they simply disappear. No lead data is captured.

**Why it happens:**
The Netlify adapter for Next.js now detects this incompatibility and intentionally fails the build with an error, but only if the `NETLIFY_NEXT_VERIFY_FORMS` environment variable is not set to `false`. Developers who bypass that check (or have an older adapter) see silent failure in production.

**How to avoid:**
The required workaround is a two-part setup:

1. Create `public/__forms.html` — a static HTML file containing bare-bones `<form>` tags with `data-netlify="true"` and hidden `<input name="form-name">` fields mirroring every field in the React form. This file exists only for Netlify's build-time scanner.

2. In the React form's submit handler, POST to `/__forms.html` (not the current page URL), URL-encoding the body. Netlify intercepts this POST and stores the submission.

The dual-submission strategy for HouseFinder API then fires a second `fetch` POST to the HouseFinder API endpoint from the same submit handler.

**Warning signs:**
- Netlify build logs warn about incompatible form usage
- Netlify UI shows zero submissions for the form after deploying
- The `NETLIFY_NEXT_VERIFY_FORMS` env var is set to `false` (was someone hiding the warning?)

**Phase to address:**
Form-to-API integration phase — the `__forms.html` shadow file and the dual-POST submit handler must be built together, not as separate steps

---

### Pitfall 3: CORS Preflight Fails Silently on the HouseFinder API Route

**What goes wrong:**
When the No BS Homes marketing site (on Netlify, `no-bshomes.com`) POSTs to the HouseFinder API (on Azure, `housefinder-app.azurewebsites.net`), the browser fires an OPTIONS preflight request before the actual POST. If the HouseFinder Next.js API route does not export an `OPTIONS` handler with the correct `Access-Control-Allow-Origin` and `Access-Control-Allow-Methods` headers, the browser blocks the request with a CORS error. The form appears to submit (no JS error thrown), but the fetch rejects and no lead is created.

**Why it happens:**
Next.js 15 App Router route handlers require explicit `OPTIONS` function exports to handle preflights. The browser triggers a preflight for any cross-origin POST with `Content-Type: application/json`, an `Authorization` header, or any non-simple header. This is not the same-origin case — it is guaranteed to preflight.

An additional trap: Azure App Service has its own CORS configuration in the portal (`az webapp cors add`). If you configure CORS headers both at the Azure platform level AND in Next.js route handler code, Azure's platform CORS takes precedence and your code headers are silently ignored. Pick one layer.

**How to avoid:**
In HouseFinder's `/api/leads` route handler:
- Export an `OPTIONS` function that returns `200` with all required CORS headers
- Set `Access-Control-Allow-Origin` to the exact production domain (`https://no-bshomes.com`) — not `*`
- Include `Access-Control-Allow-Methods: POST, OPTIONS` and `Access-Control-Allow-Headers: Content-Type`
- Do NOT also configure CORS in the Azure portal — one layer only

Store the allowed origin in an environment variable (`ALLOWED_ORIGIN=https://no-bshomes.com`) so it can be updated without code changes.

**Warning signs:**
- The browser console shows: `Access to fetch at 'housefinder-app.azurewebsites.net/api/leads' has been blocked by CORS policy`
- The Postman request succeeds (Postman ignores CORS) but the browser request fails
- The OPTIONS request returns 405 or no CORS headers

**Phase to address:**
Form-to-API integration phase — the HouseFinder `/api/leads` endpoint must be built with CORS headers from day one, not added after the fact

---

### Pitfall 4: SPF/DKIM/DMARC Missing = Email Goes to Spam or Bounces

**What goes wrong:**
Custom domain email sent from contact@no-bshomes.com to leads (or received from leads) is silently spam-foldered or rejected by Gmail, Outlook, and other providers that now enforce email authentication. Google and Microsoft both tightened enforcement in 2024-2025. An unauthenticated domain can pass initial setup but fail deliverability testing.

**Why it happens:**
Email providers (Google Workspace, Zoho, Microsoft 365) provide the required DNS records during setup, but they must be manually added to your DNS zone (Netlify DNS in this case). Developers add MX records, confirm email "works" by sending a test, then ship — not realizing DKIM and DMARC take additional DNS records and up to 48 hours to propagate and activate.

**How to avoid:**
After choosing email provider and adding MX records:
1. Add the SPF TXT record (`v=spf1 include:[provider] ~all`) — only one SPF record per domain, ever
2. Add the DKIM TXT record (provider generates this — it's a public key under a subdomain like `google._domainkey.no-bshomes.com`)
3. Add a DMARC TXT record at `_dmarc.no-bshomes.com` — start with `p=none` for monitoring, then tighten after confirming all mail passes authentication
4. Verify all three with MXToolbox after 24-48 hours propagation

Never create multiple SPF records — DNS allows only one and duplicates cause total authentication failure.

**Warning signs:**
- Test emails sent to a personal Gmail land in spam
- MXToolbox SPF check shows "permerror" or "softfail"
- DKIM check returns "record not found"
- DMARC report shows failing messages after the first week

**Phase to address:**
Custom email setup phase — do not mark email "done" until MXToolbox shows all three passing

---

## Moderate Pitfalls

### Pitfall 5: DNS Propagation Window Causes "It Worked Yesterday" Confusion

**What goes wrong:**
After changing GoDaddy nameservers to Netlify, DNS propagates unevenly. On your machine (which may have cached the old NS records at the ISP level), the site appears broken while colleagues on different ISPs see it working, or vice versa. SSL certificate provisioning on Netlify also depends on DNS being resolvable by Netlify's own certificate authority challenge, which may fail during propagation.

**Why it happens:**
Different resolvers cache DNS records for different TTLs. The old GoDaddy TTL may be as high as 1 hour, meaning some resolvers continue using old records for 1+ hours after the switch. Full global propagation typically takes 24-48 hours; some edge cases on GoDaddy take longer due to GoDaddy's own internal caches.

**How to avoid:**
- Before switching nameservers, lower GoDaddy's TTL to 300 seconds (5 min) and wait 24 hours for this lower TTL to propagate. Then switch nameservers — old records expire quickly.
- Use `dnschecker.org` or `whatsmydns.net` to check propagation from multiple geographic locations, not just your local browser.
- Do not test from the same machine immediately — use a different network (mobile hotspot) to avoid local DNS cache confusion.

**Warning signs:**
- Netlify dashboard shows "Awaiting external DNS" for more than 2 hours
- Site loads on one device but not another on the same network
- SSL certificate provisioning is stuck in Netlify

**Phase to address:**
Custom Domain phase — include a TTL-lowering step 24 hours before the planned nameserver switch

---

### Pitfall 6: HouseFinder Leads Table Requires propertyId Foreign Key

**What goes wrong:**
The HouseFinder leads schema has a `propertyId` foreign key. If the `/api/leads` endpoint enforces this as NOT NULL, form submissions from the marketing site (which have no property context) will fail at the database layer. The API returns a 500, the form submit fails, no lead is created.

**Why it happens:**
The existing lead data model was designed for leads sourced from scraped properties, which always have a `propertyId`. Website form submissions are unconstrained — the user is submitting their own address, which may not exist in HouseFinder's property database.

**How to avoid:**
The HouseFinder `/api/leads` endpoint must be designed to handle `propertyId: null` for `leadSource: "website"` submissions. Verify the Drizzle ORM schema for `propertyId` is nullable before building the endpoint. If it is not nullable today, it must be migrated.

**Warning signs:**
- API returns 500 on test submissions with no `propertyId`
- Drizzle schema definition shows `propertyId: integer('property_id').notNull()`

**Phase to address:**
Form-to-API integration phase — schema validation must be the first step before building the endpoint

---

### Pitfall 7: API Key / Secret Exposed in Client-Side Code

**What goes wrong:**
The HouseFinder API endpoint needs to reject spam submissions from arbitrary callers — not just the No BS Homes form. If an API key is embedded in the marketing site's client-side JavaScript bundle, any visitor can extract it and flood HouseFinder with fake leads.

**Why it happens:**
In Next.js, any variable that isn't prefixed with `NEXT_PUBLIC_` stays server-side. Developers sometimes put API secrets in client components or use `NEXT_PUBLIC_` prefix out of habit, exposing the key in the browser bundle.

**How to avoid:**
- The HouseFinder API call must originate from a Next.js Server Action or Route Handler on the marketing site (server-side only), not from a client component
- Store the API key in `HOUSEFINDER_API_KEY` (no `NEXT_PUBLIC_` prefix) in Netlify's environment variables
- HouseFinder `/api/leads` validates the `X-Api-Key` header on every request

**Warning signs:**
- Right-click → View Source on the deployed marketing site shows the API key string
- The API call is made from a `"use client"` component using `fetch`

**Phase to address:**
Form-to-API integration phase — API key strategy must be defined before writing a single line of the submission handler

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip DMARC, only set SPF+DKIM | Faster email setup | Spam folder risk increases as domain ages; no visibility into spoofing attempts | Never — DMARC `p=none` takes 5 minutes to add |
| Use `Access-Control-Allow-Origin: *` in HouseFinder API | No origin management needed | Any site can submit fake leads to HouseFinder; wildcards also block credential-bearing requests | Never in production — use exact domain |
| Use GoDaddy external DNS (A records only) instead of switching nameservers | Simpler DNS transition, email stays intact | Cannot use Netlify branch deploy subdomains or wildcard SSL; Netlify's CDN edge nodes work better with Netlify DNS | Acceptable if email must stay on GoDaddy and no branch deploy subdomains needed |
| Skip `public/__forms.html` and disable form verification | One less file to maintain | Netlify Forms silently stops capturing submissions on next deployment | Never — the static HTML file is a 10-line fix |
| Hard-code allowed origins in HouseFinder CORS config | Quick to ship | Requires code deploy every time the marketing site domain changes | Never — use environment variable |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GoDaddy → Netlify DNS | Switching nameservers before recreating MX/TXT records in Netlify DNS | Audit all GoDaddy DNS records, add them to Netlify DNS zone, then switch nameservers |
| Netlify Forms + Next.js 15 | Putting `data-netlify` on a React form component | Create `public/__forms.html` with shadow form definition; POST to `/__forms.html` from the submit handler |
| No BS Homes → HouseFinder API | Calling HouseFinder API directly from a client component | Use a Server Action or API route on the marketing site as a proxy — keeps the API key server-side |
| Azure App Service CORS | Configuring CORS in both Azure portal AND Next.js route handler code | Pick one: either `az webapp cors add` OR `OPTIONS` handler in code — not both (platform CORS overrides code CORS silently) |
| Email setup on Netlify DNS | Adding only MX records | Add MX + SPF TXT + DKIM TXT + DMARC TXT — all four are required for modern deliverability |
| Netlify form body encoding | Sending JSON body to Netlify Forms endpoint | Netlify Forms requires `application/x-www-form-urlencoded` — not JSON |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| API key in `NEXT_PUBLIC_` env var | Key visible in browser bundle; anyone can submit fake leads to HouseFinder | Keep key in server-only env var; make the API call from a Server Action |
| No rate limiting on HouseFinder `/api/leads` | Spam lead flooding from scrapers after API key is discovered | Add rate limiting per IP (or per API key) on the HouseFinder endpoint — middleware or Azure API Management |
| Wildcard CORS on HouseFinder | Cross-site request forgery; any origin can submit leads | Exact origin allowlist via environment variable |
| DMARC policy left at `p=none` forever | Domain can be spoofed; no enforcement against phishing | Tighten to `p=quarantine` after 30 days of clean DMARC reports |
| No input validation on `/api/leads` | Garbage data in HouseFinder lead database | Validate required fields (name, phone/email, address) and reject malformed requests with 400 |

---

## "Looks Done But Isn't" Checklist

- [ ] **Custom domain:** SSL certificate shows as provisioned in Netlify — verify by loading `https://no-bshomes.com` from a mobile hotspot (different DNS resolver)
- [ ] **Netlify Forms:** Netlify dashboard shows at least one test submission — not just that the form rendered
- [ ] **HouseFinder API integration:** A test submission from the live marketing site appears in HouseFinder dashboard as a lead with `leadSource: "website"`
- [ ] **Email deliverability:** Send a test email from brian@no-bshomes.com to a Gmail address and confirm it lands in inbox, not spam
- [ ] **SPF/DKIM/DMARC:** MXToolbox shows all three as passing for no-bshomes.com
- [ ] **API key security:** Confirm `HOUSEFINDER_API_KEY` does not appear in the Netlify-deployed JS bundle (view source search)
- [ ] **CORS:** The HouseFinder API call succeeds from the production domain — not just from localhost or Postman
- [ ] **propertyId nullable:** HouseFinder accepts a lead submission with no propertyId without error

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Email broke after nameserver switch | MEDIUM | Add missing MX/SPF/DKIM records to Netlify DNS; wait up to 48h propagation; notify users of delay |
| Netlify Forms not capturing submissions | LOW | Add `public/__forms.html`, update submit handler POST target, redeploy |
| CORS blocking form submissions in production | LOW | Add `OPTIONS` handler to HouseFinder route, deploy, no data migration needed |
| API key exposed in client bundle | HIGH | Rotate API key immediately; refactor submission to Server Action; redeploy both apps |
| Email going to spam | MEDIUM | Add missing DKIM/DMARC records; wait 48h; warm up sending with low volume first |
| propertyId NOT NULL blocking website leads | MEDIUM | Write and run a Drizzle migration to make the column nullable; coordinate with HouseFinder deploy |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Nameserver switch breaks email | Custom Domain — pre-switch DNS audit step | MX, SPF, DKIM all resolving in Netlify DNS before nameserver change |
| Netlify Forms silently ignored in Next.js 15 | Form-to-API Integration — `__forms.html` creation | Netlify UI shows test submission after deploy |
| CORS preflight failure on HouseFinder API | Form-to-API Integration — HouseFinder endpoint build | OPTIONS request returns 200 with correct headers; live form submit creates lead |
| SPF/DKIM/DMARC missing | Custom Email Setup | MXToolbox passes all three; test email lands in Gmail inbox |
| DNS propagation confusion | Custom Domain | `whatsmydns.net` shows consistent resolution from 10+ regions |
| propertyId FK constraint | Form-to-API Integration — schema review first | HouseFinder accepts POST with no propertyId |
| API key in client bundle | Form-to-API Integration — architecture decision | Key absent from browser-visible JS; Server Action confirmed in network tab |

---

## Sources

- [Netlify Docs — Set up Netlify DNS](https://docs.netlify.com/manage/domains/set-up-netlify-dns/) — official, HIGH confidence
- [Netlify Docs — Forms Setup](https://docs.netlify.com/manage/forms/setup/) — official, HIGH confidence
- [OpenNext.js — Using Netlify Forms with Next.js](https://opennext.js.org/netlify/forms) — official Netlify adapter docs, HIGH confidence
- [Netlify Support Forum — GoDaddy email + Netlify DNS coexistence](https://answers.netlify.com/t/how-to-use-godaddy-domain-with-netlify-hosted-site-while-domain-is-being-used-for-email-with-godaddy/124369) — MEDIUM confidence
- [Netlify Support Forum — Awaiting External DNS stuck](https://answers.netlify.com/t/nameserver-has-been-updated-on-godaddy-side-but-still-netlify-is-showing-awaiting-external-dns/117793) — MEDIUM confidence
- [Microsoft Learn — Host a RESTful API with CORS on Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-rest-api) — official, HIGH confidence (key finding: platform CORS and code CORS conflict)
- [Wisp CMS — Handling Common CORS Errors in Next.js 15](https://www.wisp.blog/blog/handling-common-cors-errors-in-nextjs-15) — MEDIUM confidence
- [Next.js GitHub Discussion — CORS in App Router](https://github.com/vercel/next.js/discussions/52933) — MEDIUM confidence
- [InfraForge — SPF, DKIM, DMARC Common Setup Mistakes](https://www.infraforge.ai/blog/spf-dkim-dmarc-common-setup-mistakes) — MEDIUM confidence (verified against Cloudflare and Mailgun references)
- [SalesHive — DKIM, DMARC, SPF Best Practices 2025](https://saleshive.com/blog/dkim-dmarc-spf-best-practices-email-security-deliverability/) — LOW confidence (blog, single source)

---
*Pitfalls research for: No BS Homes — custom domain, cross-origin API integration, custom email*
*Researched: 2026-04-05*
