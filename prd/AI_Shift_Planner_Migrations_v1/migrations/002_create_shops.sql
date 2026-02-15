begin;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  timezone varchar(50) default 'Europe/Copenhagen',
  week_start varchar(10) default 'monday',
  owner_id uuid references public.users(id) on delete cascade,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

commit;
