import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

const SECRET_KEY = process.env.KASHIER_SECRET_KEY!;
const API_BASE = 'https://api.kashier.io';
const REFUND_BASE = 'https://fep.kashier.io';

async function verifyAndRefund() {
    // Step 1: Check the Kashier session for the 10 EGP deposit
    const sessionId = '698e400c3bf5de00124d3bb5';
    const orderId = 'be99696f-70b3-4203-9709-4b2c71deec43';

    console.log('=== Step 1: Checking Kashier Session ===');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Our Order ID: ${orderId}`);

    try {
        const sessionResponse = await fetch(
            `${API_BASE}/v3/payment/sessions/${sessionId}/payment`,
            {
                method: 'GET',
                headers: { 'Authorization': SECRET_KEY }
            }
        );

        const sessionData = await sessionResponse.json();
        console.log('\nKashier Session Response:');
        console.log(JSON.stringify(sessionData, null, 2));

        // Step 2: If paid, find the Kashier order ID
        const paymentData = (sessionData as any)?.data || sessionData;
        const kashierOrderId = (paymentData as any)?.orderId || (paymentData as any)?.cardOrderId || (paymentData as any)?.response?.cardOrderId;

        console.log('\n=== Step 2: Extracted Kashier Order ID ===');
        console.log(`Kashier Order ID: ${kashierOrderId}`);
        console.log(`Status: ${(paymentData as any)?.status}`);

        if (kashierOrderId) {
            // Step 3: Try the refund with the REAL Kashier order ID
            console.log('\n=== Step 3: Attempting Refund ===');
            const refundUrl = `${REFUND_BASE}/orders/${kashierOrderId}/`;
            console.log(`Refund URL: ${refundUrl}`);

            const refundResponse = await fetch(refundUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': SECRET_KEY,
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiOperation: 'REFUND',
                    reason: 'Withdrawal test',
                    transaction: { amount: 5 }
                })
            });

            const refundData = await refundResponse.json();
            console.log('\nRefund Response:');
            console.log(JSON.stringify(refundData, null, 2));
        } else {
            console.log('\nNo Kashier order ID found - payment may not be completed');
        }

    } catch (err) {
        console.error('Error:', err);
    }

    process.exit(0);
}

verifyAndRefund();
