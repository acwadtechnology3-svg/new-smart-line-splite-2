import { Request, Response } from 'express';
import { config } from '../config/env';
import { sendOtp, verifyOtp } from '../services/beonOtpService';
import { redis } from '../config/redis';

const OTP_VERIFIED_TTL = 15 * 60; // 15 minutes

function redisKey(phone: string) {
  return `otp:verified:${phone}`;
}

export const requestOtp = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!config.BEON_OTP_ENABLED) {
    return res.status(400).json({ error: 'OTP service is disabled' });
  }

  try {
    await sendOtp(phone);
    res.json({ success: true });
  } catch (error: any) {
    console.error('[OTP] Send error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
};

export const confirmOtp = async (req: Request, res: Response) => {
  const { phone, code } = req.body;

  if (!config.BEON_OTP_ENABLED) {
    return res.status(400).json({ error: 'OTP service is disabled' });
  }

  try {
    const valid = await verifyOtp(phone, code);

    if (!valid) {
      return res.status(400).json({ error: 'INVALID_CODE' });
    }

    // Mark phone as verified in Redis with 15-min TTL
    await redis.setex(redisKey(phone), OTP_VERIFIED_TTL, '1');

    res.json({ success: true });
  } catch (error: any) {
    console.error('[OTP] Verify error:', error.message);
    res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
};

export async function assertOtpVerified(phone: string): Promise<boolean> {
  if (!config.BEON_OTP_ENABLED) {
    return true; // OTP disabled, allow signup
  }

  const val = await redis.get(redisKey(phone));
  return val === '1';
}
