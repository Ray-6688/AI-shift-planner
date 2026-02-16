'use client'

import { useDroppable } from '@dnd-kit/core'
import { format } from 'date-fns'
import { ShiftCard } from './shift-card'
import { cn } from '@/lib/utils'

interface DayColumnProps {
    date: Date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shifts: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    staff: any[]
    isOverlay?: boolean
}

export function DayColumn({ date, shifts, staff, isOverlay }: DayColumnProps) {
    const dateStr = format(date, 'yyyy-MM-dd')
    const { setNodeRef, isOver } = useDroppable({
        id: dateStr,
        data: {
            type: 'day-column',
            date: dateStr
        }
    })

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex-1 min-w-[150px] border-r last:border-r-0 flex flex-col h-full bg-background transition-colors",
                isOver ? "bg-accent/50" : ""
            )}
        >
            <div className="p-3 border-b text-center sticky top-0 bg-background z-10">
                <div className="font-semibold">{format(date, 'EEEE')}</div>
                <div className="text-sm text-muted-foreground">{format(date, 'MMM d')}</div>
            </div>

            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {shifts.map(shift => {
                    const staffMember = staff.find(s => s.id === shift.staff_id)
                    return (
                        <ShiftCard
                            key={shift.id}
                            shift={shift}
                            staffName={staffMember?.name}
                            roleColor={staffMember?.color}
                            isOverlay={isOverlay}
                        />
                    )
                })}
                {shifts.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground italic opacity-50">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    )
}
