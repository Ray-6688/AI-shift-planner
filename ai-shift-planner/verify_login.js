const { createClient } = require('@supabase/supabase-js');

// Create a client directly with the gathered credentials
const supabase = createClient(
    'https://vtkqlrmwrqvzqdiyhmmj.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0a3Fscm13cnF2enFkaXlobW1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE1NjYxMSwiZXhwIjoyMDg2NzMyNjExfQ.mWa0QoLdfosJMQbCBPNinamXRqU6Bx5-bwnYDhfYH34'
);

async function testLogin() {
    console.log('--- Final Verification: Ray Manager ---');

    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ray.manager@soberboba.com',
        password: '1111'
    });

    if (error) {
        console.error('❌ Login Failed:', error.message);
    } else {
        console.log('✅ Login Successful!');
        console.log('User ID:', data.user.id);
        console.log('Email:', data.user.email);
    }
}

testLogin();
