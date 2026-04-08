---
phase: 07-admin-portal
plan: 02
subsystem: auth
tags: [next-auth, auth-js-v5, google-oauth, jwt, middleware, admin-portal]

# Dependency graph
requires:
  - phase: 06-content-gallery
    provides: existing Tailwind CSS conventions, brand colors, component patterns
provides:
  - NextAuth v5 Google OAuth with JWT sessions and email allowlist
  - Route protection middleware for /admin/* via next-auth auth()
  - Admin login page at /admin/login with Google sign-in
  - Admin dashboard at /admin with Gallery/Blog/Testimonials management cards
  - Admin layout with dark nav bar (bg-slate-900), nav links, sign-out
affects: [07-03-admin-gallery, 07-04-admin-blog, 07-05-admin-testimonials]

# Tech tracking
tech-stack:
  added: [next-auth@beta (Auth.js v5), next-auth/providers/google]
  patterns:
    - NextAuth v5 export pattern (auth, handlers, signIn, signOut from single config)
    - Server actions for signIn/signOut in server components
    - Email allowlist in signIn callback (not database roles)
    - Middleware route protection using auth() wrapper
    - Nested admin layout without html/body tags (root layout handles those)

key-files:
  created:
    - src/auth.ts
    - src/middleware.ts
    - src/app/api/auth/[...nextauth]/route.ts
    - src/app/admin/login/page.tsx
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "next-auth@beta (Auth.js v5) JWT sessions — no database session tables required"
  - "Email allowlist in signIn callback: brian@no-bshomes.com and shawn@no-bshomes.com only"
  - "AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET auto-read by Auth.js v5 (no manual env mapping needed)"
  - "Admin layout is a nested layout fragment (no html/body) — root layout owns document structure"

patterns-established:
  - "Admin server components use await auth() to get session"
  - "Sign out via server action calling signOut({ redirectTo: '/admin/login' })"
  - "Admin UI uses bg-slate-900 dark theme to visually distinguish from public site"

requirements-completed: [ADMIN-01, ADMIN-02]

# Metrics
duration: 3min
completed: 2026-04-08
---

# Phase 07 Plan 02: NextAuth v5 Google OAuth Admin Auth Summary

**NextAuth v5 (Auth.js) with Google OAuth, JWT sessions, email allowlist, middleware route protection, and admin dashboard shell with login page and dark nav layout**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-08T04:01:41Z
- **Completed:** 2026-04-08T04:04:16Z
- **Tasks:** 2 auto + 1 checkpoint (auto-approved)
- **Files modified:** 8

## Accomplishments
- Installed next-auth@beta and configured Google OAuth with JWT sessions and email allowlist (brian@ and shawn@ only)
- Created middleware protecting all /admin/* routes, redirecting unauthenticated users to /admin/login
- Built admin login page with Google sign-in button and error handling for unauthorized emails
- Built admin dashboard with 3 management cards (Gallery, Blog, Testimonials) and dark nav layout with sign-out

## Task Commits

Each task was committed atomically:

1. **Task 1: Install NextAuth + create auth config, route handler, middleware** - `a51a650` (feat)
2. **Task 2: Create admin login page, dashboard, and layout** - `7685bff` (feat)
3. **Task 3: Verify Google OAuth login flow** - auto-approved (checkpoint:human-verify, auto_advance=true)

## Files Created/Modified
- `src/auth.ts` - NextAuth v5 config: Google provider, JWT sessions, ALLOWED_EMAILS signIn callback, pages config
- `src/middleware.ts` - Route protection: redirects unauthenticated /admin/* (except /admin/login) to login
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth route handler exporting GET and POST
- `src/app/admin/login/page.tsx` - Google sign-in page with AccessDenied error display, stamp logo
- `src/app/admin/layout.tsx` - Dark admin nav (bg-slate-900) with Dashboard/Gallery/Blog/Testimonials links, sign-out
- `src/app/admin/page.tsx` - Dashboard with Welcome greeting and 3 management cards using lucide-react icons
- `package.json` - Added next-auth@beta dependency
- `package-lock.json` - Updated lockfile

## Decisions Made
- Used JWT session strategy (no DB session table needed — simpler for small admin)
- Auth.js v5 auto-reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from env (no manual mapping)
- Email allowlist in signIn callback rather than database roles (only 2 admins, no role complexity needed)
- Admin layout excludes html/body tags — root layout at app/layout.tsx owns document structure (Next.js nested layout pattern)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed html/body from admin layout**
- **Found during:** Task 2 (admin layout creation)
- **Issue:** Admin layout initially included html/body tags which conflict with root layout in Next.js App Router — nested layouts must not include document-level tags
- **Fix:** Replaced html/body wrapper with React fragment, keeping layout content intact
- **Files modified:** src/app/admin/layout.tsx
- **Verification:** `npm run build` passes, no duplicate html/body rendering
- **Committed in:** 7685bff (Task 2 commit)

**2. [Rule 3 - Blocking] Reinstalled next-auth after parallel agent modified package.json**
- **Found during:** Task 2 verification (npm run build)
- **Issue:** First npm install of next-auth was superseded by parallel 07-01 agent's package.json changes; next-auth not in final package.json or node_modules
- **Fix:** Ran `npm install next-auth@beta --save` again after discovering the conflict
- **Files modified:** package.json, package-lock.json
- **Verification:** Build passes with next-auth present
- **Committed in:** 7685bff (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes essential for correct operation. No scope creep.

## Issues Encountered
- Parallel 07-01 database agent modified package.json during execution, overwriting the next-auth install. Required a second install. No actual conflict in functionality.

## User Setup Required

The following must be completed manually to use the admin portal:

1. **Generate AUTH_SECRET:** `npx auth secret` — add to Netlify environment variables
2. **Create Google OAuth Client** at console.cloud.google.com:
   - APIs & Services > Credentials > Create OAuth client ID > Web application
   - Authorized redirect URIs:
     - `https://no-bshomes.com/api/auth/callback/google` (production)
     - `http://localhost:3000/api/auth/callback/google` (local dev)
   - Configure OAuth consent screen — add brian@no-bshomes.com and shawn@no-bshomes.com as test users
3. **Set Netlify env vars:** `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_TRUST_HOST=true`
4. **Verify locally:** `npm run dev`, visit http://localhost:3000/admin — should redirect to /admin/login

## Next Phase Readiness
- Auth infrastructure is complete — any subsequent admin CRUD pages can import `auth` from `@/auth` to get session
- Admin layout is the shell — all /admin/* child pages will inherit the dark nav
- /admin/gallery, /admin/blog, /admin/testimonials routes are referenced but not yet built (planned in subsequent plans)

---
*Phase: 07-admin-portal*
*Completed: 2026-04-08*
