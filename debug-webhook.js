async function debugWebhook() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
        console.error("Missing Supabase env vars.");
        return;
    }

    // 1. Fetch latest unpaid report
    const res = await fetch(`${supabaseUrl}/rest/v1/reports?is_paid=eq.false&select=id&order=created_at.desc&limit=1`, {
        headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
        }
    });

    const reports = await res.json();
    if (!reports || reports.length === 0) {
        console.log("No unpaid reports found.");
        return;
    }
    const reportId = reports[0].id;
    console.log(`Testing with Report ID: ${reportId}`);

    // 2. Trigger local webhook
    console.log("Sending POST to http://localhost:3000/api/webhook/payment...");
    try {
        const webhookRes = await fetch("http://localhost:3000/api/webhook/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-mock-bypass": "true"
            },
            body: JSON.stringify({
                meta: {
                    event_name: 'order_created',
                    custom_data: { report_id: reportId }
                }
            })
        });

        const text = await webhookRes.text();
        console.log(`\nWebhook Status: ${webhookRes.status}`);
        console.log(`Webhook Response:\n${text}`);
    } catch (e) {
        console.error("Local fetch crashed:", e);
    }
}

debugWebhook();
