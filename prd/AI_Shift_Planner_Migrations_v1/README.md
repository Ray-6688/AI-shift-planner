# AI Shift Planner Migrations v1

This folder contains executable SQL migrations aligned with:
- `AI_Shift_Planner_PRD_v10_FINAL.md`
- `AI_Shift_Planner_Implementation_Spec_v1.md`
- `AI_Shift_Planner_RLS_Policies.sql`

## Run Order
Apply files in lexical order:
1. `migrations/001_create_users.sql`
2. `migrations/002_create_shops.sql`
3. `migrations/003_create_shop_operating_hours.sql`
4. `migrations/004_create_staff.sql`
5. `migrations/005_create_shift_periods.sql`
6. `migrations/006_create_staffing_rules.sql`
7. `migrations/007_create_staff_availability.sql`
8. `migrations/008_create_important_dates.sql`
9. `migrations/009_create_schedules.sql`
10. `migrations/010_create_shifts.sql`
11. `migrations/011_create_ai_patterns.sql`
12. `migrations/012_create_scheduling_constraints.sql`
13. `migrations/013_create_schedule_edits.sql`
14. `migrations/014_create_event_staffing_patterns.sql`
15. `migrations/015_add_indexes.sql`
16. `migrations/016_rls_policies.sql`

## Notes
- Migrations use `IF NOT EXISTS` where practical for safer re-runs.
- `015_add_indexes.sql` uses `CREATE INDEX IF NOT EXISTS` to avoid duplicate-index failures.
- `016_rls_policies.sql` is designed for Supabase/Postgres and assumes authenticated users map to `auth.uid()`.
