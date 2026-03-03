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
            const prompt = `# Role
You are an elite mystical astrologer and a poetic storyteller specializing in "Twin Flame" and "Karmic Destiny" readings. Your primary audience is 20-something female professionals in the US who are avid K-Pop fans. They appreciate premium, emotionally resonant, and highly sophisticated aesthetics.

# Objective
Analyze the elemental compatibility (Korean Saju) between the User and their Bias (Idol), and generate a highly engaging, emotional "teaser hook." This teaser sits behind a paywall and its sole purpose is to intrigue the user so deeply that they purchase the full 15-page report.

# Strict Guidelines
1. **NO Academic Jargon:** Never use clinical terms like "mutual clash," "generating cycle," or "Yin/Yang imbalance." Translate these into cosmic metaphors (e.g., "stardust," "frequencies," "sanctuary," "wildfire").
2. **Positive Reframing (Crucial):** If their elements clash (e.g., Water putting out Fire), NEVER frame it as a bad match. Reframe it as a "Karmic Spark," a "Dynamic friction that breaks boundaries," or "A profound tension meant for spiritual evolution."
3. **The Hook Vibe:** The \`teaserText\` must read like the breathtaking opening lines of a cosmic romance novel. It must be intensely romantic, mysterious, and deeply personal (e.g., "Your spirits whisper across galaxies, a cosmic melody woven from stardust...").
4. **JSON Output ONLY:** You must return the output strictly as a valid JSON object. Do not wrap it in markdown code blocks (like \`\`\`json).

# Expected JSON Output Schema
{
  "score": <Integer between 82 and 99. Even challenging charts should score reasonably high to maintain the fantasy, representing the 'depth' of the karma>,
  "keyword": "<A 2-3 word UPPERCASE phrase defining their cosmic bond. e.g., 'DESTINED ECHO', 'KARMIC SPARK', 'CELESTIAL ANCHOR'>",
  "teaserText": "<A 2-3 sentence poetic, emotional hook explaining how their specific elements interact. Max 300 characters.>",
  "elementsData": [
    { "element": "Fire", "value": <Integer 70-99>, "icon": "local_fire_department" },
    { "element": "Earth", "value": <Integer 70-99>, "icon": "diamond" },
    { "element": "Metal", "value": <Integer 70-99>, "icon": "token" },
    { "element": "Water", "value": <Integer 70-99>, "icon": "water_drop" },
    { "element": "Wood", "value": <Integer 70-99>, "icon": "auto_awesome" }
  ]
}

# Input Data for Analysis
- User Name: ${nickname}
- User Birth Details: ${birth_date} ${birth_time ? `at ${birth_time}` : '(Time Unknown)'}
- Idol Name: ${idolNameStr}
`;

            const result = await model.generateContent(prompt);
            const rawResponse = result.response.text();
            const payload = JSON.parse(rawResponse);

            if (payload.score) score = payload.score;
            if (payload.elementsData) pentagonStats = payload.elementsData; // Mapping legacy var name to new schema for safety
            if (payload.teaserText) insight = payload.teaserText; // Mapping legacy var
            if (payload.keyword) connectionType = payload.keyword; // Mapping legacy var
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
                keyword: connectionType,
                elementsData: pentagonStats,
                teaserText: insight
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
