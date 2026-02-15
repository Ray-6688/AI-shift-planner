-- ============================================================
-- AI Shift Planner — Supabase RLS Policies (MVP)
-- Date: 2026-02-15
-- ============================================================
-- Assumptions:
-- 1) auth.uid() corresponds to app user identity used in public tables.
-- 2) shops.owner_id references manager user id.
-- 3) staff.user_id references staff auth user id when linked.
-- 4) Service role bypasses RLS for trusted server-side operations.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Helper functions (SECURITY DEFINER for stable membership checks)
-- ------------------------------------------------------------
create or replace function public.is_shop_owner(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from shops s
    where s.id = target_shop_id
      and s.owner_id = auth.uid()
  );
$$;

create or replace function public.is_shop_staff(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from staff st
    where st.shop_id = target_shop_id
      and st.user_id = auth.uid()
      and st.is_active = true
  );
$$;

create or replace function public.is_shop_member(target_shop_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_shop_owner(target_shop_id)
      or public.is_shop_staff(target_shop_id);
$$;

grant execute on function public.is_shop_owner(uuid) to authenticated;
grant execute on function public.is_shop_staff(uuid) to authenticated;
grant execute on function public.is_shop_member(uuid) to authenticated;

-- ------------------------------------------------------------
-- Enable RLS on all application tables
-- ------------------------------------------------------------
alter table if exists users enable row level security;
alter table if exists shops enable row level security;
alter table if exists shop_operating_hours enable row level security;
alter table if exists staff enable row level security;
alter table if exists staff_availability enable row level security;
alter table if exists important_dates enable row level security;
alter table if exists shift_periods enable row level security;
alter table if exists staffing_rules enable row level security;
alter table if exists scheduling_constraints enable row level security;
alter table if exists schedules enable row level security;
alter table if exists shifts enable row level security;
alter table if exists schedule_edits enable row level security;
alter table if exists ai_patterns enable row level security;
alter table if exists event_staffing_patterns enable row level security;

-- Optional hardening (uncomment if desired)
-- alter table users force row level security;
-- alter table shops force row level security;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
drop policy if exists users_select_own on users;
drop policy if exists users_update_own on users;


create policy users_select_own
  on users
  for select
  to authenticated
  using (id = auth.uid());

create policy users_update_own
  on users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ------------------------------------------------------------
-- shops
-- ------------------------------------------------------------
drop policy if exists shops_select_owner_or_staff on shops;
drop policy if exists shops_insert_owner on shops;
drop policy if exists shops_update_owner on shops;
drop policy if exists shops_delete_owner on shops;

create policy shops_select_owner_or_staff
  on shops
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or public.is_shop_staff(id)
  );

create policy shops_insert_owner
  on shops
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy shops_update_owner
  on shops
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy shops_delete_owner
  on shops
  for delete
  to authenticated
  using (owner_id = auth.uid());

-- ------------------------------------------------------------
-- shop_operating_hours
-- ------------------------------------------------------------
drop policy if exists shop_hours_select_members on shop_operating_hours;
drop policy if exists shop_hours_write_owner on shop_operating_hours;

create policy shop_hours_select_members
  on shop_operating_hours
  for select
  to authenticated
  using (public.is_shop_member(shop_id));

create policy shop_hours_write_owner
  on shop_operating_hours
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- staff
-- ------------------------------------------------------------
drop policy if exists staff_select_members on staff;
drop policy if exists staff_write_owner on staff;

create policy staff_select_members
  on staff
  for select
  to authenticated
  using (
    public.is_shop_owner(shop_id)
    or user_id = auth.uid()
  );

create policy staff_write_owner
  on staff
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- staff_availability
-- ------------------------------------------------------------
drop policy if exists availability_select_members on staff_availability;
drop policy if exists availability_write_owner on staff_availability;
drop policy if exists availability_write_self on staff_availability;

create policy availability_select_members
  on staff_availability
  for select
  to authenticated
  using (
    exists (
      select 1
      from staff st
      where st.id = staff_availability.staff_id
        and (
          public.is_shop_owner(st.shop_id)
          or st.user_id = auth.uid()
        )
    )
  );

create policy availability_write_owner
  on staff_availability
  for all
  to authenticated
  using (
    exists (
      select 1
      from staff st
      where st.id = staff_availability.staff_id
        and public.is_shop_owner(st.shop_id)
    )
  )
  with check (
    exists (
      select 1
      from staff st
      where st.id = staff_availability.staff_id
        and public.is_shop_owner(st.shop_id)
    )
  );

create policy availability_write_self
  on staff_availability
  for all
  to authenticated
  using (
    exists (
      select 1
      from staff st
      where st.id = staff_availability.staff_id
        and st.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from staff st
      where st.id = staff_availability.staff_id
        and st.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- important_dates
-- ------------------------------------------------------------
drop policy if exists important_dates_select_members on important_dates;
drop policy if exists important_dates_write_owner on important_dates;

create policy important_dates_select_members
  on important_dates
  for select
  to authenticated
  using (public.is_shop_member(shop_id));

create policy important_dates_write_owner
  on important_dates
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- shift_periods
-- ------------------------------------------------------------
drop policy if exists shift_periods_select_members on shift_periods;
drop policy if exists shift_periods_write_owner on shift_periods;

create policy shift_periods_select_members
  on shift_periods
  for select
  to authenticated
  using (public.is_shop_member(shop_id));

create policy shift_periods_write_owner
  on shift_periods
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- staffing_rules
-- ------------------------------------------------------------
drop policy if exists staffing_rules_select_members on staffing_rules;
drop policy if exists staffing_rules_write_owner on staffing_rules;

create policy staffing_rules_select_members
  on staffing_rules
  for select
  to authenticated
  using (public.is_shop_member(shop_id));

create policy staffing_rules_write_owner
  on staffing_rules
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- scheduling_constraints
-- ------------------------------------------------------------
drop policy if exists scheduling_constraints_select_members on scheduling_constraints;
drop policy if exists scheduling_constraints_write_owner on scheduling_constraints;

create policy scheduling_constraints_select_members
  on scheduling_constraints
  for select
  to authenticated
  using (public.is_shop_member(shop_id));

create policy scheduling_constraints_write_owner
  on scheduling_constraints
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- schedules
-- ------------------------------------------------------------
drop policy if exists schedules_select_owner_or_published_staff on schedules;
drop policy if exists schedules_write_owner on schedules;

create policy schedules_select_owner_or_published_staff
  on schedules
  for select
  to authenticated
  using (
    public.is_shop_owner(shop_id)
    or (
      public.is_shop_staff(shop_id)
      and status = 'published'
    )
  );

create policy schedules_write_owner
  on schedules
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- shifts
-- ------------------------------------------------------------
drop policy if exists shifts_select_owner_or_staff_on_published on shifts;
drop policy if exists shifts_write_owner on shifts;

create policy shifts_select_owner_or_staff_on_published
  on shifts
  for select
  to authenticated
  using (
    exists (
      select 1
      from schedules sc
      where sc.id = shifts.schedule_id
        and (
          public.is_shop_owner(sc.shop_id)
          or (
            public.is_shop_staff(sc.shop_id)
            and sc.status = 'published'
          )
        )
    )
  );

create policy shifts_write_owner
  on shifts
  for all
  to authenticated
  using (
    exists (
      select 1
      from schedules sc
      where sc.id = shifts.schedule_id
        and public.is_shop_owner(sc.shop_id)
    )
  )
  with check (
    exists (
      select 1
      from schedules sc
      where sc.id = shifts.schedule_id
        and public.is_shop_owner(sc.shop_id)
    )
  );

-- ------------------------------------------------------------
-- schedule_edits
-- ------------------------------------------------------------
drop policy if exists schedule_edits_select_owner on schedule_edits;
drop policy if exists schedule_edits_write_owner on schedule_edits;

create policy schedule_edits_select_owner
  on schedule_edits
  for select
  to authenticated
  using (
    exists (
      select 1
      from schedules sc
      where sc.id = schedule_edits.schedule_id
        and public.is_shop_owner(sc.shop_id)
    )
  );

create policy schedule_edits_write_owner
  on schedule_edits
  for all
  to authenticated
  using (
    exists (
      select 1
      from schedules sc
      where sc.id = schedule_edits.schedule_id
        and public.is_shop_owner(sc.shop_id)
    )
  )
  with check (
    exists (
      select 1
      from schedules sc
      where sc.id = schedule_edits.schedule_id
        and public.is_shop_owner(sc.shop_id)
    )
  );

-- ------------------------------------------------------------
-- ai_patterns
-- ------------------------------------------------------------
drop policy if exists ai_patterns_select_owner on ai_patterns;
drop policy if exists ai_patterns_write_owner on ai_patterns;

create policy ai_patterns_select_owner
  on ai_patterns
  for select
  to authenticated
  using (public.is_shop_owner(shop_id));

create policy ai_patterns_write_owner
  on ai_patterns
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

-- ------------------------------------------------------------
-- event_staffing_patterns
-- ------------------------------------------------------------
drop policy if exists event_patterns_select_owner on event_staffing_patterns;
drop policy if exists event_patterns_write_owner on event_staffing_patterns;

create policy event_patterns_select_owner
  on event_staffing_patterns
  for select
  to authenticated
  using (public.is_shop_owner(shop_id));

create policy event_patterns_write_owner
  on event_staffing_patterns
  for all
  to authenticated
  using (public.is_shop_owner(shop_id))
  with check (public.is_shop_owner(shop_id));

commit;

-- ------------------------------------------------------------
-- Verification queries (run manually)
-- ------------------------------------------------------------
-- select tablename, rowsecurity from pg_tables
-- where schemaname = 'public'
--   and tablename in (
--     'users','shops','shop_operating_hours','staff','staff_availability',
--     'important_dates','shift_periods','staffing_rules','scheduling_constraints',
--     'schedules','shifts','schedule_edits','ai_patterns','event_staffing_patterns'
--   )
-- order by tablename;

