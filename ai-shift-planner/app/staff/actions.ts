'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStaff(formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user's shop
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!shop) return { error: 'Shop not found' }

    // 2. Prepare staff data
    // Note: We are creating a "user" record for them in auth.users?
    // Ideally yes, but Supabase Auth Admin API is needed for that (service_role).
    // The client-side Supabase client (logged in as Manager) CANNOT create arbitrary users without email confirmation flows usually.
    // FOR PHASE 1: We will insert into `public.users` (as a placeholder for their profile) and `public.staff`.
    // Real auth creation is a separate complex flow (invite system).
    // We will just create the Staff record for scheduling purposes. 
    // (The PRD says staff need to login, but we can defer the "invite" email part).
    // Actually, we can just insert into `staff` table?
    // The `staff` table requires a `user_id`.
    // So we MUST create a user.

    // WORKAROUND: For this prototype, we'll just generate a fake UUID for user_id 
    // or (better) we won't be able to let them login yet.
    // Wait, `user_id` in `staff` table is a foreign key to `public.users(id)`.
    // `public.users(id)` is NOT a foreign key to `auth.users(id)` strictly speaking in SQL, 
    // but it is conceptually.

    // So:
    // 1. Insert into public.users (random UUID)
    // 2. Insert into public.staff (linked to that UUID)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string // 'Staff' or 'Trainee'

    if (!name || !email) return { error: 'Name and Email required' }

    // Insert fake user profile
    const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
            email,
            name,
            role: 'staff', // fixed as staff role for the app
            password_hash: 'placeholder' // they can't login yet
        })
        .select()
        .single()

    if (userError) {
        console.error(userError)
        return { error: 'Failed to create user profile' }
    }

    // Insert staff record
    const { error: staffError } = await supabase
        .from('staff')
        .insert({
            shop_id: shop.id,
            user_id: newUser.id,
            name,
            email,
            status: role,
            // Defaults
            can_shop_opening: true,
            can_shop_closing: true,
            can_bubble_tea_making: true,
            hour_limit_type: 'monthly',
            hour_limit_value: 120
        })

    if (staffError) {
        console.error(staffError)
        return { error: 'Failed to create staff record' }
    }

    revalidatePath('/staff')
    return { success: true }
}
