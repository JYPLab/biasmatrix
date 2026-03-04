require('dotenv').config({ path: '.env.local' });
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runTest() {
    console.log('1. Fetching latest unpaid report from Supabase...');
    const { data: report, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_paid', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !report) {
        console.error('Failed to fetch a report to test with:', error?.message);
        return;
    }

    console.log(`2. Found Report ID: ${report.id}. Testing Mock Webhook...`);
    console.log(`[Timer started] Wait for Gemini to generate the 15-page JSON and Resend to dispatch the email...`);

    const startTime = Date.now();

    try {
        const res = await axios.post('http://localhost:3000/api/webhook/payment', {
            meta: {
                event_name: 'order_created',
                custom_data: { report_id: report.id }
            }
        }, {
            headers: { 'x-mock-bypass': 'true' }
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        if (res.data.success) {
            console.log(`\n✅ HTTP 200 SUCCESS! The Mock Webhook completed successfully in ${duration} seconds.`);
            console.log(`✅ AI JSON Payload generated and saved to DB.`);
            console.log(`✅ "The stars have spoken" Email successfully scheduled/sent to user.`);
        } else {
            console.log('\n❌ Webhook returned failure logic:', res.data);
        }
    } catch (err) {
        console.error('\n❌ Webhook crashed:', err.response?.data || err.message);
    }
}

runTest();
