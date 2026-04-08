# Admin Portal Implementation Research

**Project:** No BS Homes — Phase 7
**Researched:** 2026-04-05
**Overall confidence:** HIGH (most claims verified with official docs or multiple sources)

---

## Project Context

The existing site uses Next.js 15.5, React 19, Tailwind CSS 4, and lucide-react. No component library, no ORM, no auth. Phase 6 wired up static content: gallery via `gallery-data.ts`, blog via markdown files in `content/blog/`, and testimonials hardcoded in `page.tsx`. Phase 7 converts all three to database-backed content and adds an authenticated admin portal to manage them.

---

## 1. NextAuth v5 (Auth.js) on Netlify

### Status: Beta but production-ready

Auth.js v5 remains in beta as of April 2026, but the core APIs are stable and widely used in production. The "beta" label reflects ongoing API refinements, not instability. Multiple sources (community, Medium, DEV Community) confirm it's the actively maintained version with v4 receiving no new features. Use it.

Install:
```bash
npm install next-auth@beta
```

### File layout for App Router

```
src/
  auth.ts              # core config, exported auth/handlers/signIn/signOut
  middleware.ts        # route protection
  app/api/auth/[...nextauth]/route.ts  # route handler
```

**auth.ts — minimal Google OAuth + JWT + email allowlist:**
```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAILS = [
  "brian@no-bshomes.com",
  "shawn@no-bshomes.com",
];

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      return ALLOWED_EMAILS.includes(user.email ?? "");
    },
    async jwt({ token, account }) {
      return token;
    },
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
```

**app/api/auth/[...nextauth]/route.ts:**
```typescript
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

**middleware.ts — protect all /admin/* routes:**
```typescript
import { auth } from "@/auth";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/admin")) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

**Important:** The middleware is a first line of defense for UX, but every `/api/admin/*` route must also call `auth()` server-side and reject unauthenticated requests with 401. Middleware alone is not sufficient security.

### Session strategy: JWT (no database)

Use `session: { strategy: "jwt" }`. This stores the session in an encrypted cookie. No `sessions` table needed in the database. Correct choice for this project — the only session-related data needed is the user's email, which fits comfortably in a JWT.

### Email allowlist pattern

The `signIn` callback returning `false` aborts the OAuth flow and redirects to the error page. The `ALLOWED_EMAILS` array can start as a hardcoded constant; if the list grows later, move it to an env var (`ADMIN_EMAILS=brian@...,shawn@...`).

### Environment variables required

| Variable | Source | Notes |
|----------|--------|-------|
| `AUTH_SECRET` | Generate: `npx auth secret` or `openssl rand -base64 33` | Must be 32+ chars |
| `AUTH_GOOGLE_ID` | Google Cloud Console → OAuth 2.0 credentials | |
| `AUTH_GOOGLE_SECRET` | Google Cloud Console → OAuth 2.0 credentials | |
| `AUTH_TRUST_HOST` | Set to `true` on Netlify | Required behind reverse proxy |

**Note on naming:** Auth.js v5 uses `AUTH_SECRET` (not `NEXTAUTH_SECRET`) and `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` (not `GOOGLE_CLIENT_ID`). The old v4 names still work as fallbacks but prefer the new convention.

**Note on `AUTH_URL`:** In v5, `AUTH_URL` is mostly unnecessary — the library infers the host from request headers. Only needed if your app uses a non-root base path. Do NOT set it on Netlify unless you have a specific reason; the old `NEXTAUTH_URL` can cause redirect loops on preview deploys.

### Netlify gotchas

- **`AUTH_TRUST_HOST=true` is required.** Netlify is a reverse proxy. Without this, Auth.js can't determine the correct host for redirect URLs and callback URLs will break.
- **Separate OAuth apps for dev and production.** Google OAuth allows only one set of authorized redirect URIs per client. Create two Google OAuth clients: one for `localhost:3000` and one for `no-bshomes.com`. Store different `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` in dev vs Netlify env vars.
- **Preview deployments.** Netlify preview deploy URLs (e.g., `deploy-preview-42--nobshomes.netlify.app`) won't match the authorized redirect URIs in Google Cloud Console. This is only an issue if you need to test OAuth on preview deploys. For this project, admin testing on `localhost` + production is sufficient.
- **Edge function regex warnings.** Netlify may emit warnings about "unsupported regular expressions" in middleware during Edge Function packaging. These are typically harmless but can cause confusion. Monitor Netlify build logs after first deploy.
- **Serverless cold start.** The `/api/auth/*` routes run as Netlify serverless functions. Cold start latency on first login can be 1-3 seconds, but this is acceptable for an admin portal.

### CSRF protection

Auth.js v5 includes built-in CSRF protection on all `POST` endpoints (`/api/auth/*`). No additional CSRF setup needed.

### Google Cloud Console setup

1. Create project at console.cloud.google.com
2. APIs & Services → Credentials → Create OAuth client ID → Web application
3. Authorized JavaScript origins: `https://no-bshomes.com`
4. Authorized redirect URIs: `https://no-bshomes.com/api/auth/callback/google`
5. For dev: second client with `http://localhost:3000/api/auth/callback/google`
6. OAuth consent screen: External type, add `brian@no-bshomes.com` and `shawn@no-bshomes.com` as test users (while in "Testing" mode, only listed users can sign in — publish if needed)

**Confidence: HIGH** — Official Auth.js docs + multiple verified community sources.

---

## 2. Azure Blob Storage from Netlify

### Pattern: SAS URL (server generates, client uploads directly)

**Do NOT upload images through the Next.js API route.** Netlify serverless functions have a ~6MB request body limit, and processing image bytes in a serverless function is wasteful and slow. The correct pattern:

1. Client picks file with `react-dropzone`
2. Client sends filename + content-type to `/api/admin/upload-url` (tiny request)
3. API route generates a time-limited SAS URL with write-only permissions (server holds the storage account key, never exposed to client)
4. Client uses the SAS URL to `PUT` the file directly to Azure Blob Storage
5. Client saves the permanent blob URL in the database (via another API call)

### Dependencies

```bash
npm install @azure/storage-blob
```

Current version: `@azure/storage-blob@12.x` (12.27.0 as of early 2026).

### Server-side SAS URL generation (API route)

```typescript
// src/app/api/admin/upload-url/route.ts
import { auth } from "@/auth";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

export async function POST(req: Request) {
  // Auth check — middleware is not enough for API routes
  const session = await auth();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { filename, contentType } = await req.json();
  const ext = filename.split(".").pop();
  const blobName = `gallery/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;

  const credential = new StorageSharedKeyCredential(account, accountKey);
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    credential
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"), // create + write
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      contentType,
    },
    credential
  ).toString();

  const sasUrl = `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`;
  const permanentUrl = containerClient.getBlockBlobClient(blobName).url;

  return Response.json({ sasUrl, permanentUrl, blobName });
}
```

**Client-side upload (in the upload component):**
```typescript
// After receiving sasUrl and permanentUrl from /api/admin/upload-url
const uploadRes = await fetch(sasUrl, {
  method: "PUT",
  headers: {
    "x-ms-blob-type": "BlockBlob",
    "Content-Type": file.type,
  },
  body: file,
});
// Then save permanentUrl to database
```

**Critical gotcha:** The `x-ms-blob-type: BlockBlob` header is mandatory. Azure rejects PUT requests without it with a cryptic 400 error.

### Environment variables for Azure Storage

| Variable | Value |
|----------|-------|
| `AZURE_STORAGE_ACCOUNT_NAME` | Storage account name (e.g., `nbshomesstorage`) |
| `AZURE_STORAGE_ACCOUNT_KEY` | Primary key from Azure portal |
| `AZURE_STORAGE_CONTAINER_NAME` | e.g., `gallery` |

### Azure Storage account setup

1. Create storage account (or use existing one on the HouseFinder Azure subscription)
2. Create blob container named `gallery`
3. Set container access level to **"Blob (anonymous read access for blobs only)"** — this allows public URL access to served images without authentication
4. Configure CORS on the storage account:

```json
{
  "allowedOrigins": ["https://no-bshomes.com", "http://localhost:3000"],
  "allowedMethods": ["GET", "HEAD", "PUT", "OPTIONS"],
  "allowedHeaders": ["*"],
  "exposedHeaders": ["x-ms-blob-type"],
  "maxAgeInSeconds": 3600
}
```

CORS is set per-service (Blob service), not per-container. Use Azure Portal → Storage account → Settings → Resource sharing (CORS), or Azure CLI:
```bash
az storage cors add \
  --services b \
  --methods GET HEAD PUT OPTIONS \
  --origins "https://no-bshomes.com" "http://localhost:3000" \
  --allowed-headers "*" \
  --exposed-headers "x-ms-blob-type" \
  --max-age 3600 \
  --account-name <your-account>
```

### Image serving

Blob URLs are permanent and publicly readable once CORS and container access are configured. Format: `https://<account>.blob.core.windows.net/<container>/<blobname>`.

**CDN:** Azure CDN can front the blob storage for global edge caching, but it requires additional configuration and a CDN profile. For this project's traffic volume, serving directly from blob storage is sufficient and simpler. Next.js Image component can optimize the images at the edge (Netlify Image CDN) if you configure `next.config.ts` to allow the Azure blob domain:

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.blob.core.windows.net",
      },
    ],
  },
};
```

### What storage account exists?

The project context mentions HouseFinder is on Azure. Run to find existing storage accounts:
```bash
az storage account list --output table
```
If an existing account is on the same subscription, use it (add a new container). If not, create a new free-tier storage account. Azure Blob Storage pricing for this volume (dozens of images) is negligible (<$1/month).

**Confidence: HIGH** — Official Azure docs, verified SAS generation code from Microsoft Learn.

---

## 3. Drizzle ORM connecting to HouseFinder's PostgreSQL

### Package

```bash
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

### Client setup

```typescript
// src/lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }, // required for Azure PostgreSQL
  max: 3,         // CRITICAL: keep low for serverless (see below)
  idleTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool });
```

**Why `max: 3`:** Netlify can run many function instances concurrently. Each instance creates its own pool. If max is 10 (default) and 20 instances are running, that's 200 connections to PostgreSQL. Azure PostgreSQL's default max is 100 connections. Setting `max: 3` keeps peak connection usage manageable. For this admin portal (low traffic), this is not a real concern — admins are 2 people. Still, set it low as good practice.

### Connection string on Netlify

Set `DATABASE_URL` in Netlify environment variables (Site settings → Environment variables). Format:
```
postgresql://username:password@hostname:5432/dbname?sslmode=require
```

This is the same connection string used by HouseFinder. Retrieve it from Azure Key Vault or ask Brian.

### Schema strategy: separate file, `nbs_` prefix, same database

The cleanest approach: define only the new tables in `nobshomes`, coexist with HouseFinder's tables by prefixing all new tables with `nbs_`. Do not introspect or re-define HouseFinder's tables in nobshomes — there is no need to reference them.

```typescript
// src/lib/schema.ts
import {
  pgTable, serial, text, integer, boolean, timestamp, index
} from "drizzle-orm/pg-core";

export const nbsBlogPosts = pgTable("nbs_blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(), // HTML from TipTap
  excerpt: text("excerpt").notNull().default(""),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  slugIdx: index("nbs_blog_posts_slug_idx").on(t.slug),
}));

export const nbsTestimonials = pgTable("nbs_testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull().default(""),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  displayOrder: integer("display_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nbsGalleryImages = pgTable("nbs_gallery_images", {
  id: serial("id").primaryKey(),
  blobUrl: text("blob_url").notNull(),
  alt: text("alt").notNull().default(""),
  projectName: text("project_name").notNull().default(""),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Migration strategy

**Who runs migrations:** nobshomes manages its own schema subset. HouseFinder manages its own tables. The `nbs_` prefix guarantees no collisions.

**drizzle.config.ts:**
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Only manage nbs_* tables — don't touch anything else
  tablesFilter: ["nbs_*"],
});
```

The `tablesFilter` option tells Drizzle Kit to only generate/apply migrations for tables matching the pattern. It will ignore HouseFinder's tables entirely.

**Run migrations locally (one-time setup + schema changes):**
```bash
npx drizzle-kit generate   # generate migration SQL
npx drizzle-kit migrate    # apply to DB
```

**Do NOT use `drizzle-kit push` on the shared production database** — it can cause data loss if schema drifts. Always use generate → review SQL → migrate.

### Does Drizzle work in Netlify serverless functions?

Yes. Drizzle with `node-postgres` (`pg`) runs in Node.js-based Netlify serverless functions without issues. The Netlify Next.js plugin runs Next.js API routes as Node.js functions, not Edge functions (Edge functions don't support `pg`'s TCP connections). Confirm in `netlify.toml` that the Next.js plugin is active — it is, per prior Phases.

**Confidence: HIGH** — Official Drizzle docs, verified config options.

---

## 4. Database Schema Design

### Table designs (final recommendation)

All tables use `nbs_` prefix to coexist safely with HouseFinder's tables on the same PostgreSQL instance.

**nbs_blog_posts:**
- `id` serial PK
- `title` text NOT NULL
- `slug` text UNIQUE NOT NULL — URL-safe, generated from title on create
- `content` text NOT NULL — stores HTML output from TipTap (not raw markdown)
- `excerpt` text NOT NULL DEFAULT '' — manually set or auto-generated from content
- `published` boolean NOT NULL DEFAULT false — drafts vs published
- `created_at` timestamp DEFAULT NOW()
- `updated_at` timestamp DEFAULT NOW() — update on every save; implement via trigger or explicit update in API route

**nbs_testimonials:**
- `id` serial PK
- `name` text NOT NULL
- `location` text NOT NULL DEFAULT ''
- `quote` text NOT NULL
- `rating` integer NOT NULL DEFAULT 5 — 1-5 stars
- `display_order` integer NOT NULL DEFAULT 0 — for manual ordering
- `active` boolean NOT NULL DEFAULT true — soft-delete / hide
- `created_at` timestamp DEFAULT NOW()

**nbs_gallery_images:**
- `id` serial PK
- `blob_url` text NOT NULL — full Azure blob URL (permanent)
- `alt` text NOT NULL DEFAULT ''
- `project_name` text NOT NULL DEFAULT ''
- `display_order` integer NOT NULL DEFAULT 0
- `created_at` timestamp DEFAULT NOW()

### Should tables have `nbs_` prefix?

Yes. Strongly recommended. Rationale:
1. Prevents name collisions with HouseFinder tables (e.g., HouseFinder likely has a `blogs` or `posts` table eventually)
2. Makes it immediately clear which application owns which tables when looking at the database
3. Drizzle Kit's `tablesFilter: ["nbs_*"]` cleanly scopes all migrations

### Content storage format

Store blog post content as **HTML** (output of TipTap's `getHTML()`), not markdown. Rationale: TipTap outputs HTML natively; converting to/from markdown adds complexity and round-trip fidelity issues. Render directly with `dangerouslySetInnerHTML` in a prose-styled div. Sanitize on write, not on read.

**Confidence: HIGH** — Drizzle docs + known schema design patterns.

---

## 5. Admin UI Patterns

### No UI component library needed

The existing project uses raw Tailwind CSS (v4). Adding shadcn/ui or similar for an admin portal that 2 people use is overkill. Build admin UI with the same Tailwind patterns used on the marketing site. The admin pages should feel functional rather than polished — this is an internal tool.

### Drag-and-drop image upload: react-dropzone

**Recommendation: react-dropzone**

```bash
npm install react-dropzone
```

react-dropzone is the standard React drag-and-drop upload library (3.5M weekly downloads, MIT license). It wraps the HTML5 `File API` with a clean hook interface. Works with Next.js App Router via `"use client"` directive.

Minimal pattern:
```typescript
"use client";
import { useDropzone } from "react-dropzone";

export function ImageDropzone({ onUpload }: { onUpload: (url: string) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: async ([file]) => {
      // 1. Get SAS URL from server
      const { sasUrl, permanentUrl } = await fetch("/api/admin/upload-url", {
        method: "POST",
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
        headers: { "Content-Type": "application/json" },
      }).then(r => r.json());

      // 2. Upload directly to Azure
      await fetch(sasUrl, {
        method: "PUT",
        headers: { "x-ms-blob-type": "BlockBlob", "Content-Type": file.type },
        body: file,
      });

      onUpload(permanentUrl);
    },
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer">
      <input {...getInputProps()} />
      {isDragActive ? "Drop image here..." : "Drag image or click to upload"}
    </div>
  );
}
```

**Why not native HTML5 drag-and-drop:** react-dropzone handles cross-browser differences, file type validation, drag-state UI, and multiple-file management. The native API requires significant boilerplate for the same result.

### Rich text editor for blog: TipTap

**Recommendation: TipTap with StarterKit**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

TipTap is the production-grade choice for a simple blog editor:
- Built on ProseMirror (battle-tested)
- `@tiptap/starter-kit` includes paragraphs, headings, bold, italic, lists, blockquotes, code blocks — everything a simple blog needs
- Outputs clean HTML directly (`editor.getHTML()`)
- `"use client"` component, App Router compatible
- No cloud service dependency (unlike Novel which uses a paid AI API)

**Why not Novel:** Novel is markdown-first and designed around Notion-style slash commands plus AI completion. For this use case (simple blog posts), Novel is overpowered and introduces a dependency on an AI API endpoint. TipTap StarterKit is self-contained.

**Why not simple `<textarea>`:** Markdown textarea requires the admin to know markdown syntax, and the Phase 6 markdown renderer is a custom approximation. Moving to HTML + TipTap is a clean break.

Minimal TipTap component (client):
```typescript
"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export function BlogEditor({ initialContent, onChange }: {
  initialContent?: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Toolbar buttons here */}
      <EditorContent editor={editor} className="prose max-w-none p-4 min-h-[300px]" />
    </div>
  );
}
```

### Image gallery management

For reordering gallery images, a simple drag-and-drop grid is ideal. Options:
- **@dnd-kit/core + @dnd-kit/sortable**: The most maintained sortable library for React as of 2025 (replaces react-beautiful-dnd which is unmaintained). Accessible, works with App Router client components.
- **Manual up/down buttons**: Simpler to implement, sufficient for a 2-person admin tool.

**Recommendation:** Start with up/down arrow buttons for display_order updates. Add drag-and-drop sortable only if it becomes a pain point. The admin has at most a few dozen images; buttons are fine.

### Admin page structure

```
/admin                   → dashboard (counts, quick links)
/admin/login             → Google OAuth sign-in button
/admin/gallery           → image list, upload new, reorder, delete
/admin/blog              → post list, draft/published status
/admin/blog/new          → TipTap editor, title, slug, excerpt, publish toggle
/admin/blog/[id]         → edit existing post
/admin/testimonials      → list, add, edit, delete, reorder, active toggle
```

**Confidence: HIGH for TipTap; HIGH for react-dropzone; MEDIUM for @dnd-kit (widely used but not personally tested for this pattern).**

---

## 6. Migration from Static to DB-backed Content

### Gallery: gallery-data.ts → nbs_gallery_images

1. Create the `nbs_gallery_images` table via migration
2. Upload existing placeholder images to Azure Blob Storage manually (or script)
3. Seed the table with their blob URLs
4. Update `gallery/page.tsx` to fetch from DB instead of importing `gallery-data.ts`
5. Delete `gallery-data.ts`

The gallery page becomes a Server Component fetching from DB:
```typescript
// app/gallery/page.tsx (Server Component, no "use client")
import { db } from "@/lib/db";
import { nbsGalleryImages } from "@/lib/schema";
import { asc } from "drizzle-orm";

export default async function GalleryPage() {
  const images = await db
    .select()
    .from(nbsGalleryImages)
    .orderBy(asc(nbsGalleryImages.displayOrder));
  // ... render
}
```

**Backward compatibility:** During migration, the gallery page can read from both sources (DB first, fall back to static data if DB is empty). Remove fallback once the DB is seeded.

### Blog: markdown files → nbs_blog_posts

1. Create `nbs_blog_posts` table
2. Convert each markdown file: parse with `gray-matter`, convert content to HTML via the existing `markdownToHtml()` function (or paste into TipTap admin to get clean HTML)
3. Seed each post into the DB with `published: true`
4. Update `blog/page.tsx` and `blog/[slug]/page.tsx` to query DB instead of `getAllPosts()` / `getPostBySlug()`
5. Delete `src/lib/blog.ts` and the `content/blog/` directory
6. Remove `gray-matter` from dependencies

The blog pages become Server Components fetching from DB. Slugs stay the same so no URL changes needed (SEO preserved).

### Testimonials: hardcoded in page.tsx → nbs_testimonials

1. Create `nbs_testimonials` table
2. Seed the 3 existing testimonials from `page.tsx` into the DB
3. Update `page.tsx` to `async` and fetch testimonials from DB
4. Remove the hardcoded `testimonials` array from `page.tsx`

`page.tsx` is already a Server Component (no `"use client"`), so making it `async` and adding a DB query is a one-line change.

**Confidence: HIGH** — Standard Next.js patterns, no external dependencies.

---

## 7. Security Considerations

### API route protection (defense in depth)

Middleware is a convenience redirect for the browser. It does NOT protect API routes in Next.js — middleware runs on the edge and the matcher can be bypassed. Every `/api/admin/*` route must independently verify the session:

```typescript
// Pattern for all admin API routes
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... route logic
}
```

### Azure SAS token security

- SAS tokens for uploads should have **15-minute expiry** — enough to complete an upload, short enough to limit exposure if intercepted
- Use `BlobSASPermissions.parse("cw")` (create + write only) — no read, no delete, no list
- The storage account key in env vars (`AZURE_STORAGE_ACCOUNT_KEY`) is never exposed to the client
- Permanent read access (public blob read) is fine for gallery images — they're intended to be public
- **Do not use `BlobSASPermissions.parse("r")` for the upload SAS** — write-only is sufficient

### Rate limiting on admin endpoints

For a 2-person admin tool, rate limiting is not critical. If added later, use Netlify's built-in rate limiting or a middleware-level check (tracking in-memory counter per IP, or using Redis via Upstash). For Phase 7, skip rate limiting.

### Input sanitization for blog HTML

TipTap's `getHTML()` output is safe within TipTap's schema — it won't produce `<script>` tags because StarterKit doesn't include a script node. However, if you ever accept arbitrary HTML, sanitize with DOMPurify (server-side via `isomorphic-dompurify`) before storing. For TipTap with StarterKit only, sanitization is not strictly required but is good practice:

```bash
npm install isomorphic-dompurify
```

```typescript
import DOMPurify from "isomorphic-dompurify";
const clean = DOMPurify.sanitize(rawHtml);
```

### Admin page visibility

The `/admin/*` routes should not be linked from anywhere public. They don't need to be "secret" (security through obscurity is not security), but there's no need to expose them. The middleware redirect to `/admin/login` is sufficient — an unauthenticated visitor gets redirected to the login page immediately.

**Confidence: HIGH** — Standard web security patterns.

---

## 8. Complete Package List for Phase 7

```bash
# Auth
npm install next-auth@beta

# Database
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg

# Azure Blob
npm install @azure/storage-blob

# Rich text editor
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit

# File upload UI
npm install react-dropzone
```

Optional (if sanitizing HTML):
```bash
npm install isomorphic-dompurify
```

The existing dependencies (`next`, `react`, `react-dom`, `tailwindcss`, `lucide-react`) are all reused — no changes needed.

---

## 9. Suggested Implementation Order (within Phase 7)

Phase 7 should be broken into 4 plans:

**Plan 7-01: Database Setup**
- Install drizzle-orm + pg + drizzle-kit
- Create `src/lib/db.ts` and `src/lib/schema.ts`
- Create `drizzle.config.ts` with `tablesFilter: ["nbs_*"]`
- Run `drizzle-kit generate` + `drizzle-kit migrate` to create all 3 tables
- Add `DATABASE_URL` to Netlify env vars
- Seed existing static content into DB

**Plan 7-02: Authentication**
- Install next-auth@beta
- Create `auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`
- Create `/admin/login` page with Google sign-in button
- Create `/admin` dashboard page (just a welcome message + links)
- Set up Google Cloud OAuth credentials for production
- Add all auth env vars to Netlify
- Deploy and verify Google OAuth works end-to-end

**Plan 7-03: Azure Blob + Gallery Admin**
- Install @azure/storage-blob + react-dropzone
- Create Azure Blob container, configure CORS, set public access
- Add Azure env vars to Netlify
- Build `/api/admin/upload-url` route
- Build `/admin/gallery` page with upload, reorder, delete
- Update public `/gallery` page to fetch from DB

**Plan 7-04: Blog + Testimonials Admin**
- Install @tiptap/react @tiptap/pm @tiptap/starter-kit
- Build `/admin/blog` list + `/admin/blog/new` + `/admin/blog/[id]` with TipTap editor
- Update public `/blog` and `/blog/[slug]` to fetch from DB
- Build `/admin/testimonials` CRUD
- Update public homepage testimonials to fetch from DB
- Remove static data files (gallery-data.ts, blog.ts, content/blog/)

---

## 10. Open Questions / Things to Verify Before Starting

1. **Which Azure storage account to use?** Run `az storage account list` — use an existing one on the HouseFinder subscription if available (saves cost and keeps Azure resources consolidated). If none, create `nbshomesstorage` (or similar).

2. **DATABASE_URL access:** Confirm you have the PostgreSQL connection string for HouseFinder's production database. It may be in Azure Key Vault or in HouseFinder's `.env`. This is required before Plan 7-01 can run migrations.

3. **HouseFinder's PostgreSQL version and SSL mode:** Azure Database for PostgreSQL Flexible Server requires `ssl: true`. The connection string needs `?sslmode=require`. Verify HouseFinder uses Flexible Server vs Single Server (Single Server requires `rejectUnauthorized: false`).

4. **Google Workspace OAuth consent screen:** Since Brian and Shawn use `@no-bshomes.com` (Google Workspace), the OAuth consent screen might need to be internal (only workspace users) vs external (all Google accounts). Internal is simpler and doesn't require app verification. Verify the Google Cloud project is associated with the no-bshomes.com Workspace.

5. **Netlify function timeout:** Default Netlify function timeout is 10 seconds. Database migrations should not be run from a Netlify function — run them locally with `npx drizzle-kit migrate` before deploying.

---

## Sources

- Auth.js deployment docs: https://authjs.dev/getting-started/deployment
- Auth.js protecting routes: https://authjs.dev/getting-started/session-management/protecting
- NextAuth v5 migration guide: https://authjs.dev/getting-started/migrating-to-v5
- Auth.js Next.js reference: https://authjs.dev/reference/nextjs
- Azure Blob SAS service JavaScript: https://learn.microsoft.com/en-us/azure/storage/blobs/sas-service-create-javascript
- Azure Blob Storage client library JS: https://learn.microsoft.com/en-us/javascript/api/overview/azure/storage-blob-readme
- Azure CORS configuration: https://learn.microsoft.com/en-us/rest/api/storageservices/cross-origin-resource-sharing--cors--support-for-the-azure-storage-services
- Drizzle ORM PostgreSQL existing project: https://orm.drizzle.team/docs/get-started/postgresql-existing
- Drizzle ORM schemas (pgSchema): https://orm.drizzle.team/docs/schemas
- Drizzle ORM migrations: https://orm.drizzle.team/docs/migrations
- Drizzle ORM config reference (tablesFilter): https://orm.drizzle.team/docs/drizzle-config-file
- TipTap Next.js setup: https://tiptap.dev/docs/editor/getting-started/install/nextjs
- react-dropzone: https://react-dropzone.js.org/
- NextAuth Netlify issues thread: https://answers.netlify.com/t/next-auth-deploy-issues-with-netlify-and-nextjs/39845
- Connection pooling serverless: https://vercel.com/kb/guide/connection-pooling-with-functions
