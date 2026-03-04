async function testFlow() {
    console.log("1. Generating Initial Teaser for juny21c@gmail.com...");
    try {
        const energyRes = await fetch("http://localhost:3000/api/analyze-energy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "juny21c@gmail.com",
                nickname: "Juny",
                birth_date: "1994-10-10",
                birth_city: "Seoul",
                longitude: 126.978,
                is_time_known: false,
                birth_time: "",
                idol_id: "e441fe9b-a010-4665-bee6-63085add9473" // Stray Kids - Hyunjin (Assuming generic existing UUID or Supabase handles FK; wait, if FK fails it returns error. Let's fetch one idol first)
            })
        });

        // If we don't know a valid idol_id, let's fetch one from Supabase first
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const idolsRes = await fetch(`${supabaseUrl}/rest/v1/idols?select=id,member_name&limit=1`, {
            headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
        });
        const idols = await idolsRes.json();
        const validIdolId = idols[0]?.id;

        console.log(`Using Idol: ${idols[0]?.member_name} (${validIdolId})`);

        // Actual Request
        const actualEnergyRes = await fetch("http://localhost:3000/api/analyze-energy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "juny21c@gmail.com",
                nickname: "Juny",
                birth_date: "1994-10-10",
                birth_city: "Seoul",
                longitude: 126.978,
                is_time_known: false,
                birth_time: "",
                idol_id: validIdolId
            })
        });

        const energyData = await actualEnergyRes.json();
        if (!energyData.success) {
            console.error("Failed to generate teaser:", energyData);
            return;
        }

        const reportId = energyData.reportId;
        console.log(`✅ Teaser Generated. Report ID: ${reportId}`);

        console.log(`\n2. Triggering Webhook to generate 15-page AI report and send email to juny21c@gmail.com...`);
        console.log(`[Waiting for Gemini to write 15 pages...]`);
        const startTime = Date.now();

        const webhookRes = await fetch("http://localhost:3000/api/webhook/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-mock-bypass": "true" },
            body: JSON.stringify({
                meta: { event_name: 'order_created', custom_data: { report_id: reportId } }
            })
        });

        const webhookData = await webhookRes.json();
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        if (webhookData.success) {
            console.log(`\n✨ SUCCESS! Webhook completed in ${duration}s. Email sent to juny21c@gmail.com!`);
        } else {
            console.error("\n❌ Webhook Failed:", webhookData);
        }

    } catch (e) {
        console.error("Test script crashed:", e);
    }
}

testFlow();
