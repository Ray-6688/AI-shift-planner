begin;

create table if not exists public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid references public.staff(id) on delete cascade,
  day_of_week int check (day_of_week >= 0 and day_of_week <= 6) not null,
  start_time time not null,
  end_time time not null,
  is_available boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(staff_id, day_of_week)
);

commit;
