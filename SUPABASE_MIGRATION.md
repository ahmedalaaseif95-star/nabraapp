# Supabase migration status

This branch prepares Nabra to use the owner-managed Supabase project in London.

## Completed

- Owner restored the app schema and 100 SADA research records using Nabra_Restore.sql; screenshot confirms 100 Najdi records and zero commercially enabled records.
- Owner created a new auth account and assigned its admin role.
- This branch changes the public Supabase connection settings and CLI project ID.
- The current application build succeeds with the new VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY values.

## Before switching hosting

- Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY on the server to match the VITE_ build settings in .env. Hosting environment variables may override this file; configure both sides consistently.
- Rebuild after setting VITE_ variables.
- Verify login with the newly created account and access to /admin/import on a preview deployment. These runtime checks have not yet been performed.
- Old auth users, sessions and storage objects were not migrated by the app-table restore. Approved copies remain in browser localStorage on the old origin and need exporting before changing domains.
- The restored claim_first_admin function only checks an existing role; it cannot grant one. Only the trusted database owner should assign roles.
- AI generation and the build tooling still depend on Lovable packages. Replace/configure the AI provider before claiming full independence from Lovable.
- Keep SADA research records separate from the commercial phrase library.

The values committed in .env are public connection configuration, not service-role credentials. Never commit an AI API key, Supabase secret key, database password or service-role key.

Do not run the original bootstrap migration against the restored database. Do not merge this branch into the Lovable-connected main branch until the environment and runtime checks above are ready.
