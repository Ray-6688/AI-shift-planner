'use client'

import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface StaffDragItemProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    staff: any // Typed later
    isOverlay?: boolean
}

export function StaffDragItem({ staff, isOverlay }: StaffDragItemProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `new-shift-${staff.id}`, // Unique ID for creating new shift
        data: {
            type: 'new-shift',
            staffId: staff.id,
            roleType: staff.status
        }
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                "flex items-center gap-2 p-2 rounded-md border text-sm cursor-grab hover:bg-accent transition-colors",
                isDragging ? "opacity-50" : "",
                isOverlay ? "bg-background shadow-lg rotate-2 cursor-grabbing" : "bg-card"
            )}
        >
            <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: staff.color || '#cbd5e1' }}
            />
            <span className="font-medium">{staff.name}</span>
            <span className="text-xs text-muted-foreground ml-auto">{staff.status}</span>
        </div>
    )
}
