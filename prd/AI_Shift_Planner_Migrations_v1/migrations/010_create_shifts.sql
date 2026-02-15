begin;

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.schedules(id) on delete cascade,
  shift_period_id uuid references public.shift_periods(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  date date not null,
  duration_hours decimal(4,2) not null,
  ai_confidence decimal(3,2),
  ai_reasoning text,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

commit;
