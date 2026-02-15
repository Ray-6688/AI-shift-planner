import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { AddStaffDialog } from './add-staff-dialog'

export default async function StaffPage() {
    const supabase = await createClient()
    const { data: staff } = await supabase.from('staff').select('*').order('name')

    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-6 py-4 border-b flex items-center justify-between bg-white dark:bg-neutral-950">
                <div className="flex items-center gap-4">
                    <Link href="/" className="font-bold text-xl hover:opacity-80">← Home</Link>
                    <h1 className="text-xl font-semibold border-l pl-4">Staff Directory</h1>
                </div>
                <div>
                    <AddStaffDialog />
                </div>
            </header>
            <main className="p-6 max-w-5xl mx-auto w-full">
                <div className="rounded-md border bg-white shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Hours Limit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff?.map((person) => (
                                <TableRow key={person.id}>
                                    <TableCell className="font-medium">{person.name}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${person.status === 'Trainee'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {person.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{person.email}</TableCell>
                                    <TableCell>{person.hour_limit_value} / {person.hour_limit_type}</TableCell>
                                </TableRow>
                            ))}
                            {staff?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                                        No staff found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </main>
        </div>
    )
}
