import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string, error: string }
}) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-neutral-900 p-4">
            <Card className="w-full max-w-md shadow-lg border-neutral-200 dark:border-neutral-800">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                        🧋
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Sober Boba Planner
                    </CardTitle>
                    <CardDescription>
                        Enter your credentials to access the shift planner.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@soberboba.com"
                                required
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="bg-background"
                            />
                        </div>
                        {searchParams?.error && (
                            <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-2 rounded">
                                {searchParams.error}
                            </p>
                        )}
                        {searchParams?.message && (
                            <p className="text-sm font-medium text-muted-foreground text-center bg-secondary p-2 rounded">
                                {searchParams.message}
                            </p>
                        )}
                        <Button formAction={login} className="w-full font-semibold" size="lg">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground bg-neutral-50 dark:bg-neutral-950/50 rounded-b-lg p-6">
                    <p>Don't have an account?</p>
                    <p>Contact your manager to get set up.</p>
                </CardFooter>
            </Card>
        </div>
    )
}
