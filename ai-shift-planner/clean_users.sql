-- ============================================================
-- CLEANUP SCRIPT
-- Run this in Supabase SQL Editor
-- This removes the users completely so we can re-create them cleanly via API.
-- ============================================================

BEGIN;

-- 1. Delete Staff records
DELETE FROM public.staff WHERE email IN ('ray@soberboba.com', 'tom@soberboba.com');

-- 2. Delete Shop ownerships (temporarily, will re-link)
-- Actually, deleting the owner might trigger cascade or fail.
-- Let's update shop owner to NULL temporarily if needed, or just delete shop?
-- Constraint: shops_owner_id_fkey
-- IF we delete the user, and cascade is set, shop might go?
-- Let's check schemas?
-- Usually simpler to just keep shop but we need an owner.
-- Let's NOT delete the shop.

-- 3. Delete Public Users
DELETE FROM public.users WHERE email IN ('ray@soberboba.com', 'tom@soberboba.com');

-- 4. Delete Auth Users
DELETE FROM auth.users WHERE email IN ('ray@soberboba.com', 'tom@soberboba.com');

COMMIT;
