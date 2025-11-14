# Login UI Test Checklist
**URL: http://localhost:3000/dossier-login-clean.html
**Date**: [Fill in when testing]
**Tester**: [Your name]

---

## TEST 1: Initial Load State

- [ ] Left panel shows "COUNCIL OF THE WISE" dossier cover
- [ ] Right panel shows ONLY two buttons: LOGIN and SIGN UP
- [ ] No chat log visible
- [ ] No input bar visible
- [ ] No tabs visible at top of right panel
- [ ] Buttons are centered vertically and horizontally
- [ ] Green terminal aesthetic present (#00ff75)

**PASS/FAIL**: ___________

---

## TEST 2: Click LOGIN Button
**Action**: Click the LOGIN button

- [ ] Button has visual highlight/active state
- [ ] LOGIN button stays visible (compact row at top)
- [ ] SIGN UP button stays visible (compact row at top)
- [ ] Chat log appears with message: "SYSTEM: Terminal ready. Please authenticate."
- [ ] Input bar appears with placeholder: "> Enter username"
- [ ] Password toggle button NOT visible
- [ ] Input bar does NOT extend beyond panel bottom border
- [ ] Can see all elements without scrolling

**PASS/FAIL**: ___________

---

## TEST 3: Login Flow - Username Entry
**Action**: Type "testuser" and press Enter

- [ ] Username appears in chat log: "> testuser"
- [ ] Input changes to password type (dots/asterisks)
- [ ] Placeholder changes to: "> Enter password"
- [ ] Password toggle button appears (shows "Show")
- [ ] Input bar still within panel boundaries

**PASS/FAIL**: ___________

---

## TEST 4: Login Flow - Password Toggle
**Action**: Click the "Show" button

- [ ] Button text changes to "Hide"
- [ ] Input type changes to text (password visible)

**Action**: Click "Hide" button

- [ ] Button text changes back to "Show"
- [ ] Input type changes back to password (dots/asterisks)

**PASS/FAIL**: ___________

---

## TEST 5: Login Flow - Wrong Password
**Action**: Type "wrongpass" and press Enter

- [ ] Error message appears: "SYSTEM: [error message]"
- [ ] Input resets to username entry
- [ ] Placeholder shows: "> Enter username"
- [ ] Password toggle button disappears
- [ ] Input type is text (not password)

**PASS/FAIL**: ___________

---

## TEST 6: Switch to SIGN UP During Login
**Action**: While in username entry state, click SIGN UP button

- [ ] SIGN UP button shows active/highlighted state
- [ ] LOGIN button no longer highlighted
- [ ] Chat log clears or switches to signup log
- [ ] System message appears: "SYSTEM: Create your account to request access."
- [ ] Placeholder changes to: "> Enter email"
- [ ] Password toggle button NOT visible

**PASS/FAIL**: ___________

---

## TEST 7: Signup Flow - Email Entry
**Action**: Type "test@example.com" and press Enter

- [ ] Email appears in chat log: "> test@example.com"
- [ ] Placeholder changes to: "> Enter desired username"
- [ ] Input remains text type
- [ ] Password toggle NOT visible

**PASS/FAIL**: ___________

---

## TEST 8: Signup Flow - Username Entry
**Action**: Type "newuser" and press Enter

- [ ] Username appears in chat log: "> newuser"
- [ ] Input changes to password type
- [ ] Placeholder changes to: "> Enter password"
- [ ] Password toggle button appears (shows "Show")

**PASS/FAIL**: ___________

---

## TEST 9: Signup Flow - Password Entry
**Action**: Type "password123" and press Enter

- [ ] Password appears as asterisks: "> ********"
- [ ] Placeholder changes to: "> Confirm password"
- [ ] Input remains password type
- [ ] Password toggle still visible

**PASS/FAIL**: ___________

---

## TEST 10: Signup Flow - Password Mismatch
**Action**: Type "differentpass" and press Enter

- [ ] Error message: "SYSTEM: Passwords do not match. Please try again."
- [ ] Input resets to password entry
- [ ] Placeholder shows: "> Enter password"
- [ ] Password toggle visible and shows "Show"
- [ ] Can try again

**PASS/FAIL**: ___________

---

## TEST 11: Signup Flow - Matching Passwords
**Action**: Type "password123" and press Enter, then "password123" again

- [ ] Both entries show as: "> ********"
- [ ] Registration request sent to server
- [ ] Success message appears (or error if validation fails)
- [ ] Password toggle disappears on success

**PASS/FAIL**: ___________

---

## TEST 12: Tab Content Isolation
**Action**: Switch between LOGIN and SIGN UP multiple times

- [ ] Only ONE chat log visible at any time
- [ ] Switching tabs shows correct log for that mode
- [ ] No overlap or both logs showing simultaneously
- [ ] State variables reset (can't see old data from other mode)

**PASS/FAIL**: ___________

---

## TEST 13: Responsive Layout Check
**Action**: Resize browser window smaller

- [ ] At < 1000px width, layout switches to single column
- [ ] Both panels still visible
- [ ] No horizontal scrolling required
- [ ] Input bar still within boundaries

**PASS/FAIL**: ___________

---

## TEST 14: Visual Consistency
**Overall aesthetic check**

- [ ] All text is #00ff75 green on black background
- [ ] CRT scanline effect visible
- [ ] Borders and shadows consistent
- [ ] Monospace font throughout
- [ ] Button hover states work
- [ ] No layout shift or flicker during transitions

**PASS/FAIL**: ___________

---

## TEST 15: Edge Cases

### Test 15a: Rapid Tab Switching
**Action**: Click LOGIN → SIGN UP → LOGIN → SIGN UP rapidly

- [ ] No JavaScript errors in console
- [ ] UI remains stable
- [ ] Correct chat log shows each time
- [ ] No stuck states

**PASS/FAIL**: ___________

### Test 15b: Empty Input Submission
**Action**: Press Enter with empty input field

- [ ] Nothing breaks
- [ ] No error messages
- [ ] Input remains focused and ready

**PASS/FAIL**: ___________

### Test 15c: Very Long Input
**Action**: Type 500+ character string

- [ ] Input accepts it
- [ ] Display doesn't break layout
- [ ] Text wraps properly in chat log

**PASS/FAIL**: ___________

---

## OVERALL RESULTS

**Total Tests**: 15 main tests + 3 edge cases = 18 tests
**Passed**: _____ / 18
**Failed**: _____ / 18

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Notes:


---

## Sign-off

**Tested by**: _______________
**Date**: _______________
**Browser**: _______________
**Status**: APPROVED / NEEDS FIXES
