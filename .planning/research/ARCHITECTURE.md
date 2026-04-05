# Architecture Research

**Domain:** Marketing site to separate operational app — lead ingestion bridge
**Researched:** 2026-04-05
**Confidence:** HIGH (core patterns), MEDIUM (HouseFinder internals — not directly inspectable)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                    No BS Homes (Netlify)                              │
│                  no-bshomes.com                                       │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  ContactForm.tsx  (Client Component)                         │     │
│  │   - Netlify Forms POST (backup, spam filter)                 │     │
│  │   - HouseFinder API POST (lead creation)                     │     │
│  └──────────────────────────┬──────────────────────────────────┘     │
└─────────────────────────────┼────────────────────────────────────────┘
                              │
                  HTTPS POST /api/leads
                  Header: x-api-key: [secret]
                  Body: { name, phone, address, message, leadSource }
                              │
┌─────────────────────────────▼────────────────────────────────────────┐
│                 HouseFinder (Azure)                                   │
│             housefinder-app.azurewebsites.net                        │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  app/api/leads/route.ts  (Route Handler)                     │     │
│  │   - Validates x-api-key                                      │     │
│  │   - Validates + sanitizes body (Zod)                         │     │
│  │   - Inserts lead via Drizzle ORM                             │     │
│  │   - Returns { ok: true, leadId }                             │     │
│  └──────────────────────────┬──────────────────────────────────┘     │
│                             │                                         │
│  ┌──────────────────────────▼──────────────────────────────────┐     │
│  │  Drizzle ORM → leads table                                   │     │
│  │   leadSource: "website"                                      │     │
│  │   status, distressScore, isHot, alertSent                    │     │
│  └─────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| ContactForm.tsx (No BS Homes) | Collect user input, dual-submit, show status | Netlify Forms (backup), HouseFinder API |
| Netlify Forms | Spam filter, backup record, email notification | No BS Homes (handled automatically by platform) |
| HouseFinder `/api/leads` route | Accept POST, authenticate, validate, persist lead | Drizzle ORM / database |
| Drizzle ORM (HouseFinder) | Type-safe DB insert into leads table | Azure PostgreSQL / SQL database |
| HouseFinder Lead Dashboard | Display leads with leadSource: "website" filter | Already built, already handles this source |

## Recommended Project Structure

### No BS Homes (changes needed)

```
src/
├── components/
│   └── ContactForm.tsx        # Modify: add second fetch() call to HouseFinder
├── lib/
│   └── contact-data.ts        # Existing
└── app/
    └── page.tsx               # No changes needed
```

### HouseFinder (new files needed)

```
app/
└── api/
    └── leads/
        └── route.ts           # New: POST handler for external lead ingestion
lib/
└── validations/
    └── lead-submission.ts     # New: Zod schema for inbound lead payload
```

### Structure Rationale

- **api/leads/route.ts:** Follows Next.js 15 App Router file convention. The `route.ts` name is required for Route Handlers.
- **lib/validations/:** Centralizes Zod schemas. Keeps the route handler thin — validate in lib, persist in route.

## Architectural Patterns

### Pattern 1: Dual Submit with Netlify as Backup

**What:** The contact form posts to two targets sequentially: first Netlify Forms (URL-encoded to `/`), then HouseFinder API (JSON to external URL). If HouseFinder fails, Netlify still captures the data so no lead is lost.

**When to use:** Whenever you need a fallback capture for lead-critical form data. Netlify Forms is already wired; don't throw it away.

**Trade-offs:** Two network requests adds ~200-400ms. Acceptable for a contact form. The form shows success after Netlify succeeds to avoid blocking the user on a secondary system.

**Example:**
```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setSubmitting(true);

  const form = e.currentTarget;
  const formData = new FormData(form);

  // Step 1: Netlify Forms (backup + spam filter) — always attempt
  const netlifyRes = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
  });

  if (!netlifyRes.ok) {
    setError("Something went wrong. Please call us instead.");
    setSubmitting(false);
    return;
  }

  // Step 2: HouseFinder API — fire and don't block UX on failure
  const payload = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    message: formData.get("message") || "",
    leadSource: "website",
  };

  fetch(process.env.NEXT_PUBLIC_HOUSEFINDER_API_URL + "/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_HOUSEFINDER_API_KEY!,
    },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silent — Netlify Forms is the safety net. Log on server if needed.
  });

  setSubmitted(true);
  setSubmitting(false);
}
```

**Important note on the API key:** `NEXT_PUBLIC_` prefix means it is bundled into the browser bundle and publicly visible. This is acceptable for a simple shared-secret key on a low-stakes internal tool — both systems are owned by the same team. If the key needs rotation, update both envs and redeploy. Do NOT use a secret with elevated permissions here.

### Pattern 2: Dedicated External Ingest Endpoint on HouseFinder

**What:** A standalone Route Handler at `/api/leads` that only handles external submissions. It does NOT share logic with any admin or internal lead creation path. This boundary prevents accidental permission escalation.

**When to use:** Whenever accepting data from an untrusted external origin. Separate the external-facing endpoint from internal CRUD operations even if they write to the same table.

**Trade-offs:** Small duplication of insert logic. Worth it for the security and coupling boundary.

**Example:**
```typescript
// app/api/leads/route.ts (HouseFinder)

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { leads } from "@/db/schema";

const ALLOWED_ORIGINS = [
  "https://no-bshomes.com",
  "https://www.no-bshomes.com",
];

const LeadSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(7).max(30),
  address: z.string().min(5).max(500),
  message: z.string().max(2000).optional().default(""),
  leadSource: z.literal("website"),
});

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(allowed ? origin : ""),
  });
}

export async function POST(request: NextRequest) {
  // 1. Origin check
  const origin = request.headers.get("origin") ?? "";
  const originAllowed = ALLOWED_ORIGINS.includes(origin);

  // 2. API key check (shared secret, stored in env)
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== process.env.WEBSITE_LEAD_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  // 4. Insert lead
  const [lead] = await db
    .insert(leads)
    .values({
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      notes: parsed.data.message,
      leadSource: "website",
      status: "new",
      isHot: false,
      alertSent: false,
    })
    .returning({ id: leads.id });

  return NextResponse.json(
    { ok: true, leadId: lead.id },
    { status: 201, headers: corsHeaders(originAllowed ? origin : "") }
  );
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin || "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  };
}
```

### Pattern 3: Validation Schema Mirrors the Leads Table (not the full schema)

**What:** The inbound Zod schema accepts only what the marketing form sends. It does NOT expose the full leads table shape. Internal fields (distressScore, isHot, alertSent) are set server-side with safe defaults.

**When to use:** Any external-facing write endpoint. Never let external callers set internal state fields.

**Trade-offs:** Requires manually mapping external payload to DB row. Small overhead that prevents a class of privilege escalation bugs.

## Data Flow

### Lead Submission Flow

```
User fills form (No BS Homes)
    ↓
handleSubmit()
    ↓
POST "/" — Netlify Forms (URL-encoded)
    ↓ (only proceed if Netlify succeeds)
setSubmitted(true) — User sees success immediately
    ↓ (fire-and-forget)
POST housefinder-app.azurewebsites.net/api/leads (JSON + x-api-key)
    ↓
HouseFinder OPTIONS preflight (browser sends this first automatically)
    ↓
HouseFinder POST handler
    → validate x-api-key
    → Zod parse body
    → db.insert(leads).values({ leadSource: "website", ...fields })
    → return { ok: true, leadId }
```

### Key Data Flows

1. **Happy path:** Netlify captures first (spam filter + backup), then HouseFinder creates the lead. Both succeed. User sees confirmation.
2. **HouseFinder down:** Netlify captured the submission. Brian/Shawn can manually enter from Netlify dashboard. No data lost.
3. **Netlify down (rare):** Form blocks — no lead captured. Acceptable; Netlify uptime is very high.
4. **Bot/spam:** Netlify's honeypot catches bots before they ever reach HouseFinder. CORS + API key stops direct API abuse.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-100 leads/month | Current design is more than sufficient. No queue needed. |
| 1k-10k leads/month | Add rate limiting on `/api/leads` (e.g., `@upstash/ratelimit`). Still synchronous. |
| 10k+ leads/month | Consider async queue (a job queue like BullMQ or a simple Azure Service Bus message). At this scale, leads are a business problem, not a technical one for No BS Homes. |

### Scaling Priorities

1. **First bottleneck:** Database connection pool on Azure. Drizzle's `postgres-js` pool defaults are fine at this scale. Not a concern.
2. **Second bottleneck:** None visible. This is a small internal tool. Premature scaling is wasted effort.

## Anti-Patterns

### Anti-Pattern 1: Direct Database Access from Marketing Site

**What people do:** Give the marketing site a DB connection string and write directly to the leads table.

**Why it's wrong:** Couples two separately deployed codebases to the same database. Changes to the leads schema require coordinated deploys. DB credentials leak into a public-facing Next.js bundle. Netlify serverless functions have cold-start overhead that makes DB pooling problematic.

**Do this instead:** HTTP API on HouseFinder. The API owns the DB. The marketing site knows nothing about the schema.

### Anti-Pattern 2: Wildcard CORS on the Leads Endpoint

**What people do:** Set `Access-Control-Allow-Origin: *` on the ingest endpoint for convenience.

**Why it's wrong:** Any website can POST to your leads endpoint and flood it with junk data. Breaks the "only our marketing site can create leads" guarantee.

**Do this instead:** Explicit origin allowlist (`no-bshomes.com`, `www.no-bshomes.com`) plus API key header. Double-layer: CORS blocks browsers; API key blocks non-browser callers.

### Anti-Pattern 3: Exposing a High-Permission Key in the Frontend Bundle

**What people do:** Use an admin API key that can read/write/delete any record, put it in `NEXT_PUBLIC_*`.

**Why it's wrong:** It's in the JS bundle. Anyone can read it in DevTools. With admin permissions this becomes a full data breach risk.

**Do this instead:** Create a scoped key (`WEBSITE_LEAD_API_KEY`) that only authorizes the lead ingest endpoint. Even if leaked, the attacker can only create leads — not read, delete, or impersonate users.

### Anti-Pattern 4: Blocking UX on HouseFinder API Success

**What people do:** Wait for HouseFinder to respond before showing the user a confirmation.

**Why it's wrong:** HouseFinder is on Azure with variable cold-start latency. A timeout or error on HouseFinder degrades the experience for the homeowner filling out the form — who did nothing wrong.

**Do this instead:** Show success after Netlify responds (fast, same-origin). Fire HouseFinder POST as fire-and-forget. If it fails, the Netlify record is the safety net.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Netlify Forms | Same-origin POST to "/" with `application/x-www-form-urlencoded` | Platform intercepts before it hits Next.js. Must use `data-netlify="true"` and `name` attribute on form. |
| HouseFinder `/api/leads` | Cross-origin HTTPS POST with JSON + `x-api-key` header | Must handle OPTIONS preflight. Allowlist `no-bshomes.com` explicitly. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| ContactForm.tsx → Netlify | HTTP POST to own origin | Handled by platform, no changes needed |
| ContactForm.tsx → HouseFinder | HTTP POST, cross-origin, JSON | Requires CORS config on HouseFinder; API key in env var |
| HouseFinder route → DB | Drizzle ORM insert | Server-side only, no exposure risk |

## Suggested Build Order

The component graph has one hard dependency: HouseFinder's `/api/leads` endpoint must exist before the marketing site's dual-submit can be wired up. Everything else is parallel.

```
1. HouseFinder: Create Zod validation schema (lib/validations/lead-submission.ts)
   ↓
2. HouseFinder: Create POST /api/leads route handler
   ↓
3. HouseFinder: Set WEBSITE_LEAD_API_KEY env var on Azure
   ↓ (parallel with 3)
4. No BS Homes: Set NEXT_PUBLIC_HOUSEFINDER_API_URL + NEXT_PUBLIC_HOUSEFINDER_API_KEY on Netlify
   ↓
5. No BS Homes: Update ContactForm.tsx to add second fetch() call
   ↓
6. End-to-end test: submit form, verify lead appears in HouseFinder dashboard with leadSource: "website"
```

## Sources

- Next.js 15 CORS patterns: [Handling Common CORS Errors in Next.js 15 - Wisp CMS](https://www.wisp.blog/blog/handling-common-cors-errors-in-nextjs-15) — MEDIUM confidence (WebSearch, verified against official discussion threads)
- Next.js Route Handler CORS discussion: [GitHub Discussion #47933](https://github.com/vercel/next.js/discussions/47933) — MEDIUM confidence
- Netlify Forms AJAX submission: [Netlify Forms Docs](https://docs.netlify.com/manage/forms/setup/) — HIGH confidence (official docs)
- API key security: [Next.js Security Guide - TurboStarter](https://www.turbostarter.dev/blog/complete-nextjs-security-guide-2025-authentication-api-protection-and-best-practices) — MEDIUM confidence
- Idempotency and retry: [Idempotency in APIs - DEV Community](https://dev.to/fazal_mansuri_/idempotency-in-apis-why-your-retry-logic-can-break-everything-and-how-to-fix-it-345k) — LOW confidence (single source, pattern is well-established)
- Drizzle ORM insert pattern: [Next.js 15 + Drizzle ORM - Medium](https://medium.com/@aslandjc7/next-js-15-drizzle-orm-a-beginners-guide-to-crud-operations-ae7f2701a8c3) — MEDIUM confidence (verified against Drizzle official docs structure)

---
*Architecture research for: No BS Homes — HouseFinder lead ingestion bridge*
*Researched: 2026-04-05*
