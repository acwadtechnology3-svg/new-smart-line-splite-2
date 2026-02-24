import express from 'express';
import { getFeatures, checkAppVersion } from '../controllers/configController';

const router = express.Router();

// Public endpoint for feature flags (no auth needed as it controls UI visibility globally)
router.get('/features', getFeatures);
router.get('/version-check', checkAppVersion);

export default router;
