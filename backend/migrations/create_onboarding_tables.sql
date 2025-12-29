-- Create FSM Onboarding Tables
-- Migration: create_onboarding_tables
-- Date: 2024-12-19

-- Main state table
CREATE TABLE IF NOT EXISTS user_onboarding_state (
  user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  current_state TEXT NOT NULL CHECK (current_state IN (
    'new',
    'welcomed',
    'awaiting_ready',
    'omiyage_offered',
    'onboarded'
  )),
  state_data JSONB DEFAULT '{}'::jsonb,
  state_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit trail table
CREATE TABLE IF NOT EXISTS user_onboarding_audit (
  audit_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  state_data JSONB DEFAULT '{}'::jsonb,
  reason TEXT,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_onboarding_state_user ON user_onboarding_state(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_state_current ON user_onboarding_state(current_state);
CREATE INDEX IF NOT EXISTS idx_onboarding_audit_user ON user_onboarding_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_audit_time ON user_onboarding_audit(transitioned_at DESC);

-- Verify tables created
\dt user_onboarding*
