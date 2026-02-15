begin;

create table if not exists public.scheduling_constraints (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  constraint_type varchar(50) not null,
  is_enabled boolean default true,
  config jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

commit;
