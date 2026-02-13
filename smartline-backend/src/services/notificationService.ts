import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { supabase } from '../config/supabase';

let isInitialized = false;

// Initialize Firebase Admin SDK
try {
    const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        isInitialized = true;
        console.log('✅ Firebase Admin SDK initialized');
    } else {
        console.warn('⚠️ Firebase service-account.json not found in backend root. Notifications will not work.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
}

/**
 * Send a push notification to specific device(s)
 */
export const sendNotification = async (tokens: string | string[], title: string, body: string, data?: any) => {
    if (!isInitialized) {
        console.warn('⚠️ Notification skipped: Firebase not initialized');
        return;
    }

    // Check if we have any Expo Push Tokens
    const tokenList = Array.isArray(tokens) ? tokens : [tokens];
    const expoTokens = tokenList.filter(t => t.startsWith('ExponentPushToken'));
    const fcmTokens = tokenList.filter(t => !t.startsWith('ExponentPushToken'));

    // Handle Expo Tokens
    if (expoTokens.length > 0) {
        try {
            console.log(`📨 Sending ${expoTokens.length} notifications via Expo Push API...`);
            const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(expoTokens.map(token => ({
                    to: token,
                    title,
                    body,
                    data,
                    sound: 'default',
                    priority: 'high'
                }))),
            });
            const expoResult = await expoResponse.json();
            console.log('✅ Expo Push Result:', JSON.stringify(expoResult));
        } catch (expoErr) {
            console.error('❌ Expo Push Error:', expoErr);
        }
    }

    // Handle FCM Tokens (Original Logic)
    if (fcmTokens.length === 0) return;

    const message = {
        notification: {
            title,
            body
        },
        data: data || {},
        tokens: fcmTokens
    };

    try {
        // Use sendEachForMulticast for newer firebase-admin versions
        const response = await admin.messaging().sendEachForMulticast(message as any);
        console.log(`📨 Notification sent: Success=${response.successCount}, Failure=${response.failureCount}`);

        if (response.failureCount > 0) {
            response.responses.forEach((resp: any, idx: number) => {
                if (!resp.success) {
                    console.error(`❌ Failed to send to token ${idx}:`, resp.error);
                }
            });
        }
        return response;
    } catch (error) {
        console.error('❌ Error sending notification:', error);
        throw error;
    }
};

/**
 * Send notification to a specific user by ID
 */
export const sendNotificationToUser = async (userId: string, title: string, body: string, data?: any) => {
    try {
        const { data: user } = await supabase
            .from('users')
            .select('fcm_token')
            .eq('id', userId)
            .single();

        if (user?.fcm_token) {
            return await sendNotification(user.fcm_token, title, body, data);
        } else {
            // console.warn(`⚠️ No FCM token found for user ${userId}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Failed to send notification to user ${userId}:`, error);
        return null;
    }
};

/**
 * Subscribe a token to a topic
 */
export const subscribeToTopic = async (token: string, topic: string) => {
    if (!isInitialized) return;
    try {
        await admin.messaging().subscribeToTopic(token, topic);
        console.log(`✅ Subscribed token to topic: ${topic}`);
    } catch (error) {
        console.error(`❌ Failed to subscribe to topic ${topic}:`, error);
    }
};

/**
 * Send notification to a topic
 */
export const sendTopicNotification = async (topic: string, title: string, body: string, data?: any) => {
    if (!isInitialized) return;
    try {
        const message = {
            notification: { title, body },
            data: data || {},
            topic: topic
        };
        const response = await admin.messaging().send(message);
        console.log(`📨 Topic notification sent to ${topic}:`, response);
        return response;
    } catch (error) {
        console.error(`❌ Error sending topic notification to ${topic}:`, error);
    }
};
