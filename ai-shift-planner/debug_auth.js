const { createClient } = require('@supabase/supabase-js');

// Admin client with Service Role Key
const supabaseAdmin = createClient(
    'https://vtkqlrmwrqvzqdiyhmmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3Fscm13cnF2enFkaXlobW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1NjYxMSwiZXhwIjoyMDg2NzMyNjExfQ.mWa0QoLdfosJMQbCBPNinamXRqU6Bx5-bwnYDhfYH34'
);

async function debugAuth() {
    const timestamp = Date.now();
    const email = `test_user_${timestamp}@example.com`;

    console.log(`--- Debugging Auth Creation ---`);
    console.log(`Target Email: ${email}`);

    // Test 1: Short Password
    console.log(`\n1. Testing password "1111" (4 chars)...`);
    const { data: d1, error: e1 } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: '1111',
        email_confirm: true
    });

    if (e1) {
        console.log(`❌ Failed: ${e1.message} (Status: ${e1.status})`);
    } else {
        console.log(`✅ Success! User ID: ${d1.user.id}`);
        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(d1.user.id);
        return; // Stop if this worked
    }

    // Test 2: Longer Password
    console.log(`\n2. Testing password "111111" (6 chars)...`);
    const { data: d2, error: e2 } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: '111111',
        email_confirm: true
    });

    if (e2) {
        console.log(`❌ Failed: ${e2.message} (Status: ${e2.status})`);
    } else {
        console.log(`✅ Success! User ID: ${d2.user.id}`);
        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(d2.user.id);
    }
}

debugAuth();
