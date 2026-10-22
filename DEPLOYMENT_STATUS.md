# Deployment verification — 23 October 2026

## Verified

- Dependency installation with the committed pnpm lockfile.
- TypeScript check: `pnpm exec tsc --noEmit`.
- Six API-module import and missing-provider checks: `pnpm test:config`.
- Full production build, including TypeScript, page-data collection and all 56 static pages, with the existing CareerIQ Supabase URL and a valid publishable client key supplied to the build environment.
- The voice interview page renders an unavailable message when Vapi is unconfigured. Its client initializes in a browser effect and releases event listeners on cleanup.

## Current blocker

The build now passes. A production deployment has not been created.

The existing CareerIQ Supabase project was paused. A resume request succeeded; the last observed status was `RESTORING`. Database tables, ownership policies and authentication flows still need verification after it finishes starting. The initial table inspection timed out during startup, so an empty advisory response is not treated as a completed security audit.

Vercel authenticates the correct account, but requests for its default project workspace return HTTP 403 because that connection lacks workspace access. The advertised team-authorization recovery tool is unavailable in this connection. Workspace access must be granted before deployment can proceed; credentials should not be pasted into chat.

Configure the real project URL and public client key in the build and runtime environments. Confirm the required Supabase tables, access policies and authentication redirect URLs before testing sign-in and database workflows. These workflows have not been validated against a real backend in this session.

AI routes now initialize Groq only when handling a request and return HTTP 503 when that provider is unconfigured. Generation with actual provider credentials remains unverified. The existing client-side Gemini integration still requires restricted browser-appropriate credentials; do not place privileged server keys in `NEXT_PUBLIC_` variables.

## Build command

```bash
pnpm install --frozen-lockfile
pnpm test:config
pnpm exec tsc --noEmit
NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

The larger Node heap was required for the full build's TypeScript worker in this environment. The successful build used real public Supabase configuration supplied only to the command environment, without committing credentials. The application is not yet verified as a working production deployment.
