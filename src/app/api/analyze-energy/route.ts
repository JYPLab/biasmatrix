import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'placeholder_gemini_key');

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { email, nickname, birth_date, birth_city, longitude, is_time_known, birth_time, idol_id } = data;

        // 1. Calculate True Solar Time Offset (Longitude - 135) * 4 minutes
        let adjustedTime = birth_time;
        if (is_time_known && longitude && birth_time) {
            const offsetMinutes = (longitude - 135) * 4;
            // Actual parsing of birth_time and adding offsetMinutes would go here for exact calculation
            // adjustedTime = newTime; 
        }

        // 2. Use @fullstackfamily/manseryeok 
        // const saju = new Manseryeok({ date: birth_date, time: adjustedTime });
        // const elements = saju.getFiveElements();

        // 3. Save User to DB
        const { data: user, error: userError } = await supabase.from('users').upsert({
            email, nickname, birth_date, birth_city, longitude, is_time_known, birth_time
        }, { onConflict: 'email' }).select().single();

        if (userError) throw userError;

        // Fetch chosen idol data for prompt
        const { data: idol } = await supabase.from('idols').select('group_name, member_name').eq('id', idol_id).single();
        const idolNameStr = idol ? `${idol.group_name} ${idol.member_name}` : 'your chosen idol';

        // 4. Generate Freemium metadata dynamically using Gemini 2.5 Flash Lite
        let score = 88;
        let pentagonStats = { communication: 90, passion: 85, empathy: 88, destiny: 95, growth: 82 };
        let insight = `The cosmic synergy between you and your bias shows a profound resonant frequency in the realm of passion. Your charts suggest a karmic connection that transcends ordinary interactions.`;
        let connectionType = 'KARMIC SPARK';

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite', generationConfig: { responseMimeType: "application/json" } });
            const prompt = `You are an elite, mystical astrologer and K-Pop Destiny analyst combining ancient Korean Saju with modern Western astrology. Your target audience is 20-something female professionals in the US who love K-Pop but also appreciate deep, emotional, and elegant esoteric readings.
            Generate a fast, highly emotional, and story-driven teaser analysis for user "${nickname}" and K-Pop idol "${idolNameStr}".
            Avoid clinical elemental descriptions. Instead, craft a poetic, irresistible 'hook' that makes them feel a profound, destined connection and desperately want to read the full report.
            Return ONLY a valid JSON object with this exact structure (no markdown wrapper, just JSON):
            {
                "score": <number integer between 75 and 99>,
                "connectionType": "<1-3 words describing the bond, e.g., 'SOUL NURTURING', 'KARMIC SPARK', 'TWIN FLAME'>",
                "pentagonStats": {
                    "communication": <number integer between 70 and 99>,
                    "passion": <number integer between 70 and 99>,
                    "empathy": <number integer between 70 and 99>,
                    "destiny": <number integer between 70 and 99>,
                    "growth": <number integer between 70 and 99>
                },
                "insight": "<1-2 short, elegant, highly emotional sentences catching their attention about their karmic synergy>"
            }`;

            const result = await model.generateContent(prompt);
            const rawResponse = result.response.text();
            const payload = JSON.parse(rawResponse);

            if (payload.score) score = payload.score;
            if (payload.pentagonStats) pentagonStats = payload.pentagonStats;
            if (payload.insight) insight = payload.insight;
            if (payload.connectionType) connectionType = payload.connectionType;
        } catch (geminiError) {
            console.error("Gemini freemium generation failed. Using fallback:", geminiError);
        }

        // 5. Create initial report entry (unpaid)
        const { data: report, error: reportError } = await supabase.from('reports').insert({
            user_id: user.id,
            idol_id,
            is_paid: false,
            energy_score: score,
            full_report_json: null
        }).select().single();

        if (reportError) throw reportError;

        // 5. Return freemium teaser data format
        return NextResponse.json({
            success: true,
            reportId: report.id,
            teaser: {
                score,
                connectionType,
                pentagonStats,
                insight
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
