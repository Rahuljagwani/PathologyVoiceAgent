# Backend Migrations

This directory will contain SQL migration files for the Supabase/PostgreSQL schema
used by the Pathology Lab Voice Agent.

Planned tables (to be added in Commit 2 - `database-schema`):

- `labs`
- `users`
- `lab_settings`
- `reports`
- `home_collections`
- `test_price_master`
- `call_logs`

Seed data for `test_price_master` (30 common pathology tests and panels) will
also be added in Commit 2 so that the Bolna voice agent can answer pricing and
preparation queries out of the box.

