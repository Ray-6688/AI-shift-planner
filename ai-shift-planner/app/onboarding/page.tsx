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
                <p className="text-muted-foreground mt-2">You&apos;re all set! Your shop is ready to go.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Create your Shop</CardTitle>
                    <CardDescription>Tell us the name and location of your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createShop} className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Shop Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                minLength={3}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="My Awesome Boba Shop"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            This is the name that will be displayed on your schedules.
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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const name = formData.get('name') as string

    // Simple validation
    if (!name || name.length < 3) {
        // ideally return error state, but for MVP/alpha causing server error or redirecting back works
        // We'll throw for now to stop process
        throw new Error('Shop name must be at least 3 characters')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('shops') as any).insert({
        owner_id: user.id,
        name: name
    })

    if (error) {
        console.error('Failed to create shop:', error)
        throw new Error('Failed to create shop')
    }

    redirect('/')
}
