import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from './backend';

export interface SurgeZone {
    id: string;
    center_lat: number;
    center_lng: number;
    radius: number;
    multiplier: number;
    label: string;
}

const CONFIG_CACHE_KEY = 'honeycomb_config_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export const honeycombService = {
    fetchActiveZones: async (): Promise<SurgeZone[]> => {
        try {
            console.debug('[Honeycomb] Fetching active zones...');
            const response = await apiRequest<{ zones: SurgeZone[] }>('/surge/active', { auth: false });
            console.debug(`[Honeycomb] Fetched ${response.zones?.length} zones`);
            return response.zones || [];
        } catch (error) {
            console.warn('[Honeycomb] Failed to fetch active zones', error);
            throw error;
        }
    },

    fetchFeatureConfig: async (): Promise<{ honeycomb_enabled: boolean }> => {
        try {
            // Try network first
            const response = await apiRequest<{ honeycomb_enabled: boolean }>('/config/features', { auth: false });

            // Cache successful response
            await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: response
            }));

            return response;
        } catch (error) {
            console.warn('[Honeycomb] Failed to fetch config, trying cache...', error);

            // Try cache fallback
            try {
                const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    const age = Date.now() - parsed.timestamp;
                    if (age < CACHE_TTL) {
                        console.log('[Honeycomb] Using cached config (age: ' + (age / 1000).toFixed(0) + 's)');
                        return parsed.data;
                    }
                }
            } catch (cacheError) {
                console.warn('[Honeycomb] Cache read failed', cacheError);
            }

            // Fallback default
            return { honeycomb_enabled: false };
        }
    }
};
