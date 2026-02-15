import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function OnboardingPage() {
    const supabase = await createClient()

    // Check if user already has a shop. If so, redirect to dashboard.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (shop) {
        redirect('/')
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome to Sober Boba Planner</h1>
                <p className="text-muted-foreground text-lg">Let's get your shop set up in a few simple steps.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Create your Shop</CardTitle>
                    <CardDescription>Tell us the name and location of your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createShop} className="space-y-4">
                        {/* Form fields placeholdered for now */}
                        <p className="text-sm text-yellow-600 bg-yellow-50 p-4 rounded-md">
                            ⚠️ Note: Since you logged in with a seeded account, you likely already have a shop linked.
                            If you are seeing this, it might be because the seed data linkage isn't detected or you are a new user.
                        </p>
                        <Button type="submit">Create Shop</Button>
                    </form>
                </CardContent>
            </Card>

        </div>
    )
}

async function createShop(formData: FormData) {
    'use server'
    // Logic to insert shop
    redirect('/')
}
