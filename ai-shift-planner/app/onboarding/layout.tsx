import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <header className="border-b bg-white dark:bg-slate-950 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <span>🛠️</span>
                    <span>Setup Wizard</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    {user.email}
                </div>
            </header>
            <main className="flex-1 container max-w-3xl mx-auto py-12 px-4">
                {children}
            </main>
        </div>
    )
}
