-- Convert audit_id from SERIAL to hex ID format
-- Migration: convert_audit_id_to_hex
-- Date: 2024-12-19

-- Drop the old SERIAL column and recreate as VARCHAR with hex format
ALTER TABLE user_onboarding_audit
DROP CONSTRAINT user_onboarding_audit_pkey;

ALTER TABLE user_onboarding_audit
DROP COLUMN audit_id;

ALTER TABLE user_onboarding_audit
ADD COLUMN audit_id VARCHAR(7) PRIMARY KEY CHECK (audit_id ~ '^#[0-9A-F]{6}$');

-- Verify the change
\d user_onboarding_audit
