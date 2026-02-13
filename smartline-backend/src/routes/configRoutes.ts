import express from 'express';
import { getFeatures } from '../controllers/configController';

const router = express.Router();

// Public endpoint for feature flags (no auth needed as it controls UI visibility globally)
router.get('/features', getFeatures);

export default router;
