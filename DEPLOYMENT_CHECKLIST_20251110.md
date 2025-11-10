# DEPLOYMENT CHECKLIST - User Signup System
Date: November 10, 2025

## ✅ PRE-DEPLOYMENT VERIFICATION COMPLETE

### Code Changes
- [x] Password capture working
- [x] Password hashing working
- [x] Email verification working
- [x] Auto-approval system working
- [x] Admin settings interface working
- [x] Email confirmation (enter twice) added
- [x] Password confirmation toggle reset working
- [x] Production URL configured (theexpanse.onrender.com)

### Files Modified for Production
1. `backend/councilTerminal/registrationSocketHandler.js` - Password handling + email verification
2. `backend/utils/registrationHandler.js` - Password hashing + auto-approval + production URL
3. `routes/admin.js` - Settings management + user approval routes
4. `public/dossier-login-clean.html` - Email confirmation + password toggle fixes
5. `public/admin.html` - Settings UI + pending users management

## 📋 DEPLOYMENT STEPS

### Step 1: Database Migration on Render
Run this SQL on your Render PostgreSQL database:
```sql
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(20)
);

INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
VALUES ('auto_approve_users', 'true', 'Automatically approve new users after email verification', '#D00001')
ON CONFLICT (setting_key) DO NOTHING;
```

### Step 2: Git Commit and Push
```bash
git add backend/councilTerminal/registrationSocketHandler.js
git add backend/utils/registrationHandler.js
git add routes/admin.js
git add public/dossier-login-clean.html
git add public/admin.html
git commit -m "feat: Complete user signup system with email verification and auto-approval"
git push origin main
```

### Step 3: Verify Render Deployment
- Wait for Render auto-deploy to complete
- Check deployment logs for errors

### Step 4: Test Production Signup Flow
1. Go to https://theexpanse.onrender.com/dossier-login-clean.html
2. Click "SIGN UP"
3. Enter email (twice)
4. Enter username
5. Enter password (twice, verify toggle works)
6. Click Send
7. Check email inbox
8. Click verification link
9. Verify user is created and auto-approved
10. Try logging in

### Step 5: Test Admin Settings
1. Login as admin (Cheese Fang)
2. Go to /admin
3. Click "Settings"
4. Verify auto-approval toggle shows current state
5. Toggle it off
6. Create test user
7. Verify user appears in "Pending User Approvals"
8. Approve the user
9. Toggle auto-approval back on

## 🔧 ENVIRONMENT VARIABLES NEEDED ON RENDER

Verify these are set in Render dashboard:
```
SMTP2GO_API_KEY=api-3C479AE44CF042F2BDE4A0A568876847
SMTP2GO_FROM_EMAIL=cheesefang@pizasukeruton.com
DATABASE_URL=[auto-configured by Render]
JWT_SECRET=[your JWT secret]
PORT=3000
```

## ⚠️ KNOWN ISSUES TO MONITOR

1. Email deliverability - check spam folders
2. Token expiration (24 hours) - users must verify within this time
3. SMTP2GO rate limits - monitor if high signup volume

## 📊 SUCCESS METRICS

After deployment, verify:
- [ ] Signup emails sending successfully
- [ ] Verification links working
- [ ] Users auto-approved when setting enabled
- [ ] Admin can manually approve when setting disabled
- [ ] Password hashes are 60 characters
- [ ] No errors in Render logs

## 🔄 ROLLBACK PLAN

If deployment fails:
1. Git revert to previous commit
2. Push to trigger Render redeploy
3. Or use Render's manual rollback feature

Previous stable commit: [record hash before deploying]

## 📝 POST-DEPLOYMENT NOTES

Document any issues encountered:
- 
- 
- 

## ✅ DEPLOYMENT COMPLETE

Date: ___________
Deployed by: ___________
Status: ___________
Notes: ___________
