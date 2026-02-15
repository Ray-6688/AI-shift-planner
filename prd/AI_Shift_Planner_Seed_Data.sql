-- ============================================================
-- seed_data.sql
-- Sober Boba Fisketorvet — Development Test Data
-- Run AFTER all migrations are applied
-- ============================================================

-- ── 1. Manager User ──────────────────────────────────────────
-- Password: "SoberBoba2026!" — hash below is a PLACEHOLDER
-- Generate real hash: node -e "require('bcrypt').hash('SoberBoba2026!', 12).then(console.log)"
INSERT INTO users (id, email, password_hash, role, name) VALUES
  ('a0000000-0000-0000-0000-000000000001',
   'ray@soberboba.com',
   '$2b$12$PLACEHOLDER_GENERATE_REAL_HASH_AT_RUNTIME',
   'manager',
   'Rita');

-- ── 2. Shop ──────────────────────────────────────────────────
INSERT INTO shops (id, name, timezone, week_start, owner_id) VALUES
  ('b0000000-0000-0000-0000-000000000001',
   'Sober Boba Fisketorvet',
   'Europe/Copenhagen',
   'monday',
   'a0000000-0000-0000-0000-000000000001');

-- ── 2b. Shop Operating Hours ────────────────────────────────
-- day_of_week: 0=Monday, 6=Sunday
INSERT INTO shop_operating_hours (shop_id, day_of_week, open_time, close_time, is_closed) VALUES
  ('b0000000-0000-0000-0000-000000000001', 0, '10:00', '21:00', FALSE),  -- Monday
  ('b0000000-0000-0000-0000-000000000001', 1, '10:00', '21:00', FALSE),  -- Tuesday
  ('b0000000-0000-0000-0000-000000000001', 2, '10:00', '21:00', FALSE),  -- Wednesday
  ('b0000000-0000-0000-0000-000000000001', 3, '10:00', '21:00', FALSE),  -- Thursday
  ('b0000000-0000-0000-0000-000000000001', 4, '10:00', '21:00', FALSE),  -- Friday
  ('b0000000-0000-0000-0000-000000000001', 5, '10:00', '21:00', FALSE),  -- Saturday
  ('b0000000-0000-0000-0000-000000000001', 6, '10:00', '21:00', FALSE);  -- Sunday

-- ── 3. Shift Periods ─────────────────────────────────────────
INSERT INTO shift_periods (id, shop_id, label, start_time, end_time, day_type) VALUES
  -- Weekday shifts
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'weekday'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'weekday'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'weekday'),
  -- Weekend shifts
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'weekend'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'weekend'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'weekend'),
  -- Special day shifts (same times, different staffing rules)
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'Opening',  '10:00', '11:00', 'special'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', 'Morning',  '11:00', '16:00', 'special'),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', 'Evening',  '16:00', '21:00', 'special');

-- ── 4. Staffing Rules (headcount per shift per day_type) ─────
INSERT INTO staffing_rules (shop_id, day_type, shift_period_id, staff_count) VALUES
  -- Weekday: 1 per shift
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000001', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000002', 1),
  ('b0000000-0000-0000-0000-000000000001', 'weekday', 'c0000000-0000-0000-0000-000000000003', 1),
  -- Weekend: 1-2 per shift (busier)
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000004', 1), -- Opening
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000005', 2), -- Morning
  ('b0000000-0000-0000-0000-000000000001', 'weekend', 'c0000000-0000-0000-0000-000000000006', 2), -- Evening
  -- Special: 2-3 per shift
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000007', 2),
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000008', 3),
  ('b0000000-0000-0000-0000-000000000001', 'special', 'c0000000-0000-0000-0000-000000000009', 3);

-- ── 5. Staff Users (for portal login) ────────────────────────
-- Password for all staff: "Staff2026!" — hashes are PLACEHOLDERS
-- Generate real hashes: node -e "require('bcrypt').hash('Staff2026!', 12).then(console.log)"
INSERT INTO users (id, email, password_hash, role, name) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'tom@soberboba.com',   '$2b$12$PLACEHOLDER', 'staff', 'Tom'),
  ('a0000000-0000-0000-0000-000000000003', 'emma@soberboba.com',  '$2b$12$PLACEHOLDER', 'staff', 'Emma'),
  ('a0000000-0000-0000-0000-000000000004', 'sarah@soberboba.com', '$2b$12$PLACEHOLDER', 'staff', 'Sarah'),
  ('a0000000-0000-0000-0000-000000000005', 'alex@soberboba.com',  '$2b$12$PLACEHOLDER', 'staff', 'Alex'),
  ('a0000000-0000-0000-0000-000000000006', 'lisa@soberboba.com',  '$2b$12$PLACEHOLDER', 'staff', 'Lisa'),
  ('a0000000-0000-0000-0000-000000000007', 'maria@soberboba.com', '$2b$12$PLACEHOLDER', 'staff', 'Maria');

-- ── 6. Staff Records ─────────────────────────────────────────
INSERT INTO staff (id, shop_id, user_id, name, email, gender, status, color,
                   can_shop_opening, can_bubble_tea_making, can_shop_closing,
                   skill_shop_opening, skill_bubble_tea_making, skill_shop_closing,
                   hour_limit_type, hour_limit_value, hour_limit_reason) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002',
   'Tom', 'tom@soberboba.com', 'Male', 'Staff', '#3b82f6',
   TRUE, TRUE, TRUE, 5, 5, 4,
   'monthly', 160, 'Full-time contract'),

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
   'weekly', 20, 'Student SU rules');

-- ── 7. Staff Availability ────────────────────────────────────
-- day_of_week: 0=Monday, 6=Sunday (ISO convention, NOT JS getDay())

-- Tom: Mon–Sun 8:00–23:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000001', 0, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 1, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 2, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 3, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 4, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 5, '08:00', '23:00'),
  ('d0000000-0000-0000-0000-000000000001', 6, '08:00', '23:00');

-- Emma: Mon–Fri 9:00–18:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000002', 0, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 1, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 2, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 3, '09:00', '18:00'),
  ('d0000000-0000-0000-0000-000000000002', 4, '09:00', '18:00');

-- Sarah: Mon/Wed/Fri 11:00–21:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000003', 0, '11:00', '21:00'),
  ('d0000000-0000-0000-0000-000000000003', 2, '11:00', '21:00'),
  ('d0000000-0000-0000-0000-000000000003', 4, '11:00', '21:00');

-- Alex: Tue/Thu/Sat 14:00–22:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000004', 1, '14:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000004', 3, '14:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000004', 5, '14:00', '22:00');

-- Lisa: Tue–Sun 10:00–22:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000005', 1, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 2, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 3, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 4, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 5, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000005', 6, '10:00', '22:00');

-- Maria: Sat/Sun 10:00–22:00
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  ('d0000000-0000-0000-0000-000000000007', 5, '10:00', '22:00'),
  ('d0000000-0000-0000-0000-000000000007', 6, '10:00', '22:00');

-- ── 8. Important Dates (sample) ──────────────────────────────
INSERT INTO important_dates (shop_id, name, date, type, shop_closed, affects_staffing, notes, source) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Store Anniversary', '2026-03-15', 'busy_event', FALSE, TRUE, 'Promo day, expect 2x traffic', 'manual'),
  ('b0000000-0000-0000-0000-000000000001', 'Grundlovsdag', '2026-06-05', 'holiday', FALSE, TRUE, 'Danish Constitution Day — shop open, reduced hours', 'nager.date'),
  ('b0000000-0000-0000-0000-000000000001', 'Christmas Eve', '2026-12-24', 'holiday', TRUE, FALSE, 'Shop closed', 'nager.date'),
  ('b0000000-0000-0000-0000-000000000001', 'Cinema Premiere Night', '2026-02-20', 'busy_event', FALSE, TRUE, 'DGI Byen major release, expect surge after 19:00', 'manual');

-- ── 9. Default Scheduling Constraints ────────────────────────
INSERT INTO scheduling_constraints (shop_id, constraint_type, is_enabled, config) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'trainee_must_pair_with_staff', TRUE,
   '{"description": "Trainees must always be scheduled alongside at least one Staff member"}'),
  ('b0000000-0000-0000-0000-000000000001', 'closing_requires_skill', TRUE,
   '{"min_skill_level": 3, "description": "Closing shift requires at least one closer with skill >= 3"}'),
  ('b0000000-0000-0000-0000-000000000001', 'no_opening_and_evening_same_day', FALSE,
   '{"description": "Avoid scheduling same person for Opening + Evening (long gap). Soft constraint."}');
