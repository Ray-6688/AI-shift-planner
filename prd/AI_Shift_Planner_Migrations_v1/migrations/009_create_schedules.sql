begin;

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  week_start_date date not null,
  status varchar(20) check (status in ('draft', 'ai_generated', 'edited', 'published')) default 'draft',
  created_by uuid references public.users(id),
  published_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now(),
  unique(shop_id, week_start_date)
);

commit;
