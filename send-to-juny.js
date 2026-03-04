async function testJunyFresh() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
        console.error("Missing Supabase env vars in .env.local.");
        return;
    }

    const headers = {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    // 1. Find User by email
    const userRes = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.juny21c@gmail.com&select=id`, { headers });
    const users = await userRes.json();
    if (!users || users.length === 0) { console.error("User juny21c@gmail.com not found."); return; }
    const userId = users[0].id;

    // 2. Find any valid idol
    const idolRes = await fetch(`${supabaseUrl}/rest/v1/idols?select=id,member_name&limit=1`, { headers });
    const idols = await idolRes.json();
    if (!idols || idols.length === 0) { console.error("No idols found."); return; }
    const idolId = idols[0].id;
    console.log(`Using User: ${userId} & Idol: ${idols[0].member_name} (${idolId})`);

    // 3. Create a FRESH report
    const createRes = await fetch(`${supabaseUrl}/rest/v1/reports`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            user_id: userId,
            idol_id: idolId,
            is_paid: false,
            energy_score: 95
        })
    });
    const createdReports = await createRes.json();
    const reportId = createdReports[0].id;
    console.log(`✅ Created Fresh Report ID: ${reportId}`);

    // 4. Trigger webhook against local server
    console.log(`\n⏳ Triggering Webhook POST. Wait 15-20 seconds...`);
    const startTime = Date.now();

    try {
        const webhookRes = await fetch("http://localhost:3000/api/webhook/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-mock-bypass": "true" },
            body: JSON.stringify({
                meta: { event_name: 'order_created', custom_data: { report_id: reportId } }
            })
        });

        const text = await webhookRes.text();
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        if (webhookRes.ok) {
            console.log(`\n✅ HTTP 200 SUCCESS! Target email 'juny21c@gmail.com' dispatched via Resend. Time: ${duration}s`);
        } else {
            console.error(`\n❌ Error:`, text);
        }
    } catch (e) {
        console.error("Fetch crashed:", e);
    }
}

testJunyFresh();
