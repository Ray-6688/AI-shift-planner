-- ============================================================
-- FIX LOGIN SCRIPT (SIMPLE PASSWORD)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Force update the password for Ray (Manager) to '1111'
UPDATE auth.users
SET encrypted_password = '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', -- Hash for "1111"
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    aud = 'authenticated',
    role = 'authenticated'
WHERE email = 'ray@soberboba.com';

-- Force update the password for Staff (Tom) to '1111'
UPDATE auth.users
SET encrypted_password = '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', -- Hash for "1111"
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    raw_app_meta_data = '{"provider":"email","providers":["email"]}',
    aud = 'authenticated',
    role = 'authenticated'
WHERE email = 'tom@soberboba.com';

-- Ensure public users exist (just in case)
INSERT INTO public.users (id, email, password_hash, role, name)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'ray@soberboba.com', '$2b$10$KR.saLlGgvjoZbeL9ZggpOaKyXMVcCa0Jq0yetsv5TXaFujTWJ2fq', 'manager', 'Rita')
ON CONFLICT (id) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;
