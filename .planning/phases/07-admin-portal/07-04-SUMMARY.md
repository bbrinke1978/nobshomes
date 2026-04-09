---
phase: 07-admin-portal
plan: 04
subsystem: ui, api, database
tags: [tiptap, rich-text-editor, blog, testimonials, cms, drizzle, postgres, next-auth]

# Dependency graph
requires:
  - phase: 07-01
    provides: DB schema (nbs_blog_posts, nbs_testimonials) and seed data
  - phase: 07-02
    provides: auth() session helper for protecting API routes, admin layout
  - phase: 07-03
    provides: ImageDropzone component for blog image insertion, SAS upload pattern

provides:
  - TipTap v3 rich text editor component with toolbar (bold, italic, H2/H3, lists, blockquote, image)
  - Blog admin CRUD at /admin/blog (list, create, edit, delete, publish toggle)
  - Blog API routes: GET/POST /api/admin/blog, GET/PUT/DELETE /api/admin/blog/[id]
  - Testimonials admin CRUD at /admin/testimonials (add, edit, delete, reorder, active toggle)
  - Testimonials API routes: GET/POST /api/admin/testimonials, PUT/DELETE /api/admin/testimonials/[id], PUT /api/admin/testimonials/reorder
  - Public /blog page reading published posts from database
  - Public /blog/[slug] page rendering TipTap HTML content from database
  - Public homepage testimonials fetched from database (active + ordered)

affects: [public-blog, public-homepage, admin-portal]

# Tech tracking
tech-stack:
  added: [@tiptap/react@3, @tiptap/pm@3, @tiptap/starter-kit@3, @tiptap/extension-image@3]
  patterns:
    - TipTap v3 with useEditor + EditorContent pattern
    - force-dynamic on all pages that query DB at request time
    - Inline partial updates (only pass changed fields to PUT endpoint)
    - Slug auto-generation: lowercase + hyphenate + strip non-alphanumeric

key-files:
  created:
    - src/components/admin/BlogEditor.tsx
    - src/app/api/admin/blog/route.ts
    - src/app/api/admin/blog/[id]/route.ts
    - src/app/admin/blog/page.tsx
    - src/app/admin/blog/new/page.tsx
    - src/app/admin/blog/[id]/page.tsx
    - src/app/api/admin/testimonials/route.ts
    - src/app/api/admin/testimonials/[id]/route.ts
    - src/app/api/admin/testimonials/reorder/route.ts
    - src/app/admin/testimonials/page.tsx
  modified:
    - src/app/blog/page.tsx
    - src/app/blog/[slug]/page.tsx
    - src/app/page.tsx
    - src/lib/blog.ts

key-decisions:
  - "TipTap v3 useEditor + EditorContent — no separate @tiptap/extension-link needed for MVP blog"
  - "Blog [slug] page uses force-dynamic (no generateStaticParams) — DB queries run at request time"
  - "Homepage uses force-dynamic — testimonials must reflect admin changes immediately"
  - "Testimonial active toggle uses partial PUT (only sends {active: bool}) — cleaner than full update"
  - "src/lib/blog.ts kept with TODO comment — not deleted until client confirms DB migration complete"

patterns-established:
  - "Async Server Component + force-dynamic for all public DB-backed pages"
  - "Client Component admin pages: useEffect fetch on mount, local state management"
  - "Partial field updates in PUT routes: build updateValues object from request body"
  - "Slug generation: toLowerCase + replace spaces + strip non-alphanum + dedupe hyphens"

requirements-completed: [ADMIN-05, ADMIN-06, ADMIN-07, ADMIN-08]

# Metrics
duration: 35min
completed: 2026-04-05
---

# Phase 07 Plan 04: Blog + Testimonials CMS + Public Page Migration Summary

**TipTap v3 rich text blog editor with full CRUD admin, testimonials manager with reorder/active toggle, and all three public content sections (blog list, blog post, homepage testimonials) migrated from static files to database.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-05T00:00:00Z
- **Completed:** 2026-04-05T00:35:00Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- TipTap v3 BlogEditor component with 9-button toolbar (bold, italic, H2, H3, bullet list, ordered list, blockquote, undo, redo) plus image insertion modal reusing ImageDropzone
- Blog admin: list with Published/Draft badges, create page with editor, edit page with pre-filled form, delete with confirmation
- Testimonials admin: add form, inline edit, active toggle (green/gray dot), up/down reorder arrows, delete with confirmation
- Public /blog and /blog/[slug] now query database — same URLs, no SEO impact, hardcoded markdown replaced
- Homepage testimonials now fetched from DB filtered by active=true ordered by displayOrder

## Task Commits

Each task was committed atomically:

1. **Task 1: TipTap editor, blog API routes, and blog admin pages** - `4b9c149` (feat)
2. **Task 2: Testimonials API + admin page, migrate public blog and testimonials to DB** - `c8a43e8` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `src/components/admin/BlogEditor.tsx` - TipTap rich text editor with toolbar and image modal
- `src/app/api/admin/blog/route.ts` - GET (list) and POST (create with slug generation)
- `src/app/api/admin/blog/[id]/route.ts` - GET, PUT (update + reslug), DELETE
- `src/app/admin/blog/page.tsx` - Blog list with status badges, edit/delete actions
- `src/app/admin/blog/new/page.tsx` - Create form with BlogEditor, excerpt, publish toggle
- `src/app/admin/blog/[id]/page.tsx` - Edit form pre-filled from API, with delete
- `src/app/api/admin/testimonials/route.ts` - GET (ordered list) and POST (auto displayOrder)
- `src/app/api/admin/testimonials/[id]/route.ts` - PUT (partial update) and DELETE
- `src/app/api/admin/testimonials/reorder/route.ts` - PUT updates displayOrder for each ID
- `src/app/admin/testimonials/page.tsx` - Full CRUD with add form, inline edit, active toggle, reorder
- `src/app/blog/page.tsx` - Async Server Component querying published posts from DB
- `src/app/blog/[slug]/page.tsx` - Async Server Component fetching post by slug, renders HTML
- `src/app/page.tsx` - Homepage now async, testimonials fetched from DB with active filter
- `src/lib/blog.ts` - TODO comment added, no longer imported by any public page

## Decisions Made
- TipTap v3 API uses `useEditor` hook (same as v2) — no breaking changes in editor interface
- Used `force-dynamic` on /blog, /blog/[slug], and / pages so DB queries run per-request not at build time
- Active toggle in testimonials admin sends partial PUT with only `{active: bool}` rather than full form payload — simpler UX
- Old `src/lib/blog.ts` kept with TODO comment per plan requirements — not deleted until client confirms

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. TipTap v3 installed cleanly. Build passed on first attempt with no TypeScript errors.

## User Setup Required

None - all functionality uses existing DB connection and auth from 07-01 and 07-02.

## Next Phase Readiness

Phase 07 (Admin Portal) is now complete:
- All content (gallery, blog, testimonials) is database-backed and manageable through admin UI
- Public pages all use force-dynamic and DB queries
- Blog posts can be created/edited with rich text via TipTap
- Testimonials can be added, reordered, and toggled active/inactive

Remaining optional cleanup:
- Delete `content/blog/` directory once client confirms DB migration looks good
- Delete `src/lib/blog.ts` after confirming no other imports remain
- Delete `src/lib/gallery-data.ts` if it exists and is no longer needed

---
*Phase: 07-admin-portal*
*Completed: 2026-04-05*
