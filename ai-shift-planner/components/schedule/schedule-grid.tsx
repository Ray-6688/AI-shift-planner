'use client'

import React, { useState, useTransition } from 'react'
import {
    DndContext,
    DragOverlay,
    useSensor,
    useSensors,
    PointerSensor,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import { format, addDays, parseISO } from 'date-fns'
import { DayColumn } from './day-column'
import { ShiftCard } from './shift-card'
import { StaffDragItem } from './staff-drag-item'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { generateSchedule, saveShift, publishSchedule } from '@/app/schedule/actions'
import { toast } from 'sonner'

interface ScheduleGridProps {
    weekStartDate: string // YYYY-MM-DD
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialSchedule: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    staff: any[]
}

export function ScheduleGrid({ weekStartDate, initialSchedule, staff }: ScheduleGridProps) {
    const [isPending, startTransition] = useTransition()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeDragItem, setActiveDragItem] = useState<any>(null)

    // Optimistic State - placeholder for now (removed for linting)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    const weekStart = parseISO(weekStartDate)
    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))

    // -- Handlers --

    function handleDragStart(event: DragStartEvent) {
        setActiveDragItem(event.active.data.current)
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        setActiveDragItem(null)

        if (!over) return

        const type = active.data.current?.type
        const overId = over.id as string // 'yyyy-MM-dd'

        if (type === 'new-shift') {
            if (!initialSchedule?.id) {
                toast.error('Generate a schedule first before adding shifts.')
                return
            }

            const staffId = active.data.current?.staffId
            const dateStr = overId // The day column ID

            // Default times for drag-drop
            const startTime = `${dateStr}T09:00:00`
            const endTime = `${dateStr}T17:00:00`

            startTransition(async () => {
                try {
                    await saveShift({
                        schedule_id: initialSchedule.id,
                        staff_id: staffId,
                        start_time: startTime,
                        end_time: endTime,
                        role_type: active.data.current?.roleType
                    })
                    toast.success('Shift created')
                } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Failed to create shift'
                    toast.error(msg)
                }
            })
        }

        // Handle moving existing shift (later)
    }

    const handleGenerate = () => {
        startTransition(async () => {
            try {
                const res = await generateSchedule(weekStartDate)
                if (res.success) toast.success(`Generated ${res.count} shifts`)
                else toast.error(res.error || 'Failed to generate schedule')
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to generate schedule'
                toast.error(msg)
            }
        })
    }

    const handlePublish = () => {
        if (!initialSchedule) return
        startTransition(async () => {
            try {
                await publishSchedule(initialSchedule.id)
                toast.success('Schedule Published!')
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Failed to publish schedule'
                toast.error(msg)
            }
        })
    }

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full">
                {/* Toolbar */}
                <div className="flex justify-between items-center p-4 border-b bg-background">
                    <div className="flex gap-2">
                        <Button
                            onClick={handleGenerate}
                            disabled={isPending || initialSchedule?.status === 'published'}
                            variant="outline"
                        >
                            {isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Generate AI Schedule
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={isPending || !initialSchedule || initialSchedule.status === 'published'}
                        >
                            {initialSchedule?.status === 'published' ? 'Published' : 'Publish'}
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Status: <span className="font-medium capitalize">{initialSchedule?.status || 'Draft'}</span>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r p-4 bg-muted/10 overflow-y-auto">
                        <h3 className="font-semibold mb-3">Staff</h3>
                        <div className="space-y-2">
                            {staff.map(s => (
                                <StaffDragItem key={s.id} staff={s} />
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 flex overflow-x-auto">
                        {days.map(date => {
                            const dateStr = format(date, 'yyyy-MM-dd')
                            // Filter shifts for this day by ISO string prefix
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const daysShifts = (initialSchedule?.shifts || []).filter((s: any) =>
                                s.start_time.startsWith(dateStr)
                            )

                            return (
                                <DayColumn
                                    key={dateStr}
                                    date={date}
                                    shifts={daysShifts}
                                    staff={staff}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Overlay for dragging visuals */}
            <DragOverlay>
                {activeDragItem ? (
                    activeDragItem.type === 'shift' ? (
                        <ShiftCard
                            shift={activeDragItem.shift}
                            isOverlay
                        />
                    ) : (
                        <StaffDragItem
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            staff={staff.find((s: any) => s.id === activeDragItem.staffId)}
                            isOverlay
                        />
                    )
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}
