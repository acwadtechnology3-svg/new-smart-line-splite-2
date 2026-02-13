import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
);

async function fixLastDeposit() {
    // Find pending deposits
    const { data: pendingTxs, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching transactions:', error);
        process.exit(1);
    }

    console.log(`Found ${pendingTxs?.length || 0} pending deposits:`);
    pendingTxs?.forEach(tx => {
        console.log(`  ID: ${tx.id}, Amount: ${tx.amount}, User: ${tx.user_id}, Created: ${tx.created_at}`);
    });

    // Find the 10 EGP one (or the latest)
    const target = pendingTxs?.find(tx => tx.amount === 10) || pendingTxs?.[0];

    if (!target) {
        console.log('No pending deposit found to fix.');
        process.exit(0);
    }

    console.log(`\nFixing deposit: ID=${target.id}, Amount=${target.amount}`);

    // Update user balance
    const { data: user } = await supabase
        .from('users')
        .select('balance')
        .eq('id', target.user_id)
        .single();

    const newBalance = (user?.balance || 0) + target.amount;
    console.log(`  User ${target.user_id}: balance ${user?.balance || 0} -> ${newBalance}`);

    await supabase.from('users').update({ balance: newBalance }).eq('id', target.user_id);

    // Mark transaction as completed
    await supabase.from('wallet_transactions').update({
        status: 'completed',
        description: 'Deposit via Kashier (manually verified)'
    }).eq('id', target.id);

    console.log('✅ Deposit fixed successfully!');
    process.exit(0);
}

fixLastDeposit();
