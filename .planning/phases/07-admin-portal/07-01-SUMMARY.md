---
phase: 07-admin-portal
plan: "01"
subsystem: database
tags: [drizzle, postgresql, orm, migration, seed]
dependency_graph:
  requires: []
  provides: [db-client, nbs-schema, seeded-data]
  affects: [07-02, 07-03, 07-04, 07-05]
tech_stack:
  added: [drizzle-orm, pg, drizzle-kit, "@types/pg", tsx]
  patterns: [pg-pool-connection, drizzle-schema, migration-not-push, onConflictDoNothing-idempotent-seed]
key_files:
  created:
    - src/lib/db.ts
    - src/lib/schema.ts
    - drizzle.config.ts
    - drizzle/0000_normal_norrin_radd.sql
    - scripts/seed.ts
    - scripts/verify-seed.ts
  modified:
    - package.json
    - package-lock.json
decisions:
  - key: tablesFilter-nbs-star
    summary: "drizzle.config.ts uses tablesFilter: ['nbs_*'] — Drizzle Kit only sees nbs_ tables, never HouseFinder tables"
  - key: migrate-not-push
    summary: "Used drizzle-kit migrate (not push) for shared production DB to avoid data loss risk"
  - key: pool-max-3
    summary: "pg Pool max:3 for serverless environment — prevents connection exhaustion on Netlify functions"
  - key: seed-idempotent
    summary: "onConflictDoNothing() on all seed inserts — script safe to run multiple times"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-08"
  tasks: 2
  files: 8
---

# Phase 7 Plan 01: Drizzle ORM Setup + Database Foundation Summary

Drizzle ORM with pg Pool (max:3, SSL) connecting to HouseFinder's PostgreSQL, three nbs_-prefixed tables migrated, and existing static content seeded.

## What Was Built

- **`src/lib/db.ts`** — Drizzle client wrapping pg Pool with SSL, max 3 connections, 10s idle timeout
- **`src/lib/schema.ts`** — Three table definitions: `nbs_blog_posts`, `nbs_testimonials`, `nbs_gallery_images`
- **`drizzle.config.ts`** — Drizzle Kit config scoped to `nbs_*` tables only via `tablesFilter`
- **`drizzle/0000_normal_norrin_radd.sql`** — Generated migration creating all three tables with indexes
- **`scripts/seed.ts`** — Idempotent seed: 3 gallery images, 3 testimonials, 1 blog post (markdown converted to HTML)
- **Migration applied** — Tables live in HouseFinder PostgreSQL (`housefinder-db.postgres.database.azure.com`)
- **Seed verified** — Blog posts: 1 | Testimonials: 3 | Gallery: 3

## Task Commits

| Task | Description | Commit |
|------|-------------|--------|
| 1 | Install Drizzle, create DB client + schema + config | 63ecc69 |
| 2 | Generate migration, apply to DB, seed static content | 4408156 |

## Decisions Made

**tablesFilter: ["nbs_*"]** — Critical isolation layer. Drizzle Kit only manages nbs_-prefixed tables and ignores all HouseFinder tables. Without this, `drizzle-kit push` could drop HouseFinder tables.

**migrate over push** — Used `drizzle-kit migrate` (generates SQL then applies) instead of `drizzle-kit push` (schema-sync). Push is destructive on shared databases; migrate provides a reviewable SQL audit trail.

**Pool max: 3** — Netlify serverless functions spin up many instances. A higher connection limit would exhaust PostgreSQL's connection pool shared with HouseFinder's production traffic.

**Seed idempotency** — All inserts use `.onConflictDoNothing()`. The slug UNIQUE constraint on `nbs_blog_posts` and sequential insert order on testimonials/gallery mean re-running the seed is always safe.

## Deviations from Plan

**[Rule 2 - Missing Functionality] Added verify-seed.ts helper script**
- **Found during:** Task 2 verification
- **Issue:** `npx tsx -e "..."` with top-level await fails in CJS mode — the plan's inline verification command didn't work
- **Fix:** Created `scripts/verify-seed.ts` as a proper script file, which tsx handles correctly with ESM
- **Files modified:** `scripts/verify-seed.ts` (new)
- **Commit:** 4408156

## Self-Check: PASSED

- src/lib/db.ts: FOUND
- src/lib/schema.ts: FOUND
- drizzle.config.ts: FOUND
- drizzle/0000_normal_norrin_radd.sql: FOUND
- scripts/seed.ts: FOUND
- commit 63ecc69: FOUND
- commit 4408156: FOUND
