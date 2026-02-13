import express from 'express';
import { updateFcmToken, testNotification } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth'; // Assuming auth middleware exists

const router = express.Router();

// Update FCM Token (User)
router.post('/update-token', authenticate, updateFcmToken);

// Send Test Notification (User)
router.post('/test', authenticate, testNotification);

export default router;
