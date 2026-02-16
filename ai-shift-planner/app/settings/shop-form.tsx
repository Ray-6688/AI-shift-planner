'use client'

import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { updateShopSettings } from './actions'
import { toast } from 'sonner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ShopSettingsForm({ shop }: { shop: any }) {

    async function handleSubmit(formData: FormData) {
        const result = await updateShopSettings(formData)
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success('Shop settings updated')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                    Update your shop&apos;s basic information.
                </CardDescription>
            </CardHeader>
            <form action={handleSubmit}>
                <CardContent className="space-y-4">
                    <input type="hidden" name="id" value={shop.id} />
                    <div className="space-y-2">
                        <Label htmlFor="name">Shop Name</Label>
                        <Input id="name" name="name" defaultValue={shop.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Input id="timezone" name="timezone" defaultValue={shop.timezone} required />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button type="submit">Save Changes</Button>
                </CardFooter>
            </form>
        </Card>
    )
}
