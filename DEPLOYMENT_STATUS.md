# CareerIQ release readiness — 23 October 2026

**Status: prepared for review; not deployed.** This branch requires the database repair before replacing the current application.

## Changes

- Protected pages and APIs verify Supabase accounts; private responses are not cached. Vector ingestion and asset publishing require a trusted administrator claim.
- PKCE/OTP confirmation uses `/auth/confirm`. Student and mentor onboarding use account UUIDs, with visible retry errors when profiles cannot load.
- Social discovery uses limited profile directories. Account email, phone and Calendar refresh tokens are not exposed to other members.
- Messages distinguish student and mentor participants even when numeric IDs overlap. Sent messages appear immediately, with polling when Realtime is unavailable.
- Calendar authorization validates a short-lived state cookie. Connection and sync derive the account from the verified session, ignoring browser-supplied user IDs.
- Mentor booking calculates and deducts credits atomically in PostgreSQL. Browser writes cannot grant credits or paid status.
- Missing service credentials return controlled unavailable responses. Payments/top-ups are disabled until account-bound orders, verified fulfillment and an idempotent ledger are implemented. Persistent exam event recording is disabled; the previous process-wide array exposed events across accounts and did not survive serverless restarts.

## Verified locally

Run `pnpm test:config`, `pnpm test:database`, `pnpm exec tsc --noEmit` and `pnpm build`.

Database tests execute PostgreSQL in memory through PGlite with synthetic accounts. They cover data preservation, failed ownership mapping, private records, safe directories, cross-role messaging, sender impersonation, atomic booking, insufficient credits, rerunning the repair and restoring legacy policies without deleting records. This does not replace deployed Supabase/PostgREST checks.

The production build uses only a public Supabase URL and publishable client key. No provider secrets are committed. Signed-in browser workflows and actual AI, OAuth, media and voice calls still require validation in a configured deployment.

The final local run passed 13 service-configuration checks, 26 database checks and the production build. Nine production HTTP checks covered public pages, protected redirects, API authentication and rejection of an external callback destination. Authenticated browser workflows remain unverified.

## Release blockers

1. **Database approval:** Supabase is active and healthy. Inspection found eight existing tables, one profile and one job record; four application tables were absent and existing signed-in policies allowed cross-account access. `database/schema-repair.sql` adds ownership UUIDs and missing tables, creates safe directories, replaces policies/grants and adds atomic booking. It preserves existing IDs and records. Automatic approval review rejected this broad live schema/access change without approval for its exact scope and a verified rollback plan. It has **not been applied**. See [database instructions](database/README.md).
2. **Hosting access:** the connected Vercel account's workspace returns HTTP 403. Its advertised team-authorization recovery operation is not exposed. Deployment cannot proceed through that connection until workspace access is available.
3. **Integration configuration:** configure the services to enable using `.env.example`. Supabase must allow the deployed `/auth/confirm` callback and mentor callback query variant. Google Calendar must allow the exact `/api/google/callback` URI. Google sign-in and Calendar are separate OAuth integrations.

## Release order

Keep this app branch out of production until the database repair is approved. Recheck live schema/ownership, take a current database backup, apply the reviewed transaction and run live RLS checks with separate test accounts. Configure build/runtime environments and redirect allowlists, deploy a preview and validate sign-in, onboarding, job tracking, roadmaps, messages and enabled integrations. Promote after checks pass.

The access rollback is emergency recovery, not a full schema rollback. It restores legacy permissive policies and retains new columns, tables and data. Keep the app in maintenance mode while using it; prefer a forward repair. Production data and live authentication flows have not been changed or validated by these local tests.
