/**
 * Redaction module: deep-redacts sensitive fields from arbitrary objects.
 * Used by the request logger and anywhere else that needs to sanitize
 * data before logging.
 */

const SENSITIVE_KEYS = new Set([
    'password',
    'pass',
    'token',
    'refreshtoken',
    'accesstoken',
    'apikey',
    'api_key',
    'secret',
    'cardnumber',
    'card_number',
    'cvv',
    'cvc',
    'authorization',
    'cookie',
    'set-cookie',
    'x-api-key',
    'creditcard',
    'credit_card',
    'ssn',
    'social_security',
]);

const CENSOR = '[REDACTED]';

/**
 * Deep-redact sensitive fields from an object.
 * Returns a new object (does not mutate the original).
 */
export function redact(obj: any, maxDepth = 10): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    if (maxDepth <= 0) return '[MAX_DEPTH]';

    if (Array.isArray(obj)) {
        return obj.map((item) => redact(item, maxDepth - 1));
    }

    const result: Record<string, any> = {};

    for (const key of Object.keys(obj)) {
        const lowerKey = key.toLowerCase().replace(/[-_]/g, '');

        if (SENSITIVE_KEYS.has(key.toLowerCase()) || SENSITIVE_KEYS.has(lowerKey)) {
            result[key] = CENSOR;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[key] = redact(obj[key], maxDepth - 1);
        } else {
            result[key] = obj[key];
        }
    }

    return result;
}

/**
 * Returns the set of sensitive keys (lowercase) for testing.
 */
export function getSensitiveKeys(): Set<string> {
    return new Set(SENSITIVE_KEYS);
}
