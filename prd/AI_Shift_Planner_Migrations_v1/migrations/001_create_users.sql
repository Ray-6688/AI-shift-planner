begin;

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) unique not null,
  password_hash varchar(255) not null,
  role varchar(20) check (role in ('manager', 'staff')) default 'staff',
  name varchar(255),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

commit;
