# Backend Migrations

This directory contains SQL migration files for the Supabase/PostgreSQL schema
used by the Pathology Lab Voice Agent.

Tables defined in `001_init_schema.sql` (Commit 2 - `database-schema`):

- `labs`
- `users`
- `lab_settings`
- `reports`
- `home_collections`
- `test_price_master`
 - `call_logs`

Seed data for `test_price_master` (30 common pathology tests and panels) is
defined in `002_seed_test_price_master.sql` so that the Bolna voice agent can
answer pricing and preparation queries out of the box.

### Applying migrations on Supabase

For local development, you can apply these migrations in your Supabase project
using the SQL editor or CLI:

1. Open the Supabase SQL editor for your project.
2. Paste and run `001_init_schema.sql` once.
3. Paste and run `002_seed_test_price_master.sql` to load initial test prices.

