// MUST BE FIRST: Patch Redis version check for Windows compatibility
import './config/redis-patch';
// Force restart for env update

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { config, isProduction } from './config/env';
import { logger } from './logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, setupGracefulShutdown } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import paymentRoutes from './routes/paymentRoutes';
import locationRoutes from './routes/locationRoutes';
import userRoutes from './routes/userRoutes';
import driverRoutes from './routes/driverRoutes';
import tripOfferRoutes from './routes/tripOfferRoutes';
import messageRoutes from './routes/messageRoutes';
import pricingRoutes from './routes/pricingRoutes';
import sosRoutes from './routes/sosRoutes';
import walletRoutes from './routes/walletRoutes';
import supportRoutes from './routes/supportRoutes';
import supportAdminRoutes from './routes/supportAdminRoutes';
import dashboardAuthRoutes from './routes/dashboardAuthRoutes';
import popupRoutes from './routes/popupRoutes';
import surgeRoutes from './routes/surgeRoutes';
import driverPreferenceRoutes from './routes/driverPreferenceRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import intercityRoutes from './routes/intercityRoutes';
import bannerRoutes from './routes/bannerRoutes';
import notificationRoutes from './routes/notificationRoutes';
import referralRoutes from './routes/referralRoutes';
import configRoutes from './routes/configRoutes';
import { checkDatabaseConnection } from './config/database';
import { checkRedisConnection } from './config/redis';
import { startLocationSync } from './workers/locationSyncWorker';
import { startRealtimeServer } from './realtime/realtimeServer';

const app = express();
const PORT = config.PORT;

// ===== Security Middleware =====

// Helmet - Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS - Configure based on environment
const corsOptions = {
  origin: config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(','),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Disable X-Powered-By header
app.disable('x-powered-by');

// ===== Structured Request Logging =====
app.use(requestLogger);

// ===== Routes =====

app.use('/api/auth', authRoutes);
app.use('/api/dashboard/auth', dashboardAuthRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trip-offers', tripOfferRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/support', supportAdminRoutes);
app.use('/api/popups', popupRoutes);
app.use('/api/surge', surgeRoutes);
app.use('/api/drivers/preferences', driverPreferenceRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/intercity', intercityRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/config', configRoutes);

// ===== Health Check =====
app.get('/health', async (req, res) => {
  const dbHealthy = await checkDatabaseConnection();
  const redisHealthy = await checkRedisConnection();

  const status = dbHealthy && redisHealthy ? 'ok' : 'degraded';
  const statusCode = status === 'ok' ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
    services: {
      database: dbHealthy ? 'healthy' : 'unhealthy',
      redis: redisHealthy ? 'healthy' : 'unhealthy',
    },
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'SmartLine Backend API',
    version: '1.0.0',
    environment: config.NODE_ENV,
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  logger.warn({
    msg: `Route not found: ${req.method} ${req.originalUrl}`,
    event: 'route_not_found',
    req: { method: req.method, url: req.originalUrl },
  });
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// ===== Global Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
const server = http.createServer(app);
startRealtimeServer(server);

// Register graceful shutdown handlers
setupGracefulShutdown(server);

server.listen(PORT, async () => {
  logger.info({
    msg: `SmartLine Backend Server Started on port ${PORT}`,
    event: 'server_started',
    port: PORT,
    environment: config.NODE_ENV,
    logLevel: config.LOG_LEVEL,
    slowRequestMs: config.SLOW_REQUEST_MS,
  });

  // Initialize background workers
  // Temporarily disabled due to Redis version incompatibility
  // TODO: Upgrade Redis to 5.0+ to enable background workers
  // try {
  //   await startLocationSync();
  //   logger.info({ msg: 'Background workers initialized', event: 'workers_started' });
  // } catch (error) {
  //   logger.error({ msg: 'Failed to initialize background workers', event: 'workers_start_failed', error });
  // }
});
