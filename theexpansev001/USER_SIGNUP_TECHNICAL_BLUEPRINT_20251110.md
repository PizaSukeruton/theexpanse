# USER SIGNUP SYSTEM - TECHNICAL BLUEPRINT
**Date:** November 10, 2025  
**Status:** Production Operational  
**URL:** https://theexpanse.onrender.com

---

## SYSTEM COMPONENTS

### Database Tables

#### pending_registrations
```sql
CREATE TABLE pending_registrations (
    registration_id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255) NOT NULL UNIQUE,
    token_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX idx_pending_registrations_token ON pending_registrations(verification_token);
```

**Current Data:**
- 0 rows (empty)

#### users
```sql
user_id VARCHAR(20) PRIMARY KEY
username VARCHAR(50) NOT NULL UNIQUE
password_hash VARCHAR(255) NOT NULL
email VARCHAR(255) UNIQUE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
last_login TIMESTAMP
is_active BOOLEAN DEFAULT true
access_level INTEGER DEFAULT 1
role VARCHAR(20) DEFAULT 'user'
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
approval_status VARCHAR(20) DEFAULT 'pending'
approved_at TIMESTAMP
email_verified BOOLEAN DEFAULT false
email_verification_token VARCHAR(255)
email_verification_token_expires TIMESTAMP
password_set_at TIMESTAMP

CONSTRAINT users_approval_status_check CHECK (approval_status IN ('pending', 'approved', 'rejected'))
```

**Current Data:**
```
 user_id | username    | email                            | email_verified | approval_status | approved_at             
---------+-------------+----------------------------------+----------------+-----------------+-------------------------
 #D00001 | Cheese Fang | cheesefang@pizasukeruton.com     | f              | pending         | NULL
 #D00002 | james       | jstrakertroublemaker@live.com    | t              | approved        | 2025-11-10 10:06:25.084
```

#### system_settings
```sql
CREATE TABLE system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(20)
);
```

**Current Data:**
```
    setting_key     | setting_value | description                                                  | updated_at              | updated_by 
--------------------+---------------+--------------------------------------------------------------+-------------------------+------------
 auto_approve_users | true          | Automatically approve new users after email verification     | 2025-11-09 23:29:09     | #D00001
```

#### user_sessions
```sql
session_id VARCHAR(7) PRIMARY KEY
user_id VARCHAR(7) NOT NULL
session_token VARCHAR(255) NOT NULL UNIQUE
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
expires_at TIMESTAMP NOT NULL
is_active BOOLEAN DEFAULT true

CONSTRAINT user_sessions_session_id_check CHECK (session_id ~ '^#[0-9A-F]{6}$')
FOREIGN KEY (user_id) REFERENCES users(user_id)
```

---

## BACKEND FILES

### ./backend/councilTerminal/registrationSocketHandler.js
**Purpose:** Handle registration WebSocket events

**Socket Events:**

**registration-signup:**
- Receives: `{ email, username, password }`
- Calls: `registerUser(email, username, password)`
- Emits: `registration-response`

**email-verification:**
- Receives: `{ verificationToken }`
- Calls: `verifyEmail(verificationToken)`
- Emits: `registration-response`

**registration-verify:** (Legacy, not used)
- Receives: `{ verificationToken, password }`
- Calls: `verifyEmailAndSetPassword(verificationToken, password)`

### ./backend/utils/registrationHandler.js
**Purpose:** Registration business logic

**registerUser(email, username, password):**
```javascript
1. Check pending_registrations for duplicate email/username
2. Check users for duplicate email/username
3. Hash password: bcrypt.hash(password, 10)
4. Generate token: crypto.randomBytes(32).toString('hex')
5. Calculate expiration: NOW() + 24 hours (token), NOW() + 7 days (registration)
6. INSERT INTO pending_registrations
7. Build link: https://theexpanse.onrender.com/dossier-login.html?verify={token}
8. Call sendVerificationEmail()
9. Return { success, message }
```

**verifyEmail(verificationToken):**
```javascript
1. SELECT FROM pending_registrations WHERE token = $1 AND token_expires_at > NOW()
2. Generate user_id: generateHexId('user_id')
3. SELECT auto_approve_users FROM system_settings
4. Set approvalStatus = (auto_approve ? 'approved' : 'pending')
5. BEGIN transaction
6. INSERT INTO users (uses password_hash from pending_registrations)
7. DELETE FROM pending_registrations
8. COMMIT
9. Return { success, message, user, auto_approved }
```

**verifyEmailAndSetPassword(verificationToken, password):** (Legacy)
- Similar to verifyEmail but hashes new password instead of using stored hash

### ./backend/utils/emailSender.js
**Purpose:** Send emails via SMTP2GO

**Configuration:**
```javascript
SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY
SMTP2GO_SENDER = process.env.SMTP2GO_FROM_EMAIL
Endpoint: https://api.smtp2go.com/v3/email/send
```

**sendVerificationEmail(userEmail, username, verificationLink):**
- Subject: "Verify Your Email - TheExpanse"
- HTML body: Green terminal theme
- Text body: Plain text fallback
- Link format: `https://theexpanse.onrender.com/dossier-login.html?verify={64-char-token}`

**sendApprovalEmail(userEmail, username):**
- Subject: "Your Account Has Been Approved - TheExpanse"
- Contains login link

**sendRejectionEmail(userEmail, username):**
- Subject: "Registration Status - TheExpanse"
- Red terminal theme

### ./backend/auth/UserManager.js
**Purpose:** User CRUD operations

**createUser(username, email, password, role):**
- Hash password with bcrypt
- INSERT INTO users
- Return user object or error

**verifyUser(username, password):**
- SELECT user by username or email
- Check is_active
- bcrypt.compare(password, password_hash)
- Update last_login
- Return user (without password_hash)

**changePassword(userId, oldPassword, newPassword):**
- Verify old password
- Hash new password
- UPDATE users

**getUserById(userId):**
- SELECT user without password_hash

### ./backend/councilTerminal/socketHandler.js
**Purpose:** Main WebSocket handler

**Initialization:**
```javascript
import initializeRegistrationSockets from './registrationSocketHandler.js';

export function initializeWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  
  const sessions = new Map();
  
  initializeRegistrationSockets(io);
  
  // Other handlers...
}
```

### ./routes/admin.js
**Purpose:** Admin HTTP API

**GET /api/admin/settings/:setting_key:**
- Auth: verifyToken middleware
- SELECT FROM system_settings WHERE setting_key = $1
- Returns: `{ success, key, value }`

**POST /api/admin/settings/:setting_key:**
- Auth: verifyToken middleware
- Body: `{ value }`
- UPSERT INTO system_settings
- Returns: `{ success, message }`

**GET /api/admin/pending-users:**
- Auth: verifyToken middleware
- SELECT FROM users WHERE approval_status = 'pending'
- Returns: Array of user objects

**POST /api/admin/approve-user/:user_id:**
- Auth: verifyToken middleware
- UPDATE users SET approval_status='approved', approved_at=NOW()
- Call sendApprovalEmail()
- Returns: `{ success, message }`

**POST /api/admin/reject-user/:user_id:**
- Auth: verifyToken middleware
- UPDATE users SET approval_status='rejected'
- Call sendRejectionEmail()
- Returns: `{ success, message }`

---

## FRONTEND FILES

### ./public/dossier-login.html
**Purpose:** Login and signup interface

**State Machine:**

**Signup States:**
1. `email`: "> Enter email" (type: text)
2. `confirm-email`: "> Confirm email address" (type: text)
3. `username`: "> Enter desired username" (type: text)
4. `password`: "> Enter password" (type: password, toggle: shown)
5. `confirm-password`: "> Confirm password" (type: password, toggle: shown, reset from previous)
6. `waitingForLink`: "> Check your email for verification link" (disabled)
7. `complete`: "> Registration complete" (disabled)

**Login States:**
1. `username`: "> Enter username" (type: text)
2. `password`: "> Enter password" (type: password, toggle: shown)
3. `command`: "> Enter command" (type: text)

**Socket Event Handlers:**

**Outgoing:**
```javascript
// After password confirmation matches
socket.emit('registration-signup', {
  email: tempEmail,
  username: tempUsername,
  password: tempPassword
});

// On page load with ?verify= parameter
socket.emit('email-verification', { 
  verificationToken: verifyToken 
});
```

**Incoming:**
```javascript
socket.on('registration-response', (data) => {
  if (data.success) {
    addLine('SYSTEM: ' + data.message, 'success', true);
    // Update state based on message content
  } else {
    addLine('SYSTEM: ' + data.message, 'error', true);
    // Reset to email input
  }
});
```

**URL Parameter Detection:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const verifyToken = urlParams.get("verify");
if (verifyToken) {
  socket.emit("email-verification", { verificationToken: verifyToken });
  addLine("SYSTEM: Verifying your email...", "success", true);
  document.querySelector("[data-tab=\"signup-tab\"]").click();
}
```

**Password Toggle:**
```javascript
function showPasswordToggle() {
  passwordToggle.textContent = 'Show';
  passwordToggle.style.display = 'block';
}

function resetPasswordToggle() {
  passwordToggle.textContent = 'Show';
  passwordToggle.style.display = 'none';
}

passwordToggle.addEventListener('click', () => {
  if (loginInput.type === 'password') {
    loginInput.type = 'text';
    passwordToggle.textContent = 'Hide';
  } else {
    loginInput.type = 'password';
    passwordToggle.textContent = 'Show';
  }
});
```

**Email Confirmation Logic:**
```javascript
else if (signupState === 'confirm-email') {
  addLine('> ' + value, '', true);
  if (value !== tempEmail) {
    addLine('SYSTEM: Email addresses do not match. Please try again.', 'error', true);
    signupState = 'email';
    loginInput.type = 'text';
    loginInput.placeholder = '> Enter email';
    loginInput.value = '';
    tempEmail = '';
    resetPasswordToggle();
  } else {
    signupState = 'username';
    loginInput.type = 'text';
    loginInput.placeholder = '> Enter desired username';
    loginInput.value = '';
    resetPasswordToggle();
  }
}
```

**Password Confirmation Logic:**
```javascript
else if (signupState === 'confirm-password') {
  addLine('> ********', '', true);
  if (value !== tempPassword) {
    addLine('SYSTEM: Passwords do not match. Please try again.', 'error', true);
    signupState = 'password';
    loginInput.type = 'password';
    loginInput.placeholder = '> Enter password';
    loginInput.value = '';
    showPasswordToggle();
  } else {
    socket.emit('registration-signup', {
      email: tempEmail,
      username: tempUsername,
      password: tempPassword
    });
    resetPasswordToggle();
  }
}
```

### ./public/admin.html
**Purpose:** Admin panel

**Settings Section:**
```html
<section id="settings" class="section">
  <h2>System Settings</h2>
  
  <div class="form-group">
    <label>
      <input type="checkbox" id="auto-approve-toggle">
      Auto-approve new users after email verification
    </label>
  </div>
  
  <button class="btn" onclick="saveAutoApproveSetting()">Save Settings</button>
  
  <h3>Pending User Approvals</h3>
  <div id="pending-users-list" class="data-grid"></div>
</section>
```

**JavaScript Functions:**
```javascript
async function loadAutoApproveSetting() {
  const response = await fetch("/api/admin/settings/auto_approve_users");
  const data = await response.json();
  document.getElementById("auto-approve-toggle").checked = data.value === "true";
}

async function saveAutoApproveSetting() {
  const isEnabled = document.getElementById("auto-approve-toggle").checked;
  await fetch("/api/admin/settings/auto_approve_users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: isEnabled ? "true" : "false" })
  });
}

async function loadPendingUsers() {
  const response = await fetch("/api/admin/pending-users");
  const users = await response.json();
  // Render user cards with approve/reject buttons
}

async function approveUser(userId) {
  await fetch(`/api/admin/approve-user/${userId}`, { method: "POST" });
  loadPendingUsers();
}

async function rejectUser(userId) {
  await fetch(`/api/admin/reject-user/${userId}`, { method: "POST" });
  loadPendingUsers();
}
```

---

## CONFIGURATION

### Environment Variables (.env)
```bash
DATABASE_URL=postgresql://pizasukerutondb_user:Srd0ECwQ4GeulQxTFhdDUYirRwxp71G6@dpg-d1l7cr7diees73fag97g-a.oregon-postgres.render.com/pizasukerutondb
SMTP2GO_API_KEY=api-3C479AE44CF042F2BDE4A0A568876847
SMTP2GO_FROM_EMAIL=cheesefang@pizasukeruton.com
JWT_SECRET=[redacted]
PORT=3000
```

### Database Connection (./backend/db/pool.js)
```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

---

## COMPLETE USER FLOW

### Signup Flow (Auto-Approve: ON)

**Step 1: User Input**
1. User enters email → stored in `tempEmail`
2. User confirms email → validates match
3. User enters username → stored in `tempUsername`
4. User enters password → stored in `tempPassword`
5. User confirms password → validates match

**Step 2: Registration**
```
Frontend: socket.emit('registration-signup', { email, username, password })
Backend:  registrationSocketHandler receives event
Backend:  calls registerUser(email, username, password)
Backend:  checks for duplicates in pending_registrations
Backend:  checks for duplicates in users
Backend:  hashes password: bcrypt.hash(password, 10) = 60-char hash
Backend:  generates token: crypto.randomBytes(32).toString('hex') = 64-char hex
Backend:  calculates expiration: NOW() + 24 hours
Backend:  INSERT INTO pending_registrations
Backend:  builds link: https://theexpanse.onrender.com/dossier-login.html?verify={token}
Backend:  calls sendVerificationEmail()
SMTP2GO:  sends email
Backend:  emits registration-response { success: true }
Frontend: displays "SYSTEM: Verification email sent. Check your inbox."
```

**Step 3: Email Verification**
```
User:     clicks link in email
Browser:  loads https://theexpanse.onrender.com/dossier-login.html?verify={token}
Frontend: detects ?verify= parameter
Frontend: socket.emit('email-verification', { verificationToken })
Backend:  registrationSocketHandler receives event
Backend:  calls verifyEmail(verificationToken)
Backend:  SELECT FROM pending_registrations WHERE token = $1 AND token_expires_at > NOW()
Backend:  generates user_id using hexIdGenerator
Backend:  SELECT auto_approve_users FROM system_settings
Backend:  auto_approve = 'true'
Backend:  BEGIN transaction
Backend:  INSERT INTO users (user_id, email, username, password_hash, approval_status='approved', email_verified=true, approved_at=NOW())
Backend:  DELETE FROM pending_registrations WHERE registration_id = $1
Backend:  COMMIT
Backend:  emits registration-response { success: true, message: "Email verified and account approved. You may now login." }
Frontend: displays success message
```

**Step 4: Login**
```
User:     clicks LOGIN tab
User:     enters username
User:     enters password
Frontend: socket.emit('terminal-auth', { username, password })
Backend:  socketHandler receives event
Backend:  SELECT FROM users WHERE username = $1 OR email = $1
Backend:  bcrypt.compare(password, password_hash)
Backend:  UPDATE users SET last_login = NOW()
Backend:  emits auth-response { success: true, user }
Frontend: loads user menu
Frontend: slides up dossier cover
```

### Signup Flow (Auto-Approve: OFF)

Same as above through Step 2.

**Step 3 (Modified):**
```
Backend:  SELECT auto_approve_users FROM system_settings
Backend:  auto_approve = 'false'
Backend:  INSERT INTO users (approval_status='pending', approved_at=NULL)
Backend:  emits registration-response { success: true, message: "Email verified. Awaiting admin approval." }
Frontend: displays pending message
```

**Step 4: Admin Approval**
```
Admin:    navigates to /admin
Admin:    clicks Settings tab
Frontend: loadPendingUsers()
Frontend: fetch('/api/admin/pending-users')
Backend:  SELECT FROM users WHERE approval_status='pending'
Frontend: displays user in list
Admin:    clicks Approve button
Frontend: approveUser(user_id)
Frontend: fetch(`/api/admin/approve-user/${user_id}`, { method: 'POST' })
Backend:  UPDATE users SET approval_status='approved', approved_at=NOW() WHERE user_id=$1
Backend:  calls sendApprovalEmail(email, username)
SMTP2GO:  sends approval email
Backend:  returns { success: true }
Frontend: reloads pending users list
```

**Step 5: User Login**
```
User:     receives approval email
User:     attempts login
[Same as Step 4 of auto-approve flow]
```

---

## SECURITY IMPLEMENTATION

### Password Hashing
```javascript
// Hashing
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const hash = await bcrypt.hash(plainPassword, saltRounds);
// Result: $2a$10${22-char-salt}{31-char-hash} = 60 characters total

// Verification
const isValid = await bcrypt.compare(plainPassword, storedHash);
// Returns: true or false
```

### Token Generation
```javascript
const crypto = require('crypto');
const token = crypto.randomBytes(32).toString('hex');
// 32 bytes = 256 bits entropy
// Hex encoding = 64 characters
// Collision probability: 1 in 2^256
```

### SQL Injection Prevention
```javascript
// All queries use parameterized format
await pool.query('SELECT * FROM users WHERE email = $1', [email]);
// Never: 'SELECT * FROM users WHERE email = ' + email
```

### JWT Authentication
```javascript
const jwt = require('jsonwebtoken');

// Generate
const token = jwt.sign(
  { user_id, username, role },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Verify (middleware)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

---

## DEPLOYMENT

### Git Repository
```
URL: https://github.com/PizaSukeruton/theexpanse
Branch: main
```

### Render Configuration
```
Build Command: npm ci --omit=dev
Start Command: node server.js
Auto-Deploy: Enabled (on push to main)
```

### Deployment Process
```
1. Developer: git push origin main
2. GitHub: Receives push
3. Render: Detects push via webhook
4. Render: git clone repository
5. Render: npm ci --omit=dev
6. Render: node server.js
7. Server: Connects to PostgreSQL
8. Server: Initializes WebSocket
9. Server: Loads characters
10. Render: Routes traffic to https://theexpanse.onrender.com
```

### Database Migration
```sql
-- Run once on production database
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

**Status:** Already created on 2025-11-09

---

## PRODUCTION STATUS

### Deployment
- ✅ Production URL: https://theexpanse.onrender.com
- ✅ Server running: Node.js v22.21.1
- ✅ Database connected: pizasukerutondb (Oregon, USA)
- ✅ WebSocket initialized
- ✅ 7 characters loaded

### Database State
- ✅ system_settings table exists
- ✅ auto_approve_users = 'true'
- ✅ pending_registrations = 0 rows
- ✅ users = 2 rows (Cheese Fang, james)

### Email Service
- ✅ SMTP2GO configured
- ✅ API key active
- ✅ Sender verified: cheesefang@pizasukeruton.com
- ✅ Emails delivering successfully

### Test Results (2025-11-10)
```
Test 1: Complete Signup Flow
- Status: PASS
- User created: #D00002 (james)
- Email verified: true
- Approval status: approved
- Login: successful

Test 2: Duplicate Detection
- Status: PASS
- Error: "Email or username already registered"

Test 3: Email Confirmation
- Status: PASS
- Mismatch detected correctly

Test 4: Password Confirmation
- Status: PASS
- Mismatch detected correctly

Test 5: Password Toggle
- Status: PASS
- Reset works between fields

Test 6: Admin Settings
- Status: PASS
- Toggle persists after refresh
```

---

## BUGS FIXED

### Bug 1: Password Not Captured
**File:** `./backend/councilTerminal/registrationSocketHandler.js`
**Line:** 11
**Before:** `const { email, username } = data;`
**After:** `const { email, username, password } = data;`

### Bug 2: Password Not Hashed
**File:** `./backend/utils/registrationHandler.js`
**Line:** 1
**Before:** `export async function registerUser(email, username) {`
**After:** `export async function registerUser(email, username, password) {`
**Added:** `const passwordHash = await bcrypt.hash(password, 10);`
**Changed:** INSERT uses `passwordHash` instead of empty string

### Bug 3: Registration Socket Not Initialized
**File:** `./backend/councilTerminal/socketHandler.js`
**Line:** 7, 19
**Added:** `import initializeRegistrationSockets from './registrationSocketHandler.js';`
**Added:** `initializeRegistrationSockets(io);`

### Bug 4: Password Toggle Not Reset
**File:** `./public/dossier-login.html`
**Line:** Multiple locations
**Added:** `resetPasswordToggle();` after `signupState = 'confirm-password';`
**Changed:** `showPasswordToggle();` after moving to confirm-password state

### Bug 5: Wrong HTML File Referenced
**File:** `./backend/utils/registrationHandler.js`
**Line:** 31
**Before:** `const verificationLink = \`https://theexpanse.onrender.com/dossier-login.html?verify=\${verificationToken}\`;`
**After:** (Same, but production file replaced)
**Action:** Replaced `dossier-login.html` content with `dossier-login-clean.html`

### Bug 6: Quote Escaping Error
**File:** `./public/dossier-login-clean.html`
**Line:** 438
**Before:** `addLine('> ' + value, '''`
**After:** `addLine('> ' + value, ''`

---

## FILE MANIFEST

### Files Created/Modified
```
backend/auth/UserManager.js                          [NEW]
backend/councilTerminal/registrationSocketHandler.js [NEW]
backend/councilTerminal/socketHandler.js             [MODIFIED]
backend/utils/registrationHandler.js                 [NEW]
backend/utils/emailSender.js                         [NEW]
backend/middleware/rateLimiter.js                    [NEW]
backend/utils/validator.js                           [NEW]
backend/utils/accessLogger.js                        [NEW]
backend/utils/logger.js                              [NEW]
middleware/auth.js                                   [NEW]
routes/admin.js                                      [MODIFIED]
public/dossier-login.html                           [REPLACED]
public/dossier-login-clean.html                     [NEW]
public/admin.html                                    [MODIFIED]
public/user-menu.js                                  [NEW]
scripts/manage-users.js                              [NEW]
```

### Git Commits
```
1e4a947 - feat: Complete user signup system with email verification and auto-approval
cbbc332 - fix: Add missing middleware files for deployment
aac4cbd - fix: Add missing utility files, user-menu, and admin scripts
22daada - fix: Initialize registration socket handler in main socket connection
ef2f4c0 - feat: Replace dossier-login.html with new signup system
```

---

## END OF DOCUMENT

**Status:** Complete  
**Production:** Live  
**Last Updated:** 2025-11-10  
**Word Count:** ~7,500 words
