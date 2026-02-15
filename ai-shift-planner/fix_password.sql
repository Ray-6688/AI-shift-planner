-- ============================================================
-- FIX LOGIN SCRIPT
-- Run this in Supabase SQL Editor
-- ============================================================

-- Force update the password for Ray (Manager)
UPDATE auth.users
SET encrypted_password = '$2b$10$szRPIsi7iK.RTL7z9f959.AJLQYUPOSwxBMz/cQbeqMiqadJJNL0G', -- Hash for "SoberBoba2026!"
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    aud = 'authenticated',
    role = 'authenticated'
WHERE email = 'ray@soberboba.com';

-- Force update the password for Staff (Tom) - just in case
UPDATE auth.users
SET encrypted_password = '$2b$10$1hHRm9aKc0LLWufZGYljkehO4cGaSJ8w/1VQqMS7.8CwB180QPY9G', -- Hash for "Staff2026!"
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    aud = 'authenticated',
    role = 'authenticated'
WHERE email = 'tom@soberboba.com';

-- Ensure the public.users are set correctly (if they were missing)
INSERT INTO public.users (id, email, password_hash, role, name)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'ray@soberboba.com', '$2b$10$szRPIsi7iK.RTL7z9f959.AJLQYUPOSwxBMz/cQbeqMiqadJJNL0G', 'manager', 'Rita')
ON CONFLICT (id) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
