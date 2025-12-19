# Onboarding System - Testing Guide
**Ready for Live Testing**

---

## What to Test

### Test 1: Fresh User Login
**Expected Flow:**
1. User logs in for first time
2. Welcome message appears automatically
3. System transitions: `new → awaiting_ready` (atomic)
4. User says "yes" or similar
5. Omiyage offer appears
6. User accepts/declines/defers
7. User reaches `onboarded` state

**How to Test:**
- Log in with one of the 4 backfilled users (#D0000A, #D00006, #D00009, #D00001)
- All are currently in 'new' state

---

## Check Current State

Run this in psql:
```sql
SELECT user_id, current_state, state_version, entered_at 
FROM user_onboarding_state 
ORDER BY user_id;
```

Should show all 4 users in 'new' state.

---

## View Audit Trail

After testing, check what happened:
```sql
SELECT user_id, from_state, to_state, reason, transitioned_at
FROM onboarding_state_audit
WHERE user_id = '#D00006'
ORDER BY transitioned_at;
```

---

## Expected Logs

**On connection:**
```
[OnboardingOrchestrator] Configuration validated: { states: 5, schemas: 5, status: 'OK' }
[OnboardingOrchestrator] User state: { userId: '#D00006', state: 'new', version: 1 }
[OnboardingOrchestrator] Atomic transition: { userId: '#D00006', transition: 'new → awaiting_ready', version: 'v1 → v2' }
```

**When user says "yes":**
```
[Onboarding] Affirmative detected, advancing to omiyage
[OnboardingOrchestrator] Transition: { userId: '#D00006', transition: 'awaiting_ready → omiyage_offered', version: 'v2 → v3' }
```

**When user accepts gift:**
```
[Omiyage] Fulfilled #ABC123 - [object name] to #D00006
[OnboardingOrchestrator] Transition: { userId: '#D00006', transition: 'omiyage_offered → onboarded', version: 'v3 → v4' }
```

---

## Files Ready

✅ `backend/services/OnboardingOrchestrator.js`
✅ `backend/services/onboardingSchemas.js`
✅ `backend/councilTerminal/socketHandler.js`

All backed up in `code_backups/`

---

## Database Ready

✅ `user_onboarding_state` table created
✅ `onboarding_state_audit` table created
✅ 4 users backfilled in 'new' state
✅ Database backup in `database_backups/`

---

## Start Server
```bash
npm start
```

Then visit your frontend and log in.

---

## What Success Looks Like

1. **Welcome appears automatically** ✅
2. **User can say "yes" to proceed** ✅
3. **Omiyage offer appears** ✅
4. **User can accept/decline/defer** ✅
5. **No errors in console** ✅
6. **Audit trail in database** ✅

---

*Ready to test!* 🚀
