begin;

create table if not exists public.staffing_rules (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  day_type varchar(20) check (day_type in ('weekday', 'weekend', 'special')) not null,
  shift_period_id uuid references public.shift_periods(id) on delete cascade,
  staff_count int not null default 1,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(shop_id, day_type, shift_period_id)
);

commit;
