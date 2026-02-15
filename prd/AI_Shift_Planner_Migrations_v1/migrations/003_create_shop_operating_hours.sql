begin;

create table if not exists public.shop_operating_hours (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  day_of_week int check (day_of_week >= 0 and day_of_week <= 6) not null,
  open_time time not null,
  close_time time not null,
  is_closed boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(shop_id, day_of_week)
);

commit;
