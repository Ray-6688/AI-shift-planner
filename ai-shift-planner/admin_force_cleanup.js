const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    'https://vtkqlrmwrqvzqdiyhmmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3Fscm13cnF2enFkaXlobW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1NjYxMSwiZXhwIjoyMDg2NzMyNjExfQ.mWa0QoLdfosJMQbCBPNinamXRqU6Bx5-bwnYDhfYH34'
);

async function forceCleanup() {
    console.log('--- Force Cleanup Auth Users ---');

    const knownIds = [
        'a0000000-0000-0000-0000-000000000001', // Ray Seed ID
        'a0000000-0000-0000-0000-000000000002'  // Tom Seed ID
    ];

    // 1. Delete by ID
    console.log('Deleting by Known Seed IDs...');
    for (const id of knownIds) {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
        if (error) console.log(`  - ID ${id}: User not found or error (${error.message})`);
        else console.log(`  - ID ${id}: Deleted.`);
    }

    // 2. Scan and Delete by Email (Pagination fix)
    console.log('Scanning all users for emails...');
    const emails = ['ray@soberboba.com', 'tom@soberboba.com'];

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listError) console.error('List Error:', listError);
    else {
        console.log(`  - Found ${users.length} total users.`);
        const targets = users.filter(u => emails.includes(u.email));
        console.log(`  - Found ${targets.length} matching emails.`);

        for (const u of targets) {
            const { error } = await supabaseAdmin.auth.admin.deleteUser(u.id);
            if (error) console.error(`  - Failed to delete ${u.email} (${u.id}):`, error.message);
            else console.log(`  - Deleted ${u.email} (${u.id})`);
        }
    }
}

forceCleanup();
