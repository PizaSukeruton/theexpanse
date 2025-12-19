-- Add version tracking to audit table
-- Migration: add_version_columns_to_audit
-- Date: 2024-12-19

ALTER TABLE user_onboarding_audit
ADD COLUMN from_version INTEGER,
ADD COLUMN to_version INTEGER;

-- Create index for version queries
CREATE INDEX idx_onboarding_audit_versions ON user_onboarding_audit(from_version, to_version);

-- Verify columns added
\d user_onboarding_audit
