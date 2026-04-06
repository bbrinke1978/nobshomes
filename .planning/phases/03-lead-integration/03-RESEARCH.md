# Phase 3: Lead Integration - Research

**Researched:** 2026-04-05
**Domain:** Cross-codebase API integration — Next.js route handler, Drizzle ORM migration, dual-submit form
**Confidence:** HIGH (schema directly inspected; stack verified from package.json; patterns from official Next.js docs)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEAD-01 | HouseFinder exposes POST /api/leads endpoint accepting name, phone, email, address, message | HouseFinder has no /api/leads yet; App Router route handler pattern is well-established. Email is NOT in the current form — see field mapping below. |
| LEAD-02 | HouseFinder /api/leads creates a lead record with leadSource: "website" | `"website"` is already in LEAD_SOURCES in types/index.ts. DB insert pattern via Drizzle confirmed in actions.ts. Requires nullable propertyId migration first. |
| LEAD-03 | HouseFinder /api/leads validates input and returns appropriate error responses | Zod v4.3.6 is installed; project already uses `z.object()`, `safeParse`, and `z.uuid()` pattern in actions.ts. |
| LEAD-04 | HouseFinder /api/leads authenticates requests via API key | No API key infrastructure exists yet. Must choose header format and add env var. Research resolves the Bearer vs x-api-key blocker. |
| LEAD-05 | No BS Homes form submits to both Netlify Forms and HouseFinder API | Current form POSTs to "/" (broken for Netlify in Next.js 15). Needs `public/__forms.html` + POST target fix + second fetch to proxy route. |
| LEAD-06 | HouseFinder API failure does not block form submission success for the user | Fire-and-forget pattern: show success after Netlify responds, HouseFinder call is `.catch(() => {})`. |
| LEAD-07 | Website lead appears in HouseFinder dashboard with "Website" source badge | `leadSource: "website"` already maps to blue "Website" badge in property-card.tsx and dashboard. No UI changes needed — data layer is the only gap. |
</phase_requirements>

---

## Summary

This phase bridges two codebases: HouseFinder (Azure, Next.js 15) receives a new `/api/leads` route handler, and No BS Homes (Netlify, Next.js 15) gets a dual-submit form. The work is small but has one hard blocker: the `leads` table in HouseFinder has `propertyId` as `NOT NULL UNIQUE`, which means any insert without a property record fails at the database level. This must be addressed with a Drizzle migration before the endpoint can accept website leads.

Both codebases run Next.js 15 App Router. HouseFinder already has Zod v4.3.6 installed and uses the `zod/v4` import path (note: not `zod` — check the actions.ts import). The `"website"` lead source value is already defined in the type system and renders as a blue badge in the existing dashboard — no frontend UI changes are needed on the HouseFinder side. The entire HouseFinder change is: one migration file, one Zod schema, one route handler.

On the No BS Homes side, the current `ContactForm.tsx` already POSTs to `"/"` with URL-encoded body, which is close to the Netlify Forms pattern — but it needs to be re-pointed to `/__forms.html` (the static shadow file that Netlify's build scanner detects in Next.js 15 App Router). A second fire-and-forget fetch to a server-side proxy route at `/api/submit-lead` keeps the API key off the client bundle.

**Primary recommendation:** Do the HouseFinder migration and endpoint first, verify it with `curl`, then wire the No BS Homes form. Never expose the API key client-side.

---

## Critical Blocker: propertyId Is NOT NULL

**Finding (HIGH confidence — directly read from schema.ts):**

```typescript
// housefinder/app/src/db/schema.ts line 116-119
propertyId: uuid("property_id")
  .notNull()      // ← blocks website leads
  .unique()       // ← also blocks multiple website leads for same property
  .references(() => properties.id),
```

This means:
1. Any `db.insert(leads).values({ ... })` without a `propertyId` will throw a PostgreSQL NOT NULL violation.
2. The `.unique()` constraint also means two leads from the same property can't coexist — but for website leads with no property, null is the right value anyway.

**Resolution:** Write a Drizzle migration to make `property_id` nullable. The `deals` table in the same schema already uses a nullable FK pattern for reference:

```typescript
// deals table — shows the nullable FK pattern in this codebase
propertyId: uuid("property_id").references(() => properties.id), // nullable — no .notNull()
```

The migration SQL is:
```sql
ALTER TABLE "leads" ALTER COLUMN "property_id" DROP NOT NULL;
```

The `UNIQUE` constraint can stay — multiple website leads don't share a propertyId (they're all null, and PostgreSQL treats each NULL as distinct for unique indexes).

---

## Standard Stack

### Core (No New Dependencies)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Next.js | 15.5.13 (both repos) | App Router route handlers | Already in both projects |
| Drizzle ORM | ^0.45.1 (HouseFinder) | DB insert for new lead record | Already in HouseFinder |
| Zod | ^4.3.6 (HouseFinder) | Input validation on /api/leads | Already installed; use `zod/v4` import |
| `pg` (node-postgres) | ^8.20.0 (HouseFinder) | DB connection pool | Already in HouseFinder |

### No New Packages Required

Neither codebase needs new dependencies. Everything needed is already installed.

**Installation:**
```bash
# No npm install needed in either repo
```

### Zod v4 Import Note

HouseFinder's `actions.ts` uses `zod/v4` (not `zod`):

```typescript
import { z } from "zod/v4";
```

All new code in HouseFinder MUST use this same import path. Mixing `zod` and `zod/v4` in the same project causes type errors.

---

## Architecture Patterns

### Recommended Project Structure

**HouseFinder changes (new files only):**
```
app/
└── src/
    └── app/
        └── api/
            └── leads/
                └── route.ts        # New: POST /api/leads external ingest handler
    └── db/
        └── migrations/
            └── 0007_nullable_lead_property_id.sql  # New: DROP NOT NULL on property_id
```

**No BS Homes changes:**
```
src/
└── app/
    └── api/
        └── submit-lead/
            └── route.ts            # New: server-side proxy to HouseFinder
public/
└── __forms.html                    # New: static shadow form for Netlify scanner
src/
└── components/
    └── ContactForm.tsx             # Modify: add second fetch, fix POST target
```

### Pattern 1: Drizzle Migration for Nullable propertyId

**What:** A new SQL migration that drops the NOT NULL constraint on the `property_id` column of the `leads` table.

**When to use:** Must run before any code that inserts a website lead.

**Example:**
```sql
-- drizzle/0007_nullable_lead_property_id.sql
ALTER TABLE "leads" ALTER COLUMN "property_id" DROP NOT NULL;
```

Run with:
```bash
npx drizzle-kit push
# or if using migration files:
npx drizzle-kit migrate
```

Also update the Drizzle schema definition to match:
```typescript
// db/schema.ts — leads table
propertyId: uuid("property_id")
  // Remove .notNull() — keep .unique() and .references()
  .unique()
  .references(() => properties.id),
```

### Pattern 2: HouseFinder POST /api/leads Route Handler

**What:** A standalone Next.js route handler that accepts external lead submissions, validates via Zod, and inserts to the `leads` table. Does NOT require auth session — uses API key header instead.

**Key decisions:**
- Use `x-api-key` header (not `Authorization: Bearer`) — cleaner for machine-to-machine calls and avoids any confusion with the existing NextAuth session token
- Origin check is informational only (server-to-server call doesn't send Origin header) — rely on API key as the primary auth mechanism
- Set `propertyId: null`, `status: "new"`, `leadSource: "website"`, `isHot: false`, `alertSent: false`, `distressScore: 0`
- The `notes` field in the DB maps to the form's `message` field

**Field mapping (form → DB):**
| Form field | DB column | Notes |
|------------|-----------|-------|
| name | *(no name column in leads table)* | See below — name goes to leadNotes or a separate mechanism |
| phone | *(no phone column in leads table)* | See below |
| address | *(no address column in leads table)* | See below |
| message | notes | Via leadNotes insert |
| — | leadSource | Hardcoded: "website" |
| — | propertyId | null (requires migration) |
| — | status | "new" |

**CRITICAL FINDING:** The `leads` table does NOT have `name`, `phone`, or `address` columns. These fields belong to associated records:
- `ownerContacts` table has `phone` and `email` (linked via `propertyId`)
- `properties` table has `address`
- `leadNotes` table has free-text `noteText`

This means a website lead without a property record has no natural home for name/phone/address in the current schema. Options:
1. **Recommended:** Store name/phone/address as a structured `leadNote` (e.g., `noteText: "Website lead: John Smith | 435-555-1234 | 123 Main St"`). The team can then manually create a property/deal from the lead detail view.
2. Alternative: Create a stub `properties` record first, then create the lead with that `propertyId`. This is complex and pollutes the properties table.
3. Alternative: Add name/phone/address columns to the `leads` table via migration. Clean but adds scope to this phase.

**Recommendation: Option 1** (structured leadNote). It requires no additional schema changes beyond the nullable `propertyId` migration, and the data is visible in the HouseFinder lead detail view immediately. The team's workflow is manual follow-up anyway.

**Example:**
```typescript
// housefinder/app/src/app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/db/client";
import { leads, leadNotes } from "@/db/schema";

const WebLeadSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(7).max(30),
  address: z.string().min(5).max(500),
  message: z.string().max(2000).optional().default(""),
});

export async function POST(request: NextRequest) {
  // 1. API key auth
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.WEBSITE_LEAD_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. Validate
  const parsed = WebLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  // 4. Insert lead (propertyId is null — requires migration)
  const [lead] = await db
    .insert(leads)
    .values({
      propertyId: null,         // nullable after migration
      leadSource: "website",
      status: "new",
      newLeadStatus: "new",
      distressScore: 0,
      isHot: false,
      alertSent: false,
    })
    .returning({ id: leads.id });

  // 5. Store contact info as a structured note
  const noteText = [
    `Name: ${parsed.data.name}`,
    `Phone: ${parsed.data.phone}`,
    `Address: ${parsed.data.address}`,
    parsed.data.message ? `Message: ${parsed.data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await db.insert(leadNotes).values({
    leadId: lead.id,
    noteText,
    noteType: "user",
  });

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
```

**Environment variable on Azure:**
```
WEBSITE_LEAD_API_KEY=<generate with crypto.randomUUID() or openssl rand -hex 32>
```

### Pattern 3: No BS Homes Proxy Route

**What:** A server-side Next.js route handler at `/api/submit-lead` that reads the HouseFinder API key from `process.env` (never `NEXT_PUBLIC_`) and forwards the form payload to HouseFinder.

**Why a proxy instead of direct client call:** The API key must not appear in the browser JS bundle. A server-side route handler is the only way to keep it server-side on Netlify.

**Example:**
```typescript
// nobshomes/src/app/api/submit-lead/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(
    `${process.env.HOUSEFINDER_API_URL}/api/leads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.HOUSEFINDER_API_KEY!,
      },
      body: JSON.stringify({
        name: body.name,
        phone: body.phone,
        address: body.address,
        message: body.message ?? "",
      }),
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Lead creation failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
```

**Environment variables on Netlify (no NEXT_PUBLIC_ prefix):**
```
HOUSEFINDER_API_URL=https://housefinder-app.azurewebsites.net
HOUSEFINDER_API_KEY=<same value as WEBSITE_LEAD_API_KEY on Azure>
```

### Pattern 4: Dual-Submit ContactForm.tsx

**What:** Update the existing `handleSubmit` to: (1) POST URL-encoded to `/__forms.html` for Netlify, then (2) POST JSON to `/api/submit-lead` as fire-and-forget.

**Current state:** Form POSTs to `"/"` — this targets the page itself, not the Netlify Forms static file. Works in some Netlify setups but is the wrong target for Next.js 15 App Router. Must be `/__forms.html`.

**Key logic:**
- Show success immediately after Netlify responds (fast, same-origin)
- Fire HouseFinder proxy call with `.catch(() => {})` — never block UX on it
- If Netlify fails, block and show error (Netlify failure is the real failure)

```typescript
// src/components/ContactForm.tsx — updated handleSubmit
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setSubmitting(true);
  setError(null);

  const form = e.currentTarget;
  const formData = new FormData(form);

  try {
    // Step 1: Netlify Forms backup capture
    const netlifyRes = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(
        formData as unknown as Record<string, string>
      ).toString(),
    });

    if (!netlifyRes.ok) {
      setError("Something went wrong. Please call us instead.");
      return;
    }

    // Step 2: HouseFinder API — fire and forget
    fetch("/api/submit-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        message: formData.get("message") ?? "",
      }),
    }).catch(() => {
      // Silent — Netlify is the safety net
    });

    setSubmitted(true);
  } catch {
    setError("Something went wrong. Please call us instead.");
  } finally {
    setSubmitting(false);
  }
}
```

### Pattern 5: Netlify Shadow Form (public/__forms.html)

**What:** A static HTML file that Netlify's build scanner reads at deploy time to discover form definitions. Required for Next.js 15 App Router — React components are not statically analyzed.

**Field names must exactly match** the `name` attributes in `ContactForm.tsx`:

```html
<!-- public/__forms.html -->
<form name="contact" netlify netlify-honeypot="bot-field" hidden>
  <input type="text" name="form-name" />
  <input type="text" name="name" />
  <input type="tel" name="phone" />
  <input type="text" name="address" />
  <textarea name="message"></textarea>
</form>
```

**Note:** `form-name` input is required when using AJAX submission to tell Netlify which form definition to match.

### Anti-Patterns to Avoid

- **NEXT_PUBLIC_ API key:** Using `NEXT_PUBLIC_HOUSEFINDER_API_KEY` exposes the secret in the browser bundle. Anyone visiting the site can read it in DevTools > Sources.
- **Direct browser call to HouseFinder:** Calling HouseFinder directly from `ContactForm.tsx` (a client component) exposes the key and requires CORS configuration on Azure. The proxy route eliminates both problems.
- **Authorization: Bearer format:** ARCHITECTURE.md shows `x-api-key` as the chosen format. STACK.md shows `Authorization: Bearer`. Use `x-api-key` — it is the explicit non-session-token pattern that avoids any conflict with NextAuth's `Authorization` header handling.
- **Blocking UX on HouseFinder:** Never `await` the HouseFinder call before setting `submitted = true`. Azure App Service has variable cold-start latency.
- **CORS config in both Azure portal AND route handler:** Azure platform CORS silently overrides code-level CORS. Pick one layer — use the OPTIONS export in the route handler and leave the Azure portal CORS settings empty.
- **Inserting a stub property record:** Creates garbage in the properties table and introduces FK complexity. Use a structured leadNote instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Input validation | Custom type checks | Zod (already installed, `zod/v4` import) | Edge cases in string length, type coercion, error formatting |
| API key generation | UUID or short string | `openssl rand -hex 32` or `crypto.randomUUID()` | Entropy matters; short keys are brute-forceable |
| Netlify form detection for Next.js | Custom form scan workaround | `public/__forms.html` static shadow file (official pattern) | Any other approach silently fails in production |
| DB connection | New pool instance | Import `db` from `@/db/client` (already exists) | The pool is already configured with SSL and max connections |

**Key insight:** Every tool needed for this phase already exists in one or both codebases. The risk is in integration details (schema constraint, import paths, header naming) not in missing infrastructure.

---

## Common Pitfalls

### Pitfall 1: propertyId NOT NULL Blocks Insert at Runtime

**What goes wrong:** The migration is forgotten or run after deploying the endpoint. Every test submission returns HTTP 500 with a PostgreSQL NOT NULL violation.

**Why it happens:** The schema constraint is enforced at the database level, not the application level. Drizzle doesn't fail at compile time — only at insert time.

**How to avoid:** The migration MUST be the first task in the HouseFinder work. Verify with `curl` before building the form integration.

**Warning signs:** `db.insert(leads)` returns an error containing `null value in column "property_id" violates not-null constraint`.

### Pitfall 2: Netlify Forms POST Target is "/" Not "/__forms.html"

**What goes wrong:** Form submissions are silently dropped — Netlify UI shows zero submissions. The current ContactForm.tsx already uses `"/"` as the POST target, which only works on traditionally static Netlify sites, not Next.js 15 App Router.

**Why it happens:** The `"/"` target hits the Next.js route handler for the homepage, not Netlify's form interceptor. Netlify's interceptor only fires on requests to `/__forms.html` in App Router mode.

**How to avoid:** Change the POST target from `"/"` to `"/__forms.html"` AND create `public/__forms.html`.

**Warning signs:** Netlify Forms dashboard shows 0 submissions after deploy. No build error — it fails silently.

### Pitfall 3: Zod Import Path Mismatch in HouseFinder

**What goes wrong:** New code imports from `"zod"` while existing code imports from `"zod/v4"`. TypeScript type errors appear when passing Zod schemas or error types between modules.

**Why it happens:** Zod v4 changed the package export structure. The project chose `"zod/v4"` consistently. New files that use `"zod"` get a different version of the API.

**How to avoid:** Copy the import from `actions.ts`: `import { z } from "zod/v4";` — every file.

**Warning signs:** TypeScript errors on `.issues`, `.error.issues`, or schema inference that mention incompatible types between modules.

### Pitfall 4: Azure Portal CORS Conflicts with Route Handler CORS

**What goes wrong:** The OPTIONS handler in `route.ts` returns correct headers, but browser requests still fail with a CORS error. The Azure App Service portal CORS configuration is taking precedence and overriding the route handler response headers.

**Why it happens:** Azure's platform-level CORS (configured via portal or `az webapp cors`) intercepts requests before they reach the Next.js runtime. If Azure platform CORS is configured, its response headers win — even if they're wrong or incomplete.

**How to avoid:** Check the Azure App Service portal > CORS settings before adding the OPTIONS handler. If any origins are listed there, clear them. Choose one layer: either Azure portal CORS OR route handler CORS, not both.

**Warning signs:** Postman succeeds but browser fails. OPTIONS returns 200 but without the expected headers. The Access-Control-Allow-Origin header is missing or wrong despite correct code.

### Pitfall 5: name/phone/address Have No Columns in the leads Table

**What goes wrong:** Developer writes an insert like `db.insert(leads).values({ name: ..., phone: ..., address: ... })` and Drizzle/TypeScript reports unknown columns.

**Why it happens:** The `leads` table was designed for property-sourced leads where name is in `ownerContacts`, phone is in `ownerContacts`, and address is in `properties`. Website leads have no associated property record.

**How to avoid:** Store contact details in a `leadNotes` row immediately after the lead insert. The structured format (one field per line) is readable in the existing HouseFinder lead detail view.

**Warning signs:** TypeScript error: `Argument of type '{ name: string; ... }' is not assignable to parameter of type 'InsertLead'`.

### Pitfall 6: UNIQUE Constraint on propertyId Blocks Multiple NULL Inserts

**What goes wrong:** After making `propertyId` nullable, two website lead submissions fail on the second insert because PostgreSQL rejects duplicate values in a UNIQUE column — even if the value being inserted is NULL.

**Why it happens:** Standard SQL: `NULL != NULL`, so unique constraints treat each NULL as distinct. PostgreSQL follows this standard. However, some databases (and some PostgreSQL configurations) may behave differently.

**Resolution:** PostgreSQL standard behavior is that multiple NULLs are allowed in a unique column. Confirmed by SQL standard and PostgreSQL documentation. The UNIQUE constraint on `property_id` does NOT block multiple NULL inserts in PostgreSQL.

**Confidence:** HIGH — this is standard PostgreSQL behavior per official PostgreSQL docs.

---

## Code Examples

### HouseFinder: Full Route Handler
```typescript
// Source: Direct schema inspection + Drizzle docs pattern
// housefinder/app/src/app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { db } from "@/db/client";
import { leads, leadNotes } from "@/db/schema";

const WebLeadSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(7).max(30),
  address: z.string().min(5).max(500),
  message: z.string().max(2000).optional().default(""),
});

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.WEBSITE_LEAD_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = WebLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 }
    );
  }

  const [lead] = await db
    .insert(leads)
    .values({
      propertyId: null,
      leadSource: "website",
      status: "new",
      newLeadStatus: "new",
      distressScore: 0,
      isHot: false,
      alertSent: false,
    })
    .returning({ id: leads.id });

  const noteText = [
    `Name: ${parsed.data.name}`,
    `Phone: ${parsed.data.phone}`,
    `Address: ${parsed.data.address}`,
    parsed.data.message ? `Message: ${parsed.data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await db.insert(leadNotes).values({
    leadId: lead.id,
    noteText,
    noteType: "user",
  });

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
```

### HouseFinder: Drizzle Schema Update
```typescript
// Source: Direct schema inspection of db/schema.ts
// Change in the leads table definition — remove .notNull()
propertyId: uuid("property_id")
  .unique()
  .references(() => properties.id),
  // .notNull() removed — allows website leads with no property
```

### curl Test Command
```bash
# Test HouseFinder endpoint directly before wiring the form
curl -X POST https://housefinder-app.azurewebsites.net/api/leads \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY_HERE" \
  -d '{"name":"Test User","phone":"435-555-1234","address":"123 Main St, Price, UT","message":"Test submission"}'
# Expected: {"ok":true,"leadId":"<uuid>"}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Netlify Forms via React component `data-netlify` | `public/__forms.html` shadow file + POST to `/__forms.html` | Required for Next.js 15 App Router — old approach causes silent failure |
| `import { z } from "zod"` | `import { z } from "zod/v4"` | Zod v4 uses subpath export; mixing causes type incompatibility in same project |
| `Authorization: Bearer` for API keys | `x-api-key` header for non-session machine-to-machine auth | Cleaner separation from NextAuth's Authorization header; simpler validation |

---

## Open Questions

1. **Should name/phone/address columns be added to the leads table?**
   - What we know: The current schema has no such columns; contact details live in `ownerContacts` (which requires a `propertyId` FK). The structured leadNote approach works for the current manual workflow.
   - What's unclear: Whether the team wants website leads to be queryable/filterable by name or phone in HouseFinder.
   - Recommendation: Use the structured leadNote for Phase 3 to keep scope minimal. File a follow-up to add dedicated columns if the team wants to search/filter by contact info.

2. **Does HouseFinder's Azure App Service have any CORS entries in the portal?**
   - What we know: STATE.md flags this as a blocker to check before writing any OPTIONS handler.
   - What's unclear: Current Azure portal CORS state — requires checking the Azure portal directly.
   - Recommendation: First step in HouseFinder work is to open Azure portal > App Service > CORS and confirm the list is empty. If populated, clear it before adding the OPTIONS handler in code.

3. **Which environment is used for testing — local dev or staging?**
   - What we know: Both repos use Next.js 15 with local dev via `npm run dev`. The HouseFinder endpoint requires DATABASE_URL to be set for local testing.
   - What's unclear: Whether HouseFinder has a staging environment on Azure or only production.
   - Recommendation: Test with `curl` against the production Azure URL after deploying, not against localhost (avoids local DB connection complexity and confirms the real environment).

---

## Sources

### Primary (HIGH confidence)
- `housefinder/app/src/db/schema.ts` — Direct schema inspection: confirmed `propertyId` is `.notNull().unique()` on leads table
- `housefinder/app/src/types/index.ts` — Direct inspection: `"website"` is in `LEAD_SOURCES` with blue color badge
- `housefinder/app/package.json` — Direct inspection: Zod `^4.3.6` installed
- `housefinder/app/src/lib/actions.ts` — Direct inspection: `import { z } from "zod/v4"` is the project convention
- `housefinder/app/src/db/client.ts` — Direct inspection: `db` export, Pool config, import path `@/db/client`
- `nobshomes/src/components/ContactForm.tsx` — Direct inspection: 4 fields (name, phone, address, message), POST to "/", existing state management pattern
- [OpenNext.js — Using Netlify Forms with Next.js](https://opennext.js.org/netlify/forms) — `public/__forms.html` required for App Router (cited in STACK.md as HIGH confidence)
- [Next.js: Building APIs with Next.js](https://nextjs.org/blog/building-apis-with-nextjs) — Route handler patterns (cited in STACK.md as HIGH confidence)

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` — Proxy route pattern, env var naming, Bearer vs x-api-key (verified by direct code inspection of HouseFinder)
- `.planning/research/ARCHITECTURE.md` — System diagram, build order, CORS pattern
- `.planning/research/PITFALLS.md` — Azure CORS conflict, propertyId blocker, API key client bundle risk
- [Microsoft Learn — CORS on Azure App Service](https://learn.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-rest-api) — Platform CORS overrides code CORS (cited as HIGH confidence in PITFALLS.md)
- [PostgreSQL Docs — Unique Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS) — NULLs are treated as distinct values in unique indexes

---

## Metadata

**Confidence breakdown:**
- Schema findings (propertyId, leads columns, Zod import): HIGH — directly read from source files
- Route handler pattern: HIGH — consistent with existing HouseFinder API routes and official Next.js docs
- Netlify Forms shadow file: HIGH — official Netlify/OpenNext docs
- CORS resolution strategy: MEDIUM — Azure portal state is unknown until checked
- leadNote approach for contact fields: MEDIUM — functional but may not satisfy future querying needs

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (stable stack; main risk is schema drift if HouseFinder is actively developed)
