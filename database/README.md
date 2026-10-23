# Database repair review

Target: CareerIQ Supabase project `ldxwglwccnhdnvgwiiar`.

`schema-repair.sql` repairs the existing database; it is not a blank-database schema. It runs in one transaction, preserving profile IDs and records. It matches ownership from existing profile emails to `auth.users`; unmatched or duplicate ownership aborts rather than guessing. Existing ambiguous messages also abort; inspection found no messages.

It adds ownership UUIDs, safe directories, Calendar fields, roadmap/progress/interview/session tables and message participant UUIDs. It replaces named-table policies and browser grants, adds private triggers and the authenticated `book_mentor_session` RPC. Costs are 10/20/35 credits for 10/30/45 minutes. It grants no credits and enables no payments.

`test-fixture.sql` contains schema metadata and legacy policies only, without real user records. `pnpm test:database` supplies synthetic actors in an isolated PostgreSQL instance. It never connects to Supabase.

`rollback-access.sql` restores the recorded legacy table grants/policies after clearing new column grants. It preserves all schema additions and records, revokes booking access and leaves internal function restrictions in place. It does not restore sequence ACLs or remove constraints. Legacy policies are permissive: put the app into maintenance mode first and prefer fixing forward. Use a fresh full backup if structural restoration is required.

Before either live script: confirm the target, inspect changes since this snapshot, save a current full database backup, review the exact SQL and obtain approval. Automatic approval review blocked the live repair; it has not been applied. Do not deploy the dependent app changes before the repair is approved and succeeds.
