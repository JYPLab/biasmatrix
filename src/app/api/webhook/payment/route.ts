import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

const resend = new Resend(process.env.RESEND_API_KEY || '');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-signature') || '';
        const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

        const hmac = crypto.createHmac('sha256', secret);
        const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
        const signatureBuffer = Buffer.from(signature, 'utf8');

        if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const data = JSON.parse(rawBody);

        if (data.meta.event_name === 'order_created') {
            const customData = data.meta.custom_data;
            const reportId = customData.report_id;

            // 1. Update report as paid
            await supabase.from('reports').update({ is_paid: true }).eq('id', reportId);

            // 2. Fetch User & Idol data
            const { data: report } = await supabase.from('reports').select('*, users(*), idols(*)').eq('id', reportId).single();

            if (report && report.users && report.idols) {
                // 3. Generate Gemini Report
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
                const prompt = `Generate a 15-page premium K-Pop destiny analysis blending Korean Saju and Western Twin Flame storytelling for user ${report.users.nickname} and idol ${report.idols.group_name} ${report.idols.member_name}. Use markdown format and structure it beautifully.`;

                const result = await model.generateContent(prompt);
                const generatedMarkdown = result.response.text();

                // 4. Update Report with JSON result
                await supabase.from('reports').update({
                    full_report_json: { content: generatedMarkdown }
                }).eq('id', reportId);

                // 5. Send Email via Resend
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                const magicLink = `${appUrl}/report/${reportId}`;
                await resend.emails.send({
                    from: 'SoulMatch <hello@soulmatch.com>',
                    to: report.users.email,
                    subject: 'Your Premium SoulMatch Destiny Report is Ready \u2728',
                    html: `<p>Hi ${report.users.nickname},</p><p>Your destiny report with ${report.idols.member_name} is ready!</p><p><a href="${magicLink}">Click here to view your 15-page premium report</a></p>`
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
