import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SchedulePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-neutral-950">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold text-xl hover:opacity-80">← Home</Link>
                    <h1 className="text-xl font-semibold border-l pl-4">Week Schedule</h1>
                </div>
            </header>
            <main className="p-6">
                <div className="border border-dashed rounded-lg p-12 text-center text-muted-foreground">
                    Schedule Planner Interface (Coming Soon)
                </div>
            </main>
        </div>
    )
}
