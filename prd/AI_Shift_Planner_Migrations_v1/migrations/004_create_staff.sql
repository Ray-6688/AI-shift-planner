begin;

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,

  name varchar(255) not null,
  email varchar(255),
  phone varchar(20),
  gender varchar(20),
  status varchar(20) check (status in ('Staff', 'Trainee')) default 'Staff',
  color varchar(7) not null,

  can_shop_opening boolean default false,
  can_bubble_tea_making boolean default false,
  can_shop_closing boolean default false,

  skill_shop_opening int check (skill_shop_opening >= 1 and skill_shop_opening <= 5),
  skill_bubble_tea_making int check (skill_bubble_tea_making >= 1 and skill_bubble_tea_making <= 5),
  skill_shop_closing int check (skill_shop_closing >= 1 and skill_shop_closing <= 5),

  hour_limit_type varchar(20) check (hour_limit_type in ('weekly', 'monthly')) default 'monthly',
  hour_limit_value int not null default 160,
  hour_limit_reason varchar(255),

  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

commit;
