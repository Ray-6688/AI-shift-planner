begin;

create table if not exists public.shift_periods (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  label varchar(50) not null,
  start_time time not null,
  end_time time not null,
  day_type varchar(20) check (day_type in ('weekday', 'weekend', 'special')) not null,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(shop_id, label, day_type)
);

commit;
