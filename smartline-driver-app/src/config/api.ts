import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost?.split(':')[0];

// Prioritize dynamic detection from hostUri (where the bundler is)
// This works best when moving across different Wi-Fi networks
export const API_URL = process.env.EXPO_PUBLIC_API_URL || (localhost
    ? `http://${localhost}:3000/api`
    : 'http://10.0.2.2:3000/api');

// Helper to get base URL without /api suffix
export const BASE_URL = API_URL.replace(/\/api$/, '');

console.log('[API Config] Debugger Host:', debuggerHost);
console.log('[API Config] Detected Localhost:', localhost);
console.log('[API Config] Final API URL:', API_URL);

