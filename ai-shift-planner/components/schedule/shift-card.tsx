'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { extractTime } from './utils'

interface ShiftCardProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shift: any // Typed later with Database['public']['Tables']['shifts']['Row']
    staffName?: string
    roleColor?: string
    isOverlay?: boolean
}

export function ShiftCard({ shift, staffName, roleColor, isOverlay }: ShiftCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: shift.id,
        data: {
            type: 'shift',
            shift // Pass full shift data
        }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "p-2 text-xs mb-2 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all",
                isDragging ? "opacity-50 ring-2 ring-primary" : "",
                isOverlay ? "rotate-2 scale-105 shadow-xl cursor-grabbing" : ""
            )}
        >
            <div className="flex justify-between items-start">
                <span className="font-semibold truncate">{staffName || 'Unassigned'}</span>
                {shift.role_type && (
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: roleColor || '#cbd5e1' }}
                    />
                )}
            </div>
            <div className="text-muted-foreground mt-1">
                {extractTime(shift.start_time)} - {extractTime(shift.end_time)}
            </div>
        </Card>
    )
}
