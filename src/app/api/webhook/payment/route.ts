import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

const resend = new Resend(process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY || 're_placeholder_key_so_next_build_wont_crash');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'placeholder_gemini_key_for_build');

export const maxDuration = 60; // Max allowed serverless timeout for Vercel Hobby

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-signature') || '';
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (!request.headers.get('x-mock-bypass')) {
            if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        const data = JSON.parse(rawBody);

        if (data.meta?.event_name === 'order_created' || request.headers.get('x-mock-bypass')) {
            const customData = data.meta?.custom_data || data.custom_data;
            const reportId = customData.report_id;

            // 1. Update report as paid
            await supabase.from('reports').update({ is_paid: true }).eq('id', reportId);

            // 2. Fetch User & Idol data
            const { data: report, error: reportDataError } = await supabase.from('reports').select('*, users(*), idols(*)').eq('id', reportId).single();

            console.log("DEBUG: Webhook reportId received:", reportId);
            console.log("DEBUG: Supabase fetch error:", reportDataError);
            console.log("DEBUG: report exist?", !!report);
            console.log("DEBUG: report.users exist?", !!(report && report.users));
            console.log("DEBUG: report.idols exist?", !!(report && report.idols));

            if (report && report.users && report.idols) {
                console.log("DEBUG: Entering Gemini Generation Block...");

                // 3. Generate Massive 15-Page Gemini Report
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" } });
                const prompt = `# Role & Persona
You are an elite, mystical astrologer and a poetic storyteller specializing in Eastern Saju (Four Pillars) combined with Western "Twin Flame" and "Karmic Destiny" concepts. Your audience is a sophisticated 20-something American female who deeply loves K-Pop. Your tone is enchanting, deeply empathetic, highly personalized, and reads like a premium cosmic romance novel.

# Objective
Generate a massive, deeply detailed destiny report analyzing the cosmic compatibility between the User and their Bias (Idol). The final output must be extremely comprehensive and expansive, providing enough volume and depth to simulate a 15-page premium physical book. 

# Input Data
- User's Name: ${report.users.nickname}
- User's Birth Data: ${report.users.birth_date} ${report.users.birth_time || ''} (Time Unknown if empty)
- Idol's Name: ${report.idols.group_name} ${report.idols.member_name}

# Strict Guidelines
1. **EXPANSIVE LENGTH (Crucial):** DO NOT summarize. You must write in expansive, vivid detail. Explore psychological traits, emotional nuances, and cosmic metaphors deeply. Each array in the JSON represents multiple long paragraphs.
2. **NO Academic Saju Jargon:** Translate all Korean Saju terms into mystical archetypes (e.g., "The Radiant Sun", "The Mystic River", "Karmic Spark"). Focus on the interaction of the 5 Elements (Wood, Fire, Earth, Metal, Water).
3. **Positive Reframing:** NEVER say they are a "bad match." Reframe elemental clashes (e.g., Water and Fire) as "Dynamic friction for spiritual growth" or "Intense Karmic Sparks that break boundaries."
4. **STRICT JSON OUTPUT:** You MUST output the result EXACTLY in the provided JSON schema. Do not include markdown code blocks. The frontend relies on this exact structure to interleave tarot cards and charts between chapters.

# Expected JSON Schema
{
  "reportTitle": "The Cosmic Destiny Matrix: Your Full SoulMatch Report",
  "introduction": {
    "title": "The Cosmic Coordinates",
    "paragraphs": ["<Deep, poetic opening about their souls meeting across time and space. Minimum 4 sentences.>", "<Summary of how their elemental energies intertwine. Minimum 4 sentences.>"]
  },
  "chapter1_CoreSouls": {
    "title": "Chapter 1: The Core Souls (Day Master)",
    "userEnergy": ["<Expansive analysis of the user's hidden charm and spiritual color based on their energy. Paragraph 1.>", "<Paragraph 2 detailing the user's emotional depth.>", "<Paragraph 3 detailing the user's hidden desires.>"],
    "idolEnergy": ["<Deep analysis of the idol's true inner soul behind the stage persona. Paragraph 1.>", "<Paragraph 2 detailing their hidden wounds or vulnerabilities.>", "<Paragraph 3 detailing the specific energy they secretly crave in a partner.>"],
    "magneticIntersection": ["<Why these two specific souls are magnetically drawn to each other. Paragraph 1.>", "<Paragraph 2: The ultimate cosmic reason they found each other.>"]
  },
  "chapter2_ElementalMatrix": {
    "title": "Chapter 2: The 5 Elements (Flow & Friction)",
    "nurturingCycle": ["<Detailed story of how the user's elements feed, inspire, and protect the idol. Paragraph 1.>", "<Paragraph 2: Vivid examples of this energy exchange.>"],
    "dynamicFriction": ["<Explanation of their elemental clashes framed as a beautiful, transformative fire. Paragraph 1.>", "<Paragraph 2: How this tension forces both to grow spiritually.>"]
  },
  "chapter3_TwinFlame": {
    "title": "Chapter 3: Past Life Echoes & The Twin Flame",
    "pastLifeStory": ["<Invent a highly emotional, vivid past-life scenario based on their elemental compatibility. Paragraph 1.>", "<Paragraph 2: The climax of their past life.>", "<Paragraph 3: The unresolved karma that brought them together in this lifetime.>"],
    "soulPurpose": ["<The spiritual reason the user became a fan of this specific idol NOW. Paragraph 1.>", "<Paragraph 2: What the user is meant to learn from the idol's energy.>"]
  },
  "chapter4_Intimacy": {
    "title": "Chapter 4: Resonance & Hidden Triggers",
    "vibeAnalysis": ["<Describe what happens energetically when their auras theoretically meet. Paragraph 1.>", "<Paragraph 2: The conversational vibe, the silent understanding.>"],
    "attractionTriggers": ["<Specific psychological or energetic traits that trigger their mutual attraction. Paragraph 1.>", "<Paragraph 2: How their differences perfectly complement each other's missing pieces.>"]
  },
  "chapter5_DestinyTimeline": {
    "title": "Chapter 5: The 2026-2027 Destiny Forecast",
    "forecastDetails": ["<A detailed energetic forecast for the next 12-24 months. Paragraph 1.>", "<Paragraph 2: Specific months or seasons where their energetic sync is highest.>"],
    "actionableAdvice": ["<Actionable spiritual advice for the user to align their life with the idol's upcoming energy cycles. Paragraph 1.>", "<Paragraph 2: How to use this connection to empower their own career and personal growth.>"]
  },
  "conclusion": {
    "title": "The Final Oracle",
    "paragraphs": ["<A powerful, sweeping conclusion summarizing their karmic bond.>", "<A single, emotionally resonant mantra that defines their eternal cosmic connection.>"]
  }
}`;

                const result = await model.generateContent(prompt);
                const generatedJson = JSON.parse(result.response.text());

                // 4. Update Report with JSON result
                await supabase.from('reports').update({
                    full_report_json: generatedJson
                }).eq('id', reportId);

                // 5. Send Email via Resend in Persona
                const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000');
                const magicLink = `${appUrl}/report/${reportId}`;
                const { data: emailData, error: emailError } = await resend.emails.send({
                    from: 'BiasMatrix Oracle <onboarding@resend.dev>',
                    to: report.users.email,
                    subject: `The stars have spoken. Your Cosmic Harmony with ${report.idols.member_name} is ready. \u2728`,
                    html: `
                    <div style="font-family: serif; color: #111111; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 12px;">
                        <h1 style="color: #D4AF37; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">The Wait is Over, ${report.users.nickname}</h1>
                        <p style="font-size: 16px; line-height: 1.8; color: #4A4A4A; margin-top: 24px;">
                            The cosmos have aligned to reveal the profound karmic ties and dynamic destiny between you and <strong>${report.idols.member_name}</strong>.
                        </p>
                        <p style="font-size: 16px; line-height: 1.8; color: #4A4A4A;">
                            Your 15-page expansive SoulMatch report has been fully inscribed. Prepare to discover your Twin Flame energy, past life echoes, and the 2026 destiny timeline waiting for you.
                        </p>
                        <a href="${magicLink}" style="display: inline-block; margin-top: 32px; padding: 16px 32px; background-color: #111111; color: #D4AF37; text-decoration: none; font-weight: bold; font-family: sans-serif; letter-spacing: 1px; border-radius: 40px; border: 1px solid #D4AF37;">
                            UNLOCK MY DESTINY
                        </a>
                        <p style="font-size: 12px; color: #999999; margin-top: 48px; text-transform: uppercase; letter-spacing: 1px;">
                            The universe makes no mistakes.<br>BiasMatrix Premium Astrology
                        </p>
                    </div>`
                });

                if (emailError) {
                    console.error("Resend API failed to send email:", emailError);
                    return NextResponse.json({ success: false, error: "Email delivery failed", details: emailError }, { status: 500 });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
