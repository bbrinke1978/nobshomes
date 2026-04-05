# Stack Research

**Domain:** Real estate lead generation — API integration and custom domain milestone
**Researched:** 2026-04-05
**Confidence:** HIGH (core patterns verified against official Next.js docs and Netlify docs; email provider claims verified against Zoho official site)

---

## Context: What Already Exists

The marketing site is a **Next.js 15.5.13 / React 19.1.0 / Tailwind CSS 4** project deployed on Netlify. The `ContactForm.tsx` is a `"use client"` component that currently POSTs URL-encoded data to `"/"` for Netlify Forms capture. No server-side API routes exist yet. No authentication layer exists. The `next.config.ts` is empty (no CORS headers, no rewrites).

This milestone adds three capabilities to that existing foundation:
1. Dual-submit the contact form to both Netlify Forms and HouseFinder's `/api/leads` endpoint
2. Point `no-bshomes.com` (GoDaddy) DNS to the Netlify deployment
3. Set up custom email addresses (brian@, shawn@, contact@no-bshomes.com)

No new NPM packages are required for the core work. The patterns are native to the existing stack.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.5.13 (existing) | App Router route handlers for the proxy API | Already in project; App Router route handlers are the correct pattern for a server-side proxy that hides the HouseFinder API secret from the browser. Do not add a separate Express server. |
| React | 19.1.0 (existing) | Client-side form state and dual-submit logic | Already in project. The `ContactForm.tsx` client component handles both fetch calls in sequence. |
| Tailwind CSS 4 | ^4.1.4 (existing) | No changes needed for this milestone | — |

### Supporting Libraries

No new dependencies are recommended. Everything needed is built into the existing stack.

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | CORS headers | Set via `next.config.ts` `headers()` function — no library needed. Native Next.js handles this. |
| (none) | — | Form URL encoding | Native `URLSearchParams` — already used in `ContactForm.tsx`. |
| (none) | — | Environment variables | Next.js built-in `.env.local` + Netlify environment variable UI — no `dotenv` package needed. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Netlify CLI (optional) | Test Netlify Forms locally | `npx netlify-cli dev` enables local form detection. Not required — can test form submission against production. |
| `curl` / Postman | Verify HouseFinder `/api/leads` endpoint before wiring the form | Test the endpoint directly before touching the marketing site. Confirms CORS config is correct. |

---

## Implementation Patterns

### Pattern 1: Next.js Proxy Route for Lead Submission

**What it is:** A server-side route handler at `app/api/submit-lead/route.ts` that accepts the form POST, reads the HouseFinder API secret from `process.env`, and forwards to HouseFinder.

**Why this approach:** The HouseFinder API will require an auth token (shared secret or bearer token). You must never put that secret in client-side code — it would be visible in browser DevTools. A server-side route handler keeps the secret server-side. The marketing site form POSTs to its own `/api/submit-lead`, which then proxies to `housefinder-app.azurewebsites.net/api/leads`.

**Confidence:** HIGH — verified against official Next.js "Building APIs with Next.js" guide (nextjs.org, February 2025).

```typescript
// app/api/submit-lead/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(
    `${process.env.HOUSEFINDER_API_URL}/api/leads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HOUSEFINDER_API_SECRET}`,
      },
      body: JSON.stringify({
        name: body.name,
        phone: body.phone,
        address: body.address,
        message: body.message,
        leadSource: "website",
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Lead creation failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
```

Environment variables (never prefix with `NEXT_PUBLIC_` for secrets):
- `HOUSEFINDER_API_URL` = `https://housefinder-app.azurewebsites.net`
- `HOUSEFINDER_API_SECRET` = shared secret agreed with HouseFinder

### Pattern 2: Dual-Submit in ContactForm.tsx

**What it is:** The existing `handleSubmit` function makes two sequential fetches — one to `/__forms.html` (Netlify Forms detection) and one to `/api/submit-lead` (the proxy above). Both must succeed or the user sees an error. Netlify Forms acts as a backup capture; HouseFinder is the primary lead creation.

**Why sequential, not parallel:** If the HouseFinder call fails, we still want the Netlify backup captured. Fire Netlify first (it is more tolerant), then HouseFinder. If HouseFinder fails, show the error but the data is not lost — it is in Netlify's dashboard.

**Confidence:** HIGH — Netlify's own documentation (opennext.js.org/netlify/forms) confirms the `/__forms.html` static file pattern is the required approach for Next.js App Router.

The `public/__forms.html` file must be created with a bare-minimum form matching the field names exactly:

```html
<!-- public/__forms.html -->
<form name="contact" netlify netlify-honeypot="bot-field" hidden>
  <input type="text" name="name" />
  <input type="tel" name="phone" />
  <input type="text" name="address" />
  <textarea name="message"></textarea>
</form>
```

### Pattern 3: CORS on HouseFinder's `/api/leads` (work done in HouseFinder, not this site)

**What it is:** HouseFinder's Next.js API route at `/api/leads` must return CORS headers allowing POST from `https://no-bshomes.com` and `https://www.no-bshomes.com`. It also needs an `OPTIONS` export to handle preflight.

**Why this matters:** The marketing site's proxy route calls HouseFinder server-to-server (no browser CORS involved for this call — it runs in Node.js on Netlify). However, if the team ever decides to call HouseFinder directly from the browser in the future, CORS headers will be needed. More importantly: HouseFinder needs to validate the `Authorization` header, which means the call IS a "non-simple" cross-origin request that would trigger preflight if called from a browser. Since the proxy approach avoids browser CORS entirely, this is informational for the HouseFinder developer.

**Confidence:** HIGH — verified against official Next.js route handler docs and multiple community discussions confirming that server-to-server fetch calls are not subject to browser CORS policy.

```typescript
// HouseFinder: app/api/leads/route.ts (for reference only — work done there)
const ALLOWED_ORIGIN = "https://no-bshomes.com";

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.WEBSITE_API_SECRET}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  // ... create lead
}
```

---

## DNS Configuration (GoDaddy to Netlify)

**Approach: Keep GoDaddy as registrar, point DNS records to Netlify.**

Do NOT transfer nameservers to Netlify DNS. Reason: email MX records need to be managed in GoDaddy DNS for Zoho Mail. Transferring to Netlify DNS is possible but adds complexity when you also need to manage MX records there.

**Required DNS records in GoDaddy:**

| Record Type | Host | Value | Purpose |
|-------------|------|-------|---------|
| A | `@` | `75.2.60.5` | Apex domain (`no-bshomes.com`) → Netlify load balancer |
| CNAME | `www` | `[site-name].netlify.app` | `www.no-bshomes.com` → Netlify site |

After adding records, add the domain in Netlify: **Site Settings > Domain management > Add custom domain**. Netlify will provision a free TLS certificate via Let's Encrypt automatically once DNS resolves.

**Confidence:** HIGH — A record IP `75.2.60.5` and CNAME target verified against official Netlify "Configure external DNS" documentation (docs.netlify.com).

**Propagation:** Up to 24 hours globally; typically resolves within 1-2 hours.

---

## Email Setup (Custom Domain Email)

**Recommendation: Zoho Mail free plan.**

**Why Zoho over alternatives:**
- **Free for up to 5 users** with 5 GB per user and custom domain support — no monthly cost for a 3-address setup (brian@, shawn@, contact@)
- **Google Workspace** costs $7/user/month minimum — overkill for a 2-person team that likely already has personal Gmail accounts
- **GoDaddy email (powered by Microsoft)** is $1-6/user/month and convenient but adds ongoing cost
- **Zoho one-click GoDaddy integration** — Zoho supports Domain Connect with GoDaddy, meaning MX records can be added automatically via OAuth login, no manual DNS editing required

**Confidence:** MEDIUM — Zoho free plan limits (5 users, 5 GB, 1 domain) verified against zoho.com official page. One-click GoDaddy setup verified against Zoho's GoDaddy DNS mapping guide. Free plan availability as of 2026-04-05 — verify during setup as Zoho occasionally changes free tier terms.

**Required DNS records added to GoDaddy for Zoho Mail:**

| Record Type | Host | Value | Priority |
|-------------|------|-------|----------|
| MX | `@` | `mx.zoho.com` | 10 |
| MX | `@` | `mx2.zoho.com` | 20 |
| MX | `@` | `mx3.zoho.com` | 50 |
| TXT | `@` | `v=spf1 include:zoho.com ~all` | — |
| CNAME | `zmail._domainkey` | `[dkim value from Zoho console]` | — |

Note: SPF and DKIM records are required to prevent email from landing in spam. Zoho's setup wizard generates the exact DKIM CNAME value.

---

## Environment Variables

| Variable | Where Set | Accessible In | Purpose |
|----------|-----------|---------------|---------|
| `HOUSEFINDER_API_URL` | Netlify UI > Environment Variables | Server only (no NEXT_PUBLIC_ prefix) | HouseFinder base URL |
| `HOUSEFINDER_API_SECRET` | Netlify UI > Environment Variables | Server only | Shared secret for `/api/leads` auth |

Set these in Netlify's dashboard under **Site configuration > Environment variables**. They are automatically available to route handlers at runtime. Do not commit them to `.env.local` in git.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js proxy route handler | Direct browser fetch to HouseFinder | Never — exposes the API secret in client JS bundle |
| Netlify native DNS with GoDaddy A records | Transfer nameservers to Netlify | Only if you want Netlify's branch deploy subdomain automation and are willing to move MX records too |
| Zoho Mail free plan | Google Workspace ($7/user/month) | When the team needs Google Drive, Meet, Docs integration and budget allows |
| Zoho Mail free plan | GoDaddy Professional Email | When you want a single-vendor experience and are already paying GoDaddy for domain |
| Sequential dual-submit (Netlify then HouseFinder) | Netlify webhook that calls HouseFinder | Only if you want zero changes to the marketing site front-end — Netlify webhooks can POST to HouseFinder on submission, but adds latency and a webhook auth problem |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `NEXT_PUBLIC_HOUSEFINDER_API_SECRET` | Prefixing with NEXT_PUBLIC_ embeds the value in the client-side JS bundle — anyone can read it in browser DevTools | Server-only env var without NEXT_PUBLIC_ prefix, accessed in a route handler |
| `nextjs-cors` npm package | Adds a dependency for something Next.js handles natively via `next.config.ts` headers or inline response headers | Native `Response` with CORS headers in the route handler, or `next.config.ts` `headers()` |
| Netlify Functions (separate Lambda) | Adds a separate runtime and deployment unit for what a Next.js route handler handles natively | `app/api/submit-lead/route.ts` route handler |
| Transferring nameservers to Netlify before setting up email | Causes email outage during DNS propagation window | Configure Zoho MX records in GoDaddy first, verify email works, then optionally migrate |
| `output: 'export'` in next.config.ts | Static export mode disables all route handlers — the proxy route stops working | Keep the default (no output setting), which is the current project state |

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@15.5.13 | react@19.1.0, react-dom@19.1.0 | Verified — current project already runs both together |
| next@15.5.13 | tailwindcss@4.1.4 | Verified — current project |
| next@15.5.13 | App Router route handlers | Route handlers fully supported since Next.js 13; stable in 15 |
| Netlify Next.js plugin | next@15 | Confirmed working — site is already deployed on Netlify with Next.js 15 |

---

## Sources

- [Next.js: Building APIs with Next.js](https://nextjs.org/blog/building-apis-with-nextjs) (nextjs.org, February 2025) — Route handler patterns, proxy pattern, environment variable security — HIGH confidence
- [Netlify: Configure external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/) — A record IP 75.2.60.5 and CNAME pattern — HIGH confidence
- [OpenNext: Using Netlify Forms with Next.js](https://opennext.js.org/netlify/forms) — `public/__forms.html` static file pattern for App Router — HIGH confidence
- [Zoho Mail: Custom domain email free plan](https://www.zoho.com/mail/custom-domain-email.html) — 5 users, 5 GB, 1 domain free tier — MEDIUM confidence (verify current terms at signup)
- [Zoho Mail: GoDaddy DNS mapping](https://www.zoho.com/mail/help/adminconsole/godaddy.html) — One-click GoDaddy setup and MX record values — HIGH confidence
- [Wisp CMS: Handling CORS in Next.js 15](https://www.wisp.blog/blog/handling-common-cors-errors-in-nextjs-15) — CORS header patterns, OPTIONS handler requirement — MEDIUM confidence
- [Next.js GitHub Discussion #52933](https://github.com/vercel/next.js/discussions/52933) — App Router CORS implementation via middleware — MEDIUM confidence

---

*Stack research for: No BS Homes — Lead Integration + Custom Domain milestone*
*Researched: 2026-04-05*
