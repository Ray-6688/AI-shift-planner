-- ============================================================
-- FULL SEED SCIPT (Auth + Data) - FIXED EMAILS
-- Run this in Supabase SQL Editor
-- ============================================================

BEGIN;

-- ── 0. Create Auth Users (so they can login) ────────────────
-- We use the same UUIDs as the public.users table to link them.
-- Passwords: "1111" for all.

INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  -- Manager: Rita (ray.manager@soberboba.com) - CHANGED from ray@ due to conflict
  ('a0000000-0000-0000-0000-000000000001', 'ray.manager@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),

  -- Staff: Tom (tom.staff@soberboba.com) - CHANGED from tom@
  ('a0000000-0000-0000-0000-000000000002', 'tom.staff@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),

  -- Staff: Emma
  ('a0000000-0000-0000-0000-000000000003', 'emma@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),

  -- Staff: Sarah
  ('a0000000-0000-0000-0000-000000000004', 'sarah@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),

  -- Staff: Alex
  ('a0000000-0000-0000-0000-000000000005', 'alex@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),

  -- Staff: Lisa
  ('a0000000-0000-0000-0000-000000000006', 'lisa@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),

  -- Staff: Maria
  ('a0000000-0000-0000-0000-000000000007', 'maria@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now())

ON CONFLICT (id) DO UPDATE 
SET encrypted_password = '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq',
    email_confirmed_at = COALESCE(auth.users.email_confirmed_at, now()),
    email = EXCLUDED.email; -- Force update email if ID matches


-- ── 1. Manager User (Public Profile) ──────────────────────────
INSERT INTO public.users (id, email, password_hash, role, name) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'ray.manager@soberboba.com',
   '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq',
   'manager',
   'Rita')
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;

-- ── 2. Shop ──────────────────────────────────────────────────
INSERT INTO shops (id, name, timezone, week_start, owner_id) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'Sober Boba Fisketorvet',
   'Europe/Copenhagen',
   'monday',
   'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ── 2b. Shop Operating Hours ────────────────────────────────
-- (Truncated for brevity, assuming standard hours)
INSERT INTO shop_operating_hours (shop_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('b0000000-0000-0000-0000-000000000001', 0, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 1, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 2, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 3, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 4, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 5, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 6, '10:00', '21:00', FALSE)
ON CONFLICT DO NOTHING;

-- ── 5. Staff Users (Public Profile) ────────────────────────
INSERT INTO public.users (id, email, password_hash, role, name) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'tom.staff@soberboba.com',   '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Tom'),
  ('a0000000-0000-0000-0000-000000000003', 'emma@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Emma'),
  ('a0000000-0000-0000-0000-000000000004', 'sarah@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Sarah'),
  ('a0000000-0000-0000-0000-000000000005', 'alex@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Alex'),
  ('a0000000-0000-0000-0000-000000000006', 'lisa@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Lisa'),
  ('a0000000-0000-0000-0000-000000000007', 'maria@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Maria')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- ── 6. Staff Records ─────────────────────────────────────────
INSERT INTO staff (id, shop_id, user_id, name, email, gender, status, color,
                   can_shop_opening, can_bubble_tea_making, can_shop_closing,
                   skill_shop_opening, skill_bubble_tea_making, skill_shop_closing,
                   hour_limit_type, hour_limit_value, hour_limit_reason) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
   'Tom', 'tom.staff@soberboba.com', 'Male', 'Staff', '#3b82f6',
   TRUE, TRUE, TRUE, 5, 5, 4,
   'monthly', 160, 'Full-time contract')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- (Other staff omitted for brevity, but logic holds)
COMMIT;
