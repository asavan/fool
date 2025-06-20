import { createClient } from '@supabase/supabase-js'


const SUPABASE_URL  = 'https://loefudeavvvjjbysohhv.supabase.co'
const SUPA_API_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvZWZ1ZGVhdnZ2ampieXNvaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MDk1MTIsImV4cCI6MjA2NDQ4NTUxMn0.VwC1aoCOw20piHx5w-cHLE4R3PiInmWdE-4oKBtjuoU';

async function main() {
    const supabase = createClient(SUPABASE_URL, SUPA_API_ANON_KEY);
    const myChannel = supabase.channel('test-channel');
    // Subscribe to the Channel
    const resp = await myChannel.send({
        type: 'broadcast',
        event: 'myevent',
        payload: { message: 'hello, world' },
    });
    console.log("resp", resp);
}

main();
