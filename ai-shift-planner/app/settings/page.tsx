import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ShopSettingsForm } from './shop-form'

export default async function SettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: shop } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    if (!shop) redirect('/onboarding')

    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-neutral-950">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold text-xl hover:opacity-80">← Home</Link>
                    <h1 className="text-xl font-semibold border-l pl-4">Shop Settings</h1>
                </div>
            </header>
            <main className="p-6 max-w-2xl mx-auto w-full space-y-6">
                <ShopSettingsForm shop={shop} />

                <div className="opacity-50 pointer-events-none">
                    {/* Placeholder for future sections */}
                    <div className="border rounded-lg p-6 bg-white">
                        <h3 className="font-semibold mb-2">Operating Hours</h3>
                        <p className="text-sm text-muted-foreground">Coming in Phase 2</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
