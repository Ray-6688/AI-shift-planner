begin;

create table if not exists public.important_dates (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  name varchar(255) not null,
  date date not null,
  type varchar(50) check (type in ('holiday', 'busy_event', 'regular_event')) default 'regular_event',
  shop_closed boolean default false,
  affects_staffing boolean default false,
  notes text,
  source varchar(50) default 'manual',
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(shop_id, date, name)
);

commit;
