const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
    'https://vtkqlrmwrqvzqdiyhmmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3Fscm13cnF2enFkaXlobW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1NjYxMSwiZXhwIjoyMDg2NzMyNjExfQ.mWa0QoLdfosJMQbCBPNinamXRqU6Bx5-bwnYDhfYH34'
);

async function testEmails() {
    console.log('--- Testing Email Conflicts ---');

    const emails = [
        'ray@soberboba.com',       // The problematic one
        'ray.manager@soberboba.com', // Alternative
        'tom.staff@soberboba.com'    // Alternative for Tom
    ];

    for (const email of emails) {
        console.log(`\nTesting ${email}...`);
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: '111111',
            email_confirm: true
        });

        if (error) {
            console.log(`❌ Failed: ${error.message}`);
        } else {
            console.log(`✅ Success! Created ${email} (${data.user.id})`);
            // Clean up immediately
            await supabaseAdmin.auth.admin.deleteUser(data.user.id);
        }
    }
}

testEmails();
