import { Router } from 'express';
import {
  initializeDeposit,
  paymentCallback,
  paymentWebhook,
  requestWithdrawal,
  manageWithdrawal,
  verifyPayment
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { requireDriver, requireAdmin } from '../middleware/rbac';
import { validateBody } from '../middleware/validate';
import { depositInitSchema, withdrawRequestSchema, withdrawManageSchema } from '../validators/schemas';

const router = Router();

// ===== Deposit Endpoints =====

// Initialize deposit - creates Kashier payment session
router.post(
  '/deposit/init',
  authenticate,
  validateBody(depositInitSchema),
  initializeDeposit
);

// ===== Kashier Callbacks =====

// Browser redirect callback (GET) - user is redirected here after payment
router.get('/callback', paymentCallback);

// Server webhook (POST) - Kashier server-to-server notification
router.post('/webhook', paymentWebhook);

// Verify payment status with Kashier (app polls this after payment)
router.get(
  '/verify/:orderId',
  authenticate,
  verifyPayment
);

// ===== Withdrawal Endpoints =====

// Request withdrawal - instant processing, any authenticated user
router.post(
  '/withdraw/request',
  authenticate,
  validateBody(withdrawRequestSchema),
  requestWithdrawal
);

// Manage withdrawals - admin only (approve/reject + Kashier refund)
router.post(
  '/withdraw/manage',
  authenticate,
  requireAdmin,
  validateBody(withdrawManageSchema),
  manageWithdrawal
);

export default router;
