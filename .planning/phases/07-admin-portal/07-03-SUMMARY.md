---
phase: 07-admin-portal
plan: "03"
subsystem: ui, api, infra
tags: [azure-blob, react-dropzone, sas-url, gallery, drizzle, nextjs, admin]

# Dependency graph
requires:
  - phase: 07-01
    provides: nbs_gallery_images table, Drizzle db client, nbsGalleryImages schema
  - phase: 07-02
    provides: auth() helper, NextAuth JWT sessions, /admin protected layout

provides:
  - Azure Blob upload infrastructure via SAS URL pattern (write SAS for upload, read SAS stored in DB)
  - POST /api/admin/upload-url — generates 15-min write SAS + 1-year read SAS URL
  - GET/POST /api/admin/gallery — list and create gallery images
  - PUT/DELETE /api/admin/gallery/[id] — update and delete individual images
  - PUT /api/admin/gallery/reorder — batch reorder by display order
  - ImageDropzone component — drag-drop upload with progress/error states
  - /admin/gallery — full CRUD admin page for gallery management
  - /gallery — public gallery page now reading from DB instead of static gallery-data.ts

affects:
  - 07-04 (blog admin will reuse SAS upload pattern for inline images)
  - Any future media upload feature

# Tech tracking
tech-stack:
  added:
    - "@azure/storage-blob (BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters)"
    - "react-dropzone (useDropzone hook)"
  patterns:
    - "SAS URL upload: server generates write SAS (15 min) + read SAS (1 year), client PUTs directly to Azure"
    - "x-ms-blob-type: BlockBlob header required on all Azure Blob PUT requests"
    - "force-dynamic on DB-backed server components to prevent build-time static generation failure"
    - "All /api/admin/* routes independently verify auth() session (middleware not sufficient)"

key-files:
  created:
    - src/app/api/admin/upload-url/route.ts
    - src/app/api/admin/gallery/route.ts
    - src/app/api/admin/gallery/[id]/route.ts
    - src/app/api/admin/gallery/reorder/route.ts
    - src/components/admin/ImageDropzone.tsx
    - src/app/admin/gallery/page.tsx
  modified:
    - src/app/gallery/page.tsx (migrated from static gallery-data.ts to DB query)
    - next.config.ts (added *.blob.core.windows.net to remotePatterns)
    - package.json (added @azure/storage-blob, react-dropzone)

key-decisions:
  - "Store 1-year read SAS URL in DB as blobUrl — avoids generating SAS on every gallery render while keeping public access blocked on container"
  - "Upload SAS has 15-minute expiry with contentType bound — Azure rejects uploads without contentType in SAS params"
  - "force-dynamic on public /gallery page — DB query cannot run at build time (no DB connection during Netlify build)"
  - "unoptimized prop on Azure Blob images — Next.js Image optimizer cannot proxy SAS URLs with query params"

patterns-established:
  - "SAS Upload Pattern: POST /api/admin/upload-url → client PUT to sasUrl → save permanentUrl to DB → refresh list"
  - "Admin API Auth: every /api/admin/* route calls auth() independently and returns 401 if no session"

requirements-completed: [ADMIN-03, ADMIN-04, ADMIN-10]

# Metrics
duration: 25min
completed: 2026-04-05
---

# Phase 7 Plan 03: Gallery Admin + Azure Blob Upload Summary

**Azure Blob SAS upload pattern with drag-drop admin gallery CRUD, public /gallery migrated from static data to Drizzle DB query**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-05T00:00:00Z
- **Completed:** 2026-04-05T00:25:00Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- Full Azure Blob upload flow: admin drag-drops image, server generates 15-min write SAS + 1-year read SAS, client PUTs directly to Azure with required `x-ms-blob-type: BlockBlob` header
- /admin/gallery page with image grid, upload dropzone, per-image edit (alt/project name), delete with confirmation, up/down reorder buttons
- Public /gallery page converted from static `gallery-data.ts` to async server component querying `nbs_gallery_images` via Drizzle

## Task Commits

1. **Task 1: Azure Blob upload infrastructure and gallery API routes** - `229e177` (feat)
2. **Task 2: Gallery admin page with drag-drop upload and public gallery migration** - `0a8bf23` (feat)

**Plan metadata:** (see final commit)

## Files Created/Modified

- `src/app/api/admin/upload-url/route.ts` — POST endpoint: generates write SAS (15 min) + read SAS (1 year) for Azure Blob
- `src/app/api/admin/gallery/route.ts` — GET (list ordered by displayOrder) + POST (create with auto-incremented displayOrder)
- `src/app/api/admin/gallery/[id]/route.ts` — PUT (update alt/projectName) + DELETE (204 no content)
- `src/app/api/admin/gallery/reorder/route.ts` — PUT: batch update displayOrder from orderedIds array
- `src/components/admin/ImageDropzone.tsx` — Drag-drop zone using react-dropzone, handles multi-file upload, progress/error states
- `src/app/admin/gallery/page.tsx` — Client component with useEffect fetch, full CRUD controls per image
- `src/app/gallery/page.tsx` — Migrated to async server component querying DB; `export const dynamic = "force-dynamic"`
- `next.config.ts` — Added `*.blob.core.windows.net` to `images.remotePatterns`
- `package.json` — Added `@azure/storage-blob`, `react-dropzone`

## Decisions Made

- **1-year read SAS stored in DB:** Since container has public access blocked, storing a 1-year read SAS as `blobUrl` avoids regenerating SAS on every gallery page load while keeping the container locked down.
- **contentType in write SAS params:** Azure requires contentType bound in the SAS to match the upload Content-Type header. Missing it causes a 400 error.
- **force-dynamic on /gallery:** Next.js attempts to statically pre-render all server components at build time. The DB is not available during Netlify builds, so `force-dynamic` is required.
- **unoptimized prop on Azure Blob images:** Next.js Image optimizer cannot proxy SAS URLs (they have query params including signatures). `unoptimized` passes the URL through directly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `force-dynamic` to public gallery page**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** Next.js tried to statically pre-render /gallery at build time; DB not reachable → `ECONNREFUSED` → build failure
- **Fix:** Added `export const dynamic = "force-dynamic"` to `src/app/gallery/page.tsx`
- **Files modified:** src/app/gallery/page.tsx
- **Verification:** Build passed with /gallery shown as `ƒ` (Dynamic) in route table
- **Committed in:** `0a8bf23` (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added `unoptimized` prop on Azure Blob images**
- **Found during:** Task 2 implementation
- **Issue:** Next.js Image optimizer fails to proxy SAS URLs (contain `?` query params with signatures) — would cause runtime errors
- **Fix:** Added `unoptimized={image.blobUrl.includes("blob.core.windows.net")}` to Image components in both gallery pages
- **Files modified:** src/app/gallery/page.tsx, src/app/admin/gallery/page.tsx
- **Verification:** Build passes, no Image optimizer errors
- **Committed in:** `0a8bf23` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes necessary for build to pass and runtime correctness. No scope creep.

## Issues Encountered

- `.next` cache had stale symlink (`EINVAL: invalid argument, readlink`) — cleared with `rm -rf .next` before rebuild. Windows OneDrive symlink issue in `.next/diagnostics/`.

## User Setup Required

For Azure Blob uploads to work in production, the following environment variables must be set in Netlify:

- `AZURE_STORAGE_ACCOUNT_NAME` — Azure Storage account name (e.g., `housefinderstorage`)
- `AZURE_STORAGE_ACCOUNT_KEY` — Azure Storage account key (Access keys → Key 1)
- `AZURE_STORAGE_CONTAINER_NAME` — Container name (e.g., `nobshomes`)

Container must have public access **blocked** (as configured). CORS must allow PUT from `https://no-bshomes.com` and `http://localhost:3000` with `x-ms-blob-type` header allowed.

## Next Phase Readiness

- SAS upload pattern is established and ready to reuse in 07-04 (blog inline images)
- /admin/gallery is fully functional once Azure env vars are set on Netlify
- Public /gallery renders empty state gracefully when no images are in DB yet
- gallery-data.ts retained (not deleted) per plan — clean up in 07-04

---
*Phase: 07-admin-portal*
*Completed: 2026-04-05*
