'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/login?error=Invalid login credentials')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function signup(_formData: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const supabase = createClient()

    // This is a placeholder. In Phase 1 we only use seeded users.
    // Real signup is not required yet, or restricted to Managers only.

    redirect('/login?message=Signup is disabled for Phase 1. Please use seeded accounts.')
}
