import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { sendNotificationToUser } from '../services/notificationService';

export const updateFcmToken = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { fcmToken } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!fcmToken) return res.status(400).json({ error: 'Missing fcmToken' });

        const { error } = await supabase
            .from('users')
            .update({ fcm_token: fcmToken })
            .eq('id', userId);

        if (error) {
            console.error('Failed to update FCM token:', error);
            return res.status(500).json({ error: 'Database update failed' });
        }

        res.json({ success: true, message: 'FCM token updated' });
    } catch (err: any) {
        console.error('Update FCM Token Error:', err);
        res.status(500).json({ error: err.message });
    }
};

export const testNotification = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { title, body } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await sendNotificationToUser(
            userId,
            title || 'Test Notification',
            body || 'This is a test notification from SmartLine backend.'
        );

        if (result) {
            res.json({ success: true, message: 'Notification sent' });
        } else {
            res.status(400).json({ error: 'Failed to send notification (User might not have FCM token)' });
        }
    } catch (err: any) {
        console.error('Test Notification Error:', err);
        res.status(500).json({ error: err.message });
    }
};
