
import pino from 'pino';
import { config, isDevelopment } from '../config/env';
import { requestContext } from '../utils/requestContext';

const redactPaths = [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["set-cookie"]',
    'req.body.password',
    'req.body.pass',
    'req.body.token',
    'req.body.refreshToken',
    'req.body.accessToken',
    'req.body.apiKey',
    'req.body.secret',
    'req.body.cardNumber',
    'req.body.cvv',
    'req.body.email',
    'req.body.phone',
    'password',
    'token',
    'secret',
    'authorization',
    'cookie',
    '["set-cookie"]'
];

const transport = isDevelopment && config.LOG_FORMAT === 'pretty'
    ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,service,version,requestId', // cleaner local logs
            messageFormat: '{requestId} {msg}',
        },
    }
    : undefined;

export const logger = pino({
    level: config.LOG_LEVEL || 'info',
    base: {
        service: config.SERVICE_NAME,
        env: config.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
        paths: redactPaths,
        censor: '[REDACTED]',
        remove: false, // Keep the key but censor the value
    },
    mixin: () => {
        // Automatically inject context into every log
        const context = requestContext.get();
        if (!context) return {};

        return {
            requestId: context.requestId,
            userId: context.userId,
            path: context.path,
            method: context.method,
        };
    },
    transport,
});

// Create child logger helper
export const createLogger = (moduleName: string) => logger.child({ module: moduleName });

// Export default for convenient import
export default logger;
