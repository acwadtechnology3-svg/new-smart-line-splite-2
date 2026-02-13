-- Run this in Supabase SQL Editor
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token);
