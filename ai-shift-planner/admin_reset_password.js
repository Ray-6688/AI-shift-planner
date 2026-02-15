const { createClient } = require('@supabase/supabase-js');

// Admin client with Service Role Key
const supabaseAdmin = createClient(
    'https://vtkqlrmwrqvzqdiyhmmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3Fscm13cnF2enFkaXlobW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1NjYxMSwiZXhwIjoyMDg2NzMyNjExfQ.mWa0QoLdfosJMQbCBPNinamXRqU6Bx5-bwnYDhfYH34'
);

async function resetPasswords() {
    console.log('--- Resetting Passwords via Admin API ---');

    const users = [
        { email: 'ray@soberboba.com', password: '1111' },
        { email: 'tom@soberboba.com', password: '1111' }
    ];

    for (const u of users) {
        console.log(`Processing ${u.email}...`);

        // 1. Check if user exists
        // (Note: admin.listUsers isn't always efficient for single lookup, but fine for script)
        // Better: just try to update. If fails, create.

        // Attempt update by email? No, update needs ID usually.
        // Let's list users first to find ID.
        const { data: { users: allUsers }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

        if (listError) {
            console.error('List Error:', listError);
            continue;
        }

        const existingUser = allUsers.find(user => user.email === u.email);

        if (existingUser) {
            console.log(`User found (${existingUser.id}). Updating password...`);
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                existingUser.id,
                { password: u.password, email_confirm: true }
            );
            if (updateError) console.error('Update Error:', updateError);
            else console.log('✅ Password Updated.');
        } else {
            console.log('User not found. Creating...');
            const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: u.email,
                password: u.password,
                email_confirm: true
            });
            if (createError) console.error('Create Error:', createError);
            else console.log('✅ User Created.');
        }
    }
}

resetPasswords();
