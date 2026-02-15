begin;

create table if not exists public.ai_patterns (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  staff_id uuid references public.staff(id) on delete cascade,
  shift_period_id uuid references public.shift_periods(id) on delete cascade,
  day_of_week int check (day_of_week >= 0 and day_of_week <= 6),
  assignment_count int default 0,
  opportunity_count int default 0,
  last_assigned_date date,
  confidence decimal(5,2),
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(shop_id, staff_id, shift_period_id, day_of_week)
);

commit;
