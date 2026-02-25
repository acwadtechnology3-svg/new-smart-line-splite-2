import { config } from '../config/env';

const BASE_URL = config.BEON_OTP_BASE_URL;
const TOKEN = config.BEON_OTP_TOKEN;
const LANG = config.BEON_OTP_LANG;
const LENGTH = config.BEON_OTP_LENGTH;

export async function sendOtp(phone: string): Promise<{ success: boolean; message?: string }> {
  const url = `${BASE_URL}/otp/send`;
  const payload = { phone, lang: LANG, length: LENGTH };
  console.log('[BEON OTP] sendOtp request:', { url, phone, lang: LANG, length: LENGTH });

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (fetchErr: any) {
    console.error('[BEON OTP] fetch error (network/DNS):', fetchErr.message);
    throw new Error(`BEON API unreachable: ${fetchErr.message}`);
  }

  const text = await res.text();
  console.log('[BEON OTP] sendOtp response:', { status: res.status, body: text });

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error('[BEON OTP] Non-JSON response:', text);
    throw new Error(`BEON API returned non-JSON (status ${res.status})`);
  }

  if (!res.ok) {
    console.error('[BEON OTP] sendOtp failed:', { status: res.status, data });
    throw new Error(data.message || `BEON API error (status ${res.status})`);
  }

  return { success: true, message: data.message };
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/otp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ phone, code }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('[BEON OTP] verifyOtp failed:', data);
    return false;
  }

  return !!data.success;
}
