Pathology Voice Agent – Database Migration
==========================================

This directory contains SQL migrations for creating the schema in Supabase
(Postgres). It is **not** wired to any automatic migration tool – you run
the SQL once in your Supabase project to create the tables.

How to apply `001_init_schema.sql` in Supabase
---------------------------------------------

1. Log in to the Supabase dashboard and open your project.
2. Go to **SQL Editor**.
3. Create a new query.
4. Copy-paste the contents of `001_init_schema.sql` from this repo.
5. Make sure you are in the correct database (the project's default).
6. Click **Run**.

You should see all of these tables created:

- `organizations`
- `labs`
- `users`
- `lab_settings`
- `reports`
- `home_collections`
- `test_price_master`
- `call_logs`

After this migration runs successfully, the FastAPI backend can connect
via the Supabase service key in `.env` and all endpoints will have the
expected tables available.

