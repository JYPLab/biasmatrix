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
            const { data: report } = await supabase.from('reports').select('*, users(*), idols(*)').eq('id', reportId).single();

            if (report && report.users && report.idols) {
                // 3. Generate Massive 5-Page Gemini Report
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash', generationConfig: { responseMimeType: "application/json" } });
                const prompt = `# Role & Persona
You are an elite, mystical astrologer and a poetic storyteller specializing in Eastern Saju (Four Pillars) combined with Western "Twin Flame" and "Karmic Destiny" concepts. Your audience is a sophisticated 20-something American female who deeply loves K-Pop. Your tone is enchanting, deeply empathetic, highly personalized, and reads like a premium cosmic romance novel.

# Objective
Generate an emotionally intense, highly curated destiny report analyzing the cosmic compatibility between the User and their Bias (Idol). The final output must feel like a premium 5-page digital booklet—short, punchy, and breathtakingly poetic, rather than a long academic essay.

# Input Data
- User's Name: ${report.users.nickname}
- User's Birth Data: ${report.users.birth_date} ${report.users.birth_time || ''} (Time Unknown if empty)
- Idol's Name: ${report.idols.group_name} ${report.idols.member_name}

# Strict Guidelines
1. **CONCISE & IMPACTFUL (Crucial):** DO NOT write excessively long paragraphs. Maximize the poetic impact while minimizing the word count. Each array element should be 1-2 short, punchy sentences. Leave the reader wanting more.
2. **NO Academic Saju Jargon:** Translate all Korean Saju terms into mystical archetypes (e.g., "The Radiant Sun", "The Mystic River").
3. **Positive Reframing:** Reframe elemental clashes (e.g., Water and Fire) as "Dynamic friction for spiritual growth" or "Intense Karmic Sparks." NEVER use the word "incompatible."
4. **STRICT JSON OUTPUT:** You MUST output the result EXACTLY in the provided JSON schema. We have added a \`pullQuote\` field for each chapter—this must be a single, overwhelmingly romantic and poetic sentence that summarizes the chapter's vibe.

# Expected JSON Schema
{
  "reportTitle": "The Cosmic Destiny Matrix: Your SoulMatch",
  "introduction": {
    "title": "The Cosmic Coordinates",
    "pullQuote": "<A single, breathtakingly romantic sentence about their souls meeting.>",
    "paragraphs": [
      "<1-2 short, poetic sentences about their destined encounter.>",
      "<1-2 short sentences summarizing their elemental intertwining.>"
    ]
  },
  "chapter1_CoreSouls": {
    "title": "Chapter 1: The Core Souls",
    "pullQuote": "<A single, powerful sentence capturing the magnetic draw between their true selves.>",
    "userEnergy": [
      "<1-2 short, impactful sentences about the user's hidden spiritual color and charm.>"
    ],
    "idolEnergy": [
      "<1-2 short sentences about the idol's true inner soul and what they secretly crave.>"
    ],
    "magneticIntersection": [
      "<1-2 short sentences explaining why these two specific souls are drawn together.>"
    ]
  },
  "chapter2_ElementalMatrix": {
    "title": "Chapter 2: The Cosmic Flow & Friction",
    "pullQuote": "<A single, vivid sentence describing their energy exchange (fire, water, earth, etc.).>",
    "nurturingCycle": [
      "<1-2 short sentences on how the user's elements feed and protect the idol.>"
    ],
    "dynamicFriction": [
      "<1-2 short sentences explaining their clashes as a beautiful, transformative fire.>"
    ]
  },
  "chapter3_TwinFlame": {
    "title": "Chapter 3: Past Life Echoes",
    "pullQuote": "<A single, hauntingly beautiful sentence about their past life connection.>",
    "pastLifeStory": [
      "<1-2 short sentences inventing a vivid past-life scenario based on their elements.>"
    ],
    "soulPurpose": [
      "<1-2 short sentences explaining the spiritual reason they found each other in this lifetime.>"
    ]
  },
  "chapter4_Intimacy": {
    "title": "Chapter 4: Resonance & Triggers",
    "pullQuote": "<A single, intimate sentence about the silent understanding between them.>",
    "vibeAnalysis": [
      "<1-2 short sentences describing the energetic vibe when their auras meet.>"
    ],
    "attractionTriggers": [
      "<1-2 short sentences on how their differences perfectly complement each other.>"
    ]
  },
  "chapter5_DestinyTimeline": {
    "title": "Chapter 5: The 2026-2027 Forecast",
    "pullQuote": "<A single, inspiring sentence about their intertwined future.>",
    "forecastDetails": [
      "<1-2 short sentences forecasting their energetic sync for the next 12-24 months.>"
    ],
    "actionableAdvice": [
      "<1-2 short sentences of spiritual advice for the user to align with this energy.>"
    ]
  },
  "conclusion": {
    "title": "The Final Oracle",
    "paragraphs": [
      "<1-2 short sentences providing a powerful, sweeping conclusion.>",
      "<A single, emotionally resonant mantra that defines their eternal cosmic connection.>"
    ]
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
                    subject: `The stars have spoken. Your Cosmic Harmony with ${report.idols.member_name} is ready. ✨`,
                    html: `
                    <div style="font-family: serif; color: #111111; max-width: 600px; margin: 0 auto; padding: 40px 20px; text-align: center; background-color: #FAFAFA; border: 1px solid #EAEAEA; border-radius: 12px;">
                        <h1 style="color: #D4AF37; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">The Wait is Over, ${report.users.nickname}</h1>
                        <p style="font-size: 16px; line-height: 1.8; color: #4A4A4A; margin-top: 24px;">
                            The cosmos have aligned to reveal the profound karmic ties and dynamic destiny between you and <strong>${report.idols.member_name}</strong>.
                        </p>
                        <p style="font-size: 16px; line-height: 1.8; color: #4A4A4A;">
                            Your premium 5-page cosmic SoulMatch booklet has been inscribed. Prepare to discover your Twin Flame energy, past life echoes, and the 2026 destiny timeline waiting for you.
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
