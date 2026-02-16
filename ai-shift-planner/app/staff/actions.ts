'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Deterministic color palette for new staff members
const STAFF_COLORS = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#eab308', '#06b6d4', '#ec4899',
]

export async function addStaff(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()
    const shop = data as { id: string } | null

    if (!shop) return { error: 'Shop not found' }

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const role = formData.get('role') as string // 'Staff' or 'Trainee'

    if (!name || !email) return { error: 'Name and Email required' }

    // Insert placeholder user profile (real auth invite is a separate flow)
    const { data: newUser, error: userError } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('users') as any)
        .insert({
            email,
            name,
            role: 'staff',
            password_hash: 'placeholder'
        })
        .select()
        .single()

    if (userError) {
        console.error(userError)
        return { error: 'Failed to create user profile' }
    }

    // Pick a color from the palette based on existing staff count
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase.from('staff') as any)
        .select('id', { count: 'exact', head: true })
        .eq('shop_id', shop.id)
    const color = STAFF_COLORS[(count ?? 0) % STAFF_COLORS.length]

    // Insert staff record
    const { error: staffError } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('staff') as any)
        .insert({
            shop_id: shop.id,
            user_id: newUser.id,
            name,
            email,
            status: role || 'Staff',
            color,
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
