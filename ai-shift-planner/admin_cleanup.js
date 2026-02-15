const { createClient } = require('@supabase/supabase-js');

// Admin client with Service Role Key
const supabaseAdmin = createClient(
    'https://vtkqlrmwrqvzqdiyhmmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3Fscm13cnF2enFkaXlobW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1NjYxMSwiZXhwIjoyMDg2NzMyNjExfQ.mWa0QoLdfosJMQbCBPNinamXRqU6Bx5-bwnYDhfYH34'
);

async function cleanupUsers() {
    console.log('--- Cleaning Up Corruption via Admin API ---');

    const emails = ['ray@soberboba.com', 'tom@soberboba.com'];

    // 1. Delete Staff records (Foreign Key to users)
    console.log('Deleting Staff records...');
    const { error: staffError } = await supabaseAdmin
        .from('staff')
        .delete()
        .in('email', emails);

    if (staffError) console.error('❌ Staff Delete Error:', staffError.message);
    else console.log('✅ Staff deleted.');

    // 2. Delete Public Users (Foreign Key to auth users usually, or source of constraint)
    console.log('Deleting Public User profiles...');
    const { error: userError } = await supabaseAdmin
        .from('users')
        .delete()
        .in('email', emails);

    if (userError) console.error('❌ Public User Delete Error:', userError.message);
    else console.log('✅ Public Users deleted.');

    // 3. Delete Auth Users
    console.log('Deleting Auth Users...');
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
        console.error('List Error:', listError);
        return;
    }

    const targets = users.filter(u => emails.includes(u.email));
    for (const u of targets) {
        const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(u.id);
        if (delError) console.error(`❌ Failed to delete auth user ${u.email}:`, delError.message);
        else console.log(`✅ Deleted auth user: ${u.email}`);
    }
}

cleanupUsers();
