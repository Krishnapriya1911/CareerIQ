# CareerIQ deployment status — 30 October 2026

**Production site:** [https://careeriq-nine.vercel.app](https://careeriq-nine.vercel.app)

## Deployment

- Vercel project: `careeriq`
- Source: `main` at merge commit `fcf2aa5ca6e8ae1fc9a30fc9bbe0c698c775b452`
- Status: **Ready**; production homepage returned HTTP 200.
- Production is public. Preview deployments remain protected by Vercel SSO.
- Vercel has the public Supabase project URL and publishable key. No service-role key is exposed to the browser.

## Database

The approved, additive Supabase repair is applied to the live CareerIQ project. It adds the four required application tables, maps existing profile ownership to Auth UUIDs, replaces unrestricted account policies with owner-scoped access, and adds atomic mentor booking. A live check confirmed the required tables exist and RLS is enabled across the application tables.

## Validation and remaining setup

The Vercel production build completed, including the Next.js build and TypeScript step. The public homepage is reachable. Sign-in and authenticated workflows have not yet been exercised against the production URL.

Before testing sign-in, add `https://careeriq-nine.vercel.app` as the Supabase Auth Site URL and allow the deployed auth confirmation path (for example, `https://careeriq-nine.vercel.app/auth/confirm`) in Supabase Auth URL Configuration. Google Calendar, Gemini, Pinecone, and voice integrations also need their own provider credentials and redirect configuration; those credentials have not been added to Vercel. Payments/top-ups remain disabled until account-bound orders and idempotent fulfillment are implemented.
