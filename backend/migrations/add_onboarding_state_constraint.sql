-- Add CHECK constraint to enforce valid FSM states
-- Migration: add_onboarding_state_constraint
-- Date: 2024-12-19

ALTER TABLE user_onboarding_state
ADD CONSTRAINT valid_onboarding_state
CHECK (current_state IN (
  'new',
  'welcomed',
  'awaiting_ready',
  'omiyage_offered',
  'onboarded'
));

-- Verify constraint was added
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_onboarding_state'::regclass 
AND conname = 'valid_onboarding_state';
