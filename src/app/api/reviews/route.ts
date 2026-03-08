import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { report_id, rating, comment } = body;

        if (!report_id || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase.from('reviews').insert({
            report_id,
            rating,
            comment
        }).select().single();

        if (error) {
            console.error('Supabase insert error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, review: data }, { status: 201 });
    } catch (err: any) {
        console.error('Review submission error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
