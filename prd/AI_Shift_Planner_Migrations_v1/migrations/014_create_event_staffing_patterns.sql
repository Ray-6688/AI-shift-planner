begin;

create table if not exists public.event_staffing_patterns (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  event_type varchar(100) not null,
  shift_period_id uuid references public.shift_periods(id) on delete cascade,
  avg_staff_assigned decimal(3,1),
  occurrences int default 0,
  last_occurred date,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(shop_id, event_type, shift_period_id)
);

commit;
