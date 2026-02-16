import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Database } from '@/utils/supabase/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export default async function Dashboard() {
  const supabase = await createClient() as SupabaseClient<Database>

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user has a shop (Onboarding check)
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // Force type check
  const typedShop = shop as Database['public']['Tables']['shops']['Row'] | null

  if (!typedShop) {
    redirect('/onboarding')
  }

  // Sign Out Action
  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between bg-white dark:bg-neutral-950">
        <h1 className="font-bold text-xl">🧋 Sober Boba Planner</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground mr-2">Shop:</span>
            <span className="font-medium">{typedShop.name}</span>
          </div>
          <form action={signOut}>
            <Button variant="outline" size="sm">Sign Out</Button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 bg-neutral-50 dark:bg-neutral-900">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <div className="col-span-1 p-6 bg-white rounded-lg shadow-sm border flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Build Schedule</h2>
            <p className="text-sm text-neutral-500 mb-4 flex-1">Create a new shift schedule for the upcoming week.</p>
            <Link href="/schedule">
              <Button className="w-full">Open Planner</Button>
            </Link>
          </div>

          <div className="col-span-1 p-6 bg-white rounded-lg shadow-sm border flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Manage Staff</h2>
            <p className="text-sm text-neutral-500 mb-4 flex-1">Add, remove, or edit staff profiles and availability.</p>
            <Link href="/staff">
              <Button variant="secondary" className="w-full">View Staff</Button>
            </Link>
          </div>

          <div className="col-span-1 p-6 bg-white rounded-lg shadow-sm border flex flex-col">
            <h2 className="text-lg font-semibold mb-2">Shop Settings</h2>
            <p className="text-sm text-neutral-500 mb-4 flex-1">Configure operating hours and staffing patterns.</p>
            <Link href="/settings">
              <Button variant="secondary" className="w-full">Settings</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
