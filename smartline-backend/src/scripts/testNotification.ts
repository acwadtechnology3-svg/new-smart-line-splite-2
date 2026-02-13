console.log('🚀 Starting Test Notification Script...');
import { supabase } from '../config/supabase';
import { sendNotification, sendNotificationToUser } from '../services/notificationService';

const run = async () => {
    console.log('✅ Imports successful. Querying users...');
    // 1. List users with FCM tokens - select all just to be safe about column names
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .not('fcm_token', 'is', null);

    if (error) {
        console.error('Error fetching users:', error);
        return;
    }

    if (!users || users.length === 0) {
        console.log('⚠️ No users found with FCM tokens. Make sure you open the app to register a token.');
        return;
    }

    console.log(`found ${users.length} users with tokens:`);
    users.forEach((u: any, i: number) => {
        console.log(`${i + 1}. [${u.id}] ${u.name || u.full_name || u.phone || u.email} (Token: ${u.fcm_token.substring(0, 20)}...)`);
    });

    // 2. Send to the first user for testing (or change index)
    const targetUser = users[0];
    console.log(`\n🚀 Sending test notification to: ${targetUser.name || targetUser.full_name || targetUser.phone} (${targetUser.id})`);

    try {
        const response = await sendNotificationToUser(
            targetUser.id,
            'Test Notification 🔔',
            'This is a test message sent from the backend script!',
            { type: 'test_event' }
        );

        if (response) {
            console.log('✅ Notification sent successfully!');
        } else {
            console.log('❌ Failed to send notification.');
        }

    } catch (err) {
        console.error('Error sending notification:', err);
    }
};

run().catch(console.error);
