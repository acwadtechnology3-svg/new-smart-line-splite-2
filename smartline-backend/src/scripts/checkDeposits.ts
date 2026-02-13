import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

async function checkDeposits() {
    // Find ALL deposits for this user
    const { data: deposits } = await supabase
        .from('wallet_transactions')
        .select('id, amount, type, status, description, created_at')
        .eq('user_id', '957b6691-a055-4238-a1cd-41eb7eb44458')
        .order('created_at', { ascending: false })
        .limit(20);

    console.log('All transactions for user:');
    deposits?.forEach((tx, i) => {
        console.log(`  ${i + 1}. [${tx.type}] ${tx.status} | ${tx.amount} | ${tx.id}`);
        console.log(`     Desc: ${tx.description}`);
        console.log(`     Date: ${tx.created_at}`);
        console.log('');
    });

    // Check user balance
    const { data: user } = await supabase
        .from('users')
        .select('balance')
        .eq('id', '957b6691-a055-4238-a1cd-41eb7eb44458')
        .single();

    console.log('Current balance:', user?.balance);

    process.exit(0);
}

checkDeposits();
