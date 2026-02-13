-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add referral column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- Referral Programs Table
CREATE TABLE IF NOT EXISTS referral_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('rider', 'driver')),
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    -- Reward Configuration
    rewards_config JSONB NOT NULL DEFAULT '{}',
    -- Rules Configuration
    rules_config JSONB NOT NULL DEFAULT '{}',
    
    -- Caps
    max_referrals_per_user INT DEFAULT NULL,
    total_budget DECIMAL(10,2) DEFAULT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals Tracking Table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES users(id),
    referee_id UUID NOT NULL REFERENCES users(id),
    program_id UUID REFERENCES referral_programs(id),
    
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'fraud', 'completed')),
    channel TEXT, 
    
    qualified_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- A user can only be referred once
    UNIQUE(referee_id) 
);

-- Referral Rewards Ledger
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID REFERENCES referrals(id),
    user_id UUID REFERENCES users(id),
    program_id UUID REFERENCES referral_programs(id),
    
    type TEXT NOT NULL, 
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'EGP',
    status TEXT DEFAULT 'processed',
    
    transaction_reference TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
