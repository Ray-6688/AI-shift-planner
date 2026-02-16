'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { addDays, format, getDay, parseISO } from 'date-fns'
import { Database } from '@/utils/supabase/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Helper: Checks if a schedule is editable (not published).
 * Throws error if published.
 */
async function checkScheduleEditable(supabase: SupabaseClient<Database>, scheduleId: string) {
    const { data } = await supabase
        .from('schedules')
        .select('status')
        .eq('id', scheduleId)
        .single()

    // Force cast for partial select using 'any' to bypass 'never'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schedule = data as any as { status: Database['public']['Tables']['schedules']['Row']['status'] } | null

    if (schedule?.status === 'published') {
        throw new Error('Cannot edit a published schedule.')
    }
}

/**
 * Fetches the schedule for a specific week and shop.
 * If strictly no schedule exists, returns null.
 */
export async function fetchSchedule(weekStartDate: string) {
    const supabase = await createClient() as SupabaseClient<Database>
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get Shop First
    const { data } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shop = data as any as { id: string } | null

    if (!shop) throw new Error('Shop not found')

    // Fetch Schedule
    const { data: schedule, error } = await supabase
        .from('schedules')
        .select(`
      *,
      shifts (
        id,
        staff_id,
        start_time,
        end_time,
        role_type
      )
    `)
        .eq('shop_id', shop.id)
        .eq('week_start_date', weekStartDate)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching schedule:', error)
        throw error // Real error
    }

    // If no schedule found, return null (Frontend handles "Generate" button)
    return schedule || null
}

/**
 * Creates a new draft schedule for the week.
 */
export async function createSchedule(weekStartDate: string) {
    const supabase = await createClient() as SupabaseClient<Database>
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shop = data as any as { id: string } | null
    if (!shop) throw new Error('Shop not found')

    // Force cast the builder to any to bypass strict type checks on insert
    const { data: newSchedule, error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('schedules') as any)
        .insert({
            shop_id: shop.id,
            week_start_date: weekStartDate,
            status: 'draft'
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath('/schedule')
    return newSchedule
}

/**
 * Saves/Updates a single shift.
 */
export async function saveShift(shift: {
    id?: string,
    schedule_id: string,
    staff_id?: string | null,
    start_time: string,
    end_time: string,
    role_type?: string | null
}) {
    const supabase = await createClient() as SupabaseClient<Database>

    // Guard: Check if schedule is published
    await checkScheduleEditable(supabase, shift.schedule_id)

    // Validation: Check for overlaps (Basic) & Availability
    if (shift.staff_id && shift.start_time && shift.end_time) {

        // 1. Availability Check
        const shiftDate = new Date(shift.start_time)
        // correct getDay: 0=Sun, 1=Mon... DB: 0=Mon, 6=Sun
        const jsDay = getDay(shiftDate)
        const dbDay = jsDay === 0 ? 6 : jsDay - 1

        const { data: availability } = await supabase
            .from('staff_availability')
            .select('start_time, end_time, is_available')
            .eq('staff_id', shift.staff_id)
            .eq('day_of_week', dbDay)
            .single()

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const avail = availability as any as { start_time: string, end_time: string, is_available: boolean } | null

        // If no record exists, assume available (MVP).
        // If record exists, enforce availability window.
        if (avail) {
            if (!avail.is_available) {
                throw new Error('Staff is marked as unavailable on this day.')
            }

            // Check times using minutes-since-midnight for reliable comparison
            const shiftStartParts = shift.start_time.split('T')[1].split(':')
            const shiftEndParts = shift.end_time.split('T')[1].split(':')
            const shiftStartMins = parseInt(shiftStartParts[0]) * 60 + parseInt(shiftStartParts[1])
            const shiftEndMins = parseInt(shiftEndParts[0]) * 60 + parseInt(shiftEndParts[1])

            const availStartParts = avail.start_time.slice(0, 5).split(':')
            const availEndParts = avail.end_time.slice(0, 5).split(':')
            const availStartMins = parseInt(availStartParts[0]) * 60 + parseInt(availStartParts[1])
            const availEndMins = parseInt(availEndParts[0]) * 60 + parseInt(availEndParts[1])

            if (shiftStartMins < availStartMins || shiftEndMins > availEndMins) {
                throw new Error(`Shift is outside of staff availability (${avail.start_time} - ${avail.end_time}).`)
            }
        }

        // 2. Overlap Check
        // Cast to any to bypass strict type checks on the select builder for now
        const { data: existingShifts } = await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('shifts') as any)
            .select('id, start_time, end_time')
            .eq('schedule_id', shift.schedule_id)
            .eq('staff_id', shift.staff_id)

        const safeShifts = existingShifts as { id: string, start_time: string, end_time: string }[] | null

        if (safeShifts) {
            const newStart = new Date(shift.start_time).getTime()
            const newEnd = new Date(shift.end_time).getTime()

            for (const s of safeShifts) {
                // Skip self (if updating)
                if (shift.id && s.id === shift.id) continue;

                const existingStart = new Date(s.start_time).getTime()
                const existingEnd = new Date(s.end_time).getTime()

                // Overlap formula: (StartA < EndB) and (EndA > StartB)
                if (newStart < existingEnd && newEnd > existingStart) {
                    // console.log('Overlap detected:', { newStart, newEnd, existingStart, existingEnd })
                    throw new Error('Shift overlaps with an existing shift used by this staff member.')
                }
            }
        }
    }

    // Upsert with cast
    const { data, error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('shifts') as any)
        .upsert({
            id: shift.id,
            schedule_id: shift.schedule_id,
            staff_id: shift.staff_id,
            start_time: shift.start_time,
            end_time: shift.end_time,
            role_type: shift.role_type,
            date: shift.start_time.split('T')[0],
            duration_hours: (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / (1000 * 60 * 60)
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath('/schedule')
    return data
}

/**
 * Publishes a schedule.
 */
export async function publishSchedule(scheduleId: string) {
    const supabase = await createClient() as SupabaseClient<Database>

    const { error } = await (supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('schedules') as any)
        .update({ status: 'published' })
        .eq('id', scheduleId)

    if (error) throw error
    revalidatePath('/schedule')
    return { success: true }
}

/**
 * Deletes a shift.
 */
export async function deleteShift(shiftId: string) {
    const supabase = await createClient() as SupabaseClient<Database>

    // We need schedule_id to check status. Fetch it first.
    const { data } = await supabase.from('shifts').select('schedule_id').eq('id', shiftId).single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shift = data as any as { schedule_id: string } | null
    if (shift) {
        await checkScheduleEditable(supabase, shift.schedule_id)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('shifts') as any).delete().eq('id', shiftId)
    if (error) throw error
    revalidatePath('/schedule')
    return { success: true }
}

/**
 * Generates a schedule based on staffing rules.
 */
export async function generateSchedule(weekStartDate: string) {
    const supabase = await createClient() as SupabaseClient<Database>
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 1. Get Shop
    const { data } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shop = data as any as { id: string } | null
    if (!shop) throw new Error('Shop not found')

    // 2. Get/Create Schedule
    let scheduleId: string
    const { data: existingData } = await supabase
        .from('schedules')
        .select('id, status')
        .eq('shop_id', shop.id)
        .eq('week_start_date', weekStartDate)
        .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = existingData as any as { id: string, status: Database['public']['Tables']['schedules']['Row']['status'] } | null

    if (existing) {
        if (existing.status === 'published') {
            return { success: false, error: 'Cannot regenerate a published schedule.' }
        }
        scheduleId = existing.id
        // Clear existing shifts to regenerate
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('shifts') as any).delete().eq('schedule_id', scheduleId)
    } else {
        const { data: newSchedule } = await (supabase
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .from('schedules') as any)
            .insert({
                shop_id: shop.id,
                week_start_date: weekStartDate,
                status: 'draft'
            })
            .select('id')
            .single()

        if (!newSchedule) throw new Error('Failed to create schedule')
        scheduleId = newSchedule.id
    }

    // 3. Fetch Constraints & Resources
    // Cast to any to bypass 'never' on select
    const { data: operatingHoursData } = await supabase.from('shop_operating_hours').select('*').eq('shop_id', shop.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const operatingHours = operatingHoursData as any as Database['public']['Tables']['shop_operating_hours']['Row'][] | null

    const { data: allPeriodsData } = await supabase.from('shift_periods').select('*').eq('shop_id', shop.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allPeriods = allPeriodsData as any as Database['public']['Tables']['shift_periods']['Row'][] | null

    const { data: allRulesData } = await supabase.from('staffing_rules').select('*').eq('shop_id', shop.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allRules = allRulesData as any as Database['public']['Tables']['staffing_rules']['Row'][] | null

    const { data: staffListData } = await supabase.from('staff').select('*').eq('shop_id', shop.id).eq('is_active', true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const staffList = staffListData as any as Database['public']['Tables']['staff']['Row'][] | null

    if (!staffList || staffList.length === 0) {
        return { success: false, error: 'No staff available' }
    }

    // Scope availability to only the staff in this shop
    const staffIds = staffList.map(s => s.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: availabilityData } = await (supabase.from('staff_availability') as any)
        .select('*')
        .in('staff_id', staffIds)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allAvailability = availabilityData as any as Database['public']['Tables']['staff_availability']['Row'][] | null

    // 4. Generate Shifts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newShifts: any[] = []
    const start = parseISO(weekStartDate)
    let staffIndex = 0

    // Loop 7 days
    for (let i = 0; i < 7; i++) {
        const currentDate = addDays(start, i)
        // const dateStr = format(currentDate, 'yyyy-MM-dd')
        const jsDay = getDay(currentDate) // 0=Sun, 1=Mon...

        // Map to DB Day: JS 0(Sun)->6, JS 1(Mon)->0
        const dbDay = jsDay === 0 ? 6 : jsDay - 1

        // Check Operating Hours
        const ops = operatingHours?.find(oh => oh.day_of_week === dbDay)
        if (ops?.is_closed) continue

        // Determine Day Type
        const isWeekend = dbDay >= 5 // Sat(5), Sun(6)
        const dayType = isWeekend ? 'weekend' : 'weekday'

        // Get applicable periods
        const periods = allPeriods?.filter(p => p.day_type === dayType) || []

        for (const period of periods) {
            // Get rules for this period
            const rule = allRules?.find(r => r.shift_period_id === period.id && r.day_type === dayType)
            const countNeeded = rule?.staff_count || 1

            for (let c = 0; c < countNeeded; c++) {
                // Find available staff
                // We need to check if the staff is available on this dbDay and covers the period time.

                // Filter staff valid for this specific slot
                const availableCandidates = staffList.filter(staff => {
                    const avail = allAvailability?.find(a => a.staff_id === staff.id && a.day_of_week === dbDay)

                    // No availability record → assume available (MVP behavior)
                    if (!avail) return true

                    // Explicitly marked as not available
                    if (!avail.is_available) return false

                    // Check that the shift period fits within the availability window
                    // Use minutes-since-midnight for reliable comparison
                    const pStartParts = period.start_time.split(':')
                    const pEndParts = period.end_time.split(':')
                    const pStart = parseInt(pStartParts[0]) * 60 + parseInt(pStartParts[1])
                    const pEnd = parseInt(pEndParts[0]) * 60 + parseInt(pEndParts[1])

                    const aStartParts = avail.start_time.slice(0, 5).split(':')
                    const aEndParts = avail.end_time.slice(0, 5).split(':')
                    const aStart = parseInt(aStartParts[0]) * 60 + parseInt(aStartParts[1])
                    const aEnd = parseInt(aEndParts[0]) * 60 + parseInt(aEndParts[1])

                    return pStart >= aStart && pEnd <= aEnd
                })

                if (availableCandidates.length === 0) {
                    // console.warn(`No staff available for ${dayType} ${period.start_time}-${period.end_time}`)
                    continue
                }

                // Round Robin Selection from CANDIDATES only
                // We use a global index but matched against candidates? 
                // Simple approach: Pick one from candidates using the global counter to distribute load?
                // Or just pick candidates[index % length]

                const staffMember = availableCandidates[staffIndex % availableCandidates.length]
                staffIndex++

                // Make sure we have a correct timestamp for DB
                // format: YYYY-MM-DDTHH:mm:ss
                const startDateStr = format(currentDate, 'yyyy-MM-dd')

                newShifts.push({
                    schedule_id: scheduleId,
                    staff_id: staffMember.id,
                    start_time: `${startDateStr}T${period.start_time}:00`,
                    end_time: `${startDateStr}T${period.end_time}:00`,
                    role_type: staffMember.status,
                    date: startDateStr,
                    duration_hours: (parseISO(`${startDateStr}T${period.end_time}:00`).getTime() - parseISO(`${startDateStr}T${period.start_time}:00`).getTime()) / (1000 * 60 * 60)
                })
            }
        }
    }

    // 5. Bulk Insert
    if (newShifts.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await (supabase.from('shifts') as any).insert(newShifts)
        if (insertError) {
            console.error('Insert Error:', insertError)
            return { success: false, error: insertError.message }
        }
    }

    revalidatePath('/schedule')
    return { success: true, count: newShifts.length }
}
