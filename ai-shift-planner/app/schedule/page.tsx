import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { fetchSchedule } from './actions'
import { ScheduleGrid } from '@/components/schedule/schedule-grid'
import { startOfWeek, format, parseISO } from 'date-fns'
import { redirect } from 'next/navigation'

interface SchedulePageProps {
    searchParams: Promise<{ date?: string }>
}

export default async function SchedulePage(props: SchedulePageProps) {
    const searchParams = await props.searchParams

    // 1. Determine Current Week
    const today = new Date()
    // If date param provided, use it. Else default to start of current week.
    let targetDate = today
    if (searchParams?.date) {
        targetDate = parseISO(searchParams.date)
    }

    // Always align to Monday of that week for the grid
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }) // Monday start
    const weekStartStr = format(weekStart, 'yyyy-MM-dd')

    // 2. Fetch Data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Get Shop
    const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()
    const shop = data as { id: string } | null

    if (!shop) return <div className="p-8">Shop not found. Please complete onboarding.</div>

    // Get Staff
    const { data: staff } = await supabase
        .from('staff')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('is_active', true)
        .order('name')

    // Get Schedule
    const schedule = await fetchSchedule(weekStartStr)

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="px-6 py-4 border-b flex items-center justify-between">
                <h1 className="text-xl font-bold">Schedule: {weekStartStr}</h1>
            </header>

            <main className="flex-1 overflow-hidden">
                <ScheduleGrid
                    weekStartDate={weekStartStr}
                    initialSchedule={schedule}
                    staff={staff || []}
                />
            </main>
        </div>
    )
}
