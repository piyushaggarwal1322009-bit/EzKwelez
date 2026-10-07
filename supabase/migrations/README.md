# Database Migrations

Place SQL migration scripts here in standard sequential format (e.g. `00001_initial_schema.sql`).
All migrations are strictly managed through pull requests on feature branches.

The incident engine migrations first commit new enum labels (`00003`) before
referencing them in campus-owned incident and explicit affected-entity tables
(`00004`). Apply seed `supabase/seed/00002_seed_incidents.sql` after the campus
and dependency graph seed.
