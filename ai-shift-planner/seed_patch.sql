-- ============================================================
-- PATCH SEED SCRIPT (Rest of Demo Data)
-- Run this AFTER logging in successfully.
-- This adds the remaining staff, shifts, and rules.
-- ============================================================

BEGIN;

-- ── 1. Additional Staff Users (Emma, Sarah, etc.) ────────────
-- Use hardcoded IDs for these extra users. Password '1111'
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, aud, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('a0000000-0000-0000-0000-000000000003', 'emma@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0000000-0000-0000-0000-000000000004', 'sarah@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0000000-0000-0000-0000-000000000005', 'alex@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0000000-0000-0000-0000-000000000006', 'lisa@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a0000000-0000-0000-0000-000000000007', 'maria@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, password_hash, role, name) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'emma@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Emma'),
  ('a0000000-0000-0000-0000-000000000004', 'sarah@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Sarah'),
  ('a0000000-0000-0000-0000-000000000005', 'alex@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Alex'),
  ('a0000000-0000-0000-0000-000000000006', 'lisa@soberboba.com',  '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Lisa'),
  ('a0000000-0000-0000-0000-000000000007', 'maria@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'staff', 'Maria')
ON CONFLICT (id) DO NOTHING;

-- ── 2. Shop Data (Operating Hours) ───────────────────────────
INSERT INTO shop_operating_hours (shop_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('b0000000-0000-0000-0000-000000000001', 0, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 1, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 2, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 3, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 4, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 5, '10:00', '21:00', FALSE),
  ('b0000000-0000-0000-0000-000000000001', 6, '10:00', '21:00', FALSE)
ON CONFLICT DO NOTHING;

-- ── 3. Shifts & Rules ────────────────────────────────────────
INSERT INTO shift_periods (id, shop_id, label, start_time, end_time, day_type) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'weekday'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'weekday'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'weekday'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'weekend'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'weekend'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'weekend'),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'special'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'special'),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'special')
ON CONFLICT (id) DO NOTHING;

INSERT INTO staffing_rules (shop_id, day_type, shift_period_id, staff_count) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000001', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000002', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000003', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000004', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000005', 2),
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000006', 2),
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000007', 2),
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000008', 3),
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000009', 3)
ON CONFLICT DO NOTHING;

-- ── 4. Staff Records (Remaining Staff) ───────────────────────
INSERT INTO staff (id, shop_id, user_id, name, email, gender, status, color,
                   can_shop_opening, can_bubble_tea_making, can_shop_closing,
                   skill_shop_opening, skill_bubble_tea_making, skill_shop_closing,
                   hour_limit_type, hour_limit_value, hour_limit_reason) VALUES
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003',
   'Emma', 'emma@soberboba.com', 'Female', 'Staff', '#8b5cf6',
   TRUE, TRUE, TRUE, 4, 4, 4,
   'monthly', 160, 'Full-time contract'),

  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004',
   'Sarah', 'sarah@soberboba.com', 'Female', 'Trainee', '#10b981',
   TRUE, TRUE, FALSE, 3, 3, NULL,
   'weekly', 20, 'Student SU rules'),

  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005',
   'Alex', 'alex@soberboba.com', 'Male', 'Trainee', '#f59e0b',
   FALSE, TRUE, FALSE, NULL, 2, NULL,
   'weekly', 20, 'Student SU rules'),

  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000006',
   'Lisa', 'lisa@soberboba.com', 'Female', 'Staff', '#ef4444',
   TRUE, TRUE, TRUE, 4, 4, 3,
   'monthly', 160, 'Full-time contract'),

  ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000007',
   'Maria', 'maria@soberboba.com', 'Female', 'Trainee', '#eab308',
   FALSE, TRUE, FALSE, NULL, 3, NULL,
   'weekly', 20, 'Student SU rules')
ON CONFLICT (id) DO NOTHING;

-- ── 5. Dates & Constraints ───────────────────────────────────
INSERT INTO important_dates (shop_id, name, date, type, shop_closed, affects_staffing, notes, source) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Store Anniversary', '2026-03-15', 'busy_event', FALSE, TRUE, 'Promo day, expect 2x traffic', 'manual'),
  ('b0000000-0000-0000-0000-000000000001', 'Grundlovsdag', '2026-06-05', 'holiday', FALSE, TRUE, 'Danish Constitution Day — shop open, reduced hours', 'nager.date')
ON CONFLICT DO NOTHING;

INSERT INTO scheduling_constraints (shop_id, constraint_type, is_enabled, config) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'trainee_must_pair_with_staff', TRUE,
   '{"description": "Trainees must always be scheduled alongside at least one Staff member"}')
ON CONFLICT DO NOTHING;

COMMIT;
