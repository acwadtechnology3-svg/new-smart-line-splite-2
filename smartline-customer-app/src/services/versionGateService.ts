import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config/api';

export type VersionGateAction = 'force_update' | 'recommend_update' | 'ok';

export interface VersionPolicyResponse {
    action: VersionGateAction;
    message?: string;
    store_url?: string;
}

interface CachedPolicy {
    timestamp: number;
    data: VersionPolicyResponse;
}

const CACHE_KEY = 'version_policy_cache_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const RECOMMENDED_NOTICE_KEY = 'version_recommend_notice';

const APP_IDENTIFIER: 'customer' = 'customer';

function getAppVersion(): string {
    return (
        Constants.expoConfig?.version ||
        Constants.manifest?.version ||
        Constants.expoConfig?.extra?.appVersion ||
        '1.0.0'
    );
}

async function readCache(): Promise<VersionPolicyResponse | null> {
    try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CachedPolicy;
        if (!parsed?.data) return null;

        if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
            return null;
        }
        return parsed.data;
    } catch (error) {
        console.warn('[VersionGate] Failed to read cache', error);
        return null;
    }
}

async function writeCache(data: VersionPolicyResponse) {
    try {
        const payload: CachedPolicy = { timestamp: Date.now(), data };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn('[VersionGate] Failed to write cache', error);
    }
}

export async function checkVersionPolicy(): Promise<VersionPolicyResponse> {
    const version = getAppVersion();
    const platform = Platform.OS === 'ios' ? 'ios' : 'android';

    const url = `${BASE_URL}/config/version-check?platform=${platform}&app=${APP_IDENTIFIER}&version=${encodeURIComponent(version)}`;

    try {
        const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) {
            throw new Error(`Version check failed with status ${response.status}`);
        }
        const data: VersionPolicyResponse = await response.json();
        await writeCache(data);
        return data;
    } catch (error) {
        console.warn('[VersionGate] Network error, falling back to cache', error);
        const cached = await readCache();
        if (cached?.action === 'force_update') {
            return cached;
        }
        return cached || { action: 'ok' };
    }
}

export interface RecommendedNotice {
    message?: string;
    storeUrl?: string;
}

export async function setRecommendedNotice(notice: RecommendedNotice) {
    try {
        await AsyncStorage.setItem(RECOMMENDED_NOTICE_KEY, JSON.stringify(notice));
    } catch (error) {
        console.warn('[VersionGate] Failed to store recommended notice', error);
    }
}

export async function getRecommendedNotice(): Promise<RecommendedNotice | null> {
    try {
        const raw = await AsyncStorage.getItem(RECOMMENDED_NOTICE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (error) {
        console.warn('[VersionGate] Failed to read recommended notice', error);
        return null;
    }
}

export async function clearRecommendedNotice() {
    try {
        await AsyncStorage.removeItem(RECOMMENDED_NOTICE_KEY);
    } catch (error) {
        console.warn('[VersionGate] Failed to clear recommended notice', error);
    }
}
