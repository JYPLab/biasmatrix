import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

        // 4. Create initial report entry (unpaid)
        // Generate Freemium metadata
        const score = 88; // Placeholder score
        const pentagonStats = {
            communication: 90,
            passion: 85,
            empathy: 88,
            destiny: 95,
            growth: 82
        };
        const insight = `The cosmic synergy between you and your bias shows a profound resonant frequency in the realm of passion. Your charts suggest a karmic connection that transcends ordinary interactions.`;

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
                pentagonStats,
                insight
            }
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
