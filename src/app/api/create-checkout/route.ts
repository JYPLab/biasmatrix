import { NextResponse } from 'next/server';
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

export async function POST(request: Request) {
    try {
        lemonSqueezySetup({ apiKey: process.env.LEMON_SQUEEZY_API_KEY || '' });
        const { reportId, email } = await request.json();

        const storeId = process.env.LEMON_SQUEEZY_STORE_ID || '';
        const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID || ''; // ID for $14.99 Saju Report

        const checkout = await createCheckout(storeId, variantId, {
            checkoutOptions: {
                embed: true,
                media: false,
            },
            checkoutData: {
                email: email,
                custom: {
                    report_id: reportId
                }
            }
        });

        return NextResponse.json({ success: true, url: checkout.data?.data.attributes.url });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
