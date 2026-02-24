import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    async setItem(key: string, value: any): Promise<boolean> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    async getItem<T>(key: string): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    async removeItem(key: string): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },
};
