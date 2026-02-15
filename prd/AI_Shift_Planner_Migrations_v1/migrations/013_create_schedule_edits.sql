begin;

create table if not exists public.schedule_edits (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.schedules(id) on delete cascade,
  shift_id uuid references public.shifts(id) on delete cascade,
  edited_by uuid references public.users(id),
  edit_type varchar(50) not null,
  old_value jsonb,
  new_value jsonb,
  timestamp timestamp default now()
);

commit;
