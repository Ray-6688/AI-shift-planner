const { createClient } = require('@supabase/supabase-js');

// Admin client with Service Role Key
const supabaseAdmin = createClient(
    'https://vtkqlrmwrqvzqdiyhmmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3Fscm13cnF2enFkaXlobW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1NjYxMSwiZXhwIjoyMDg2NzMyNjExfQ.mWa0QoLdfosJMQbCBPNinamXRqU6Bx5-bwnYDhfYH34'
);

async function provisionUsers() {
    console.log('--- Provisioning Users (New Emails) ---');

    const users = [
        {
            email: 'ray.manager@soberboba.com',
            password: '1111',
            name: 'Rita',
            role: 'manager',
            shopName: 'Sober Boba Fisketorvet'
        },
        {
            email: 'tom.staff@soberboba.com',
            password: '1111',
            name: 'Tom',
            role: 'staff'
        }
    ];

    let shopId = 'b0000000-0000-0000-0000-000000000001';

    for (const u of users) {
        console.log(`Processing ${u.email}...`);

        // 1. Create or Get User
        let userId;
        const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        const existing = allUsers.find(user => user.email === u.email);

        if (existing) {
            console.log(`  - Auth User exists (${existing.id}). Sending password reset...`);
            userId = existing.id;
            await supabaseAdmin.auth.admin.updateUserById(userId, { password: u.password, email_confirm: true });
        } else {
            console.log(`  - Creating Auth User...`);
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true,
                user_metadata: { name: u.name }
            });
            if (error) {
                console.error('  ❌ Create Error:', error.message);
                continue;
            }
            userId = data.user.id;
        }
        console.log(`  - User ID: ${userId}`);

        // 2. Upsert Public User Profile
        const { error: profileError } = await supabaseAdmin
            .from('users')
            .upsert({
                id: userId,
                email: u.email,
                name: u.name,
                role: u.role,
                password_hash: 'managed_by_auth'
            })
            .select();

        if (profileError) console.error('  ❌ Profile Error:', profileError.message);
        else console.log('  ✅ Public Profile Synced');

        // 3. Handle Shop (If Manager)
        if (u.role === 'manager') {
            const { error: shopError } = await supabaseAdmin
                .from('shops')
                .upsert({
                    id: shopId,
                    owner_id: userId,
                    name: u.shopName,
                    timezone: 'Europe/Copenhagen',
                    week_start: 'monday'
                });
            if (shopError) console.error('  ❌ Shop Error:', shopError.message);
            else console.log('  ✅ Shop Linked');
        }

        // 4. Handle Staff Record
        if (u.role === 'staff') {
            const { error: staffError } = await supabaseAdmin
                .from('staff')
                .upsert({
                    shop_id: shopId,
                    user_id: userId,
                    name: u.name,
                    email: u.email,
                    status: 'Staff',
                    color: '#3b82f6', // Added color
                    can_shop_opening: true,
                    can_bubble_tea_making: true,
                    can_shop_closing: true,
                    hour_limit_type: 'monthly',
                    hour_limit_value: 120
                });
            if (staffError) console.error('  ❌ Staff Error:', staffError.message);
            else console.log('  ✅ Staff Record Synced');
        }
    }
}

provisionUsers();
