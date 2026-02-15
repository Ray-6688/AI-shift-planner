'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateShopSettings(formData: FormData) {
    const supabase = await createClient()

    // 1. Get current user's shop
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const timezone = formData.get('timezone') as string
    const id = formData.get('id') as string

    if (!id) return { error: 'Shop ID missing' }

    // 2. Update shop
    const { error } = await supabase
        .from('shops')
        .update({ name, timezone })
        .eq('id', id)
        .eq('owner_id', user.id) // Security check

    if (error) {
        return { error: 'Failed to update shop' }
    }

    revalidatePath('/settings')
    revalidatePath('/') // Update dashboard too
    return { success: true }
}
