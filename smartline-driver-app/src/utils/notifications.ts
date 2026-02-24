import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiRequest } from '../services/backend';

// Customize notification handler behavior for foreground notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

export const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        // alert('Must use physical device for Push Notifications');
        console.log('Must use physical device for Push Notifications');
        return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        // alert('Failed to get push token for push notification!');
        console.log('Failed to get push token for push notification!');
        return null;
    }

    // Recommended: Use getDevicePushTokenAsync() for bare/native notification flow.
    try {
        const tokenData = await Notifications.getDevicePushTokenAsync();
        const token = tokenData.data;
        console.log('FCM Token:', token);
        return token;
    } catch (error: any) {
        console.error('Error getting push token:', error);
        return null;
    }
};

export const updateBackendToken = async (token: string) => {
    try {
        await apiRequest('/notifications/update-token', {
            method: 'POST',
            body: JSON.stringify({ fcmToken: token })
        });
        console.log('✅ FCM Token updated in backend');
        return true;
    } catch (error: any) {
        console.error('❌ Failed to update backend token:', error);
        // Alert relevant error
        const { Alert } = require('react-native');
        Alert.alert('Backend Update Failed', error.message || 'Network error');
        return false;
    }
};
