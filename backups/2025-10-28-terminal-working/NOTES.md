# CTI-1985 Terminal - Working Version
Date: October 28, 2025, 5:22 PM AEST
Status: FULLY FUNCTIONAL

## What's Working
- Terminal authentication (username: pizasukeruton, password: ctw-secret)
- Dossier cover animation and reveal
- Terminal queries to Archive of Knowledge (AOK)
- Database connection to Render PostgreSQL
- Returns tanuki mythology entries from aok_entries table
- Shows "REGISTER FOR EXPANDED ACCESS" message

## Architecture
- Backend: Node.js with Express (ESM modules)
- Terminal Core: CommonJS (.cjs files) to avoid ESM conflicts
- Database: PostgreSQL on Render with SSL
- Frontend: Retro CTI-1985 green terminal aesthetic with CRT effects

## Key Files
- dossier-login.html - Main frontend interface
- terminal-integration.js - Initial Terminal API integration
- terminal-fix.js - Fixes login state handling
- terminalCore.cjs - Core Terminal logic (CommonJS)
- db/connection.cjs - Database connection with dotenv (CommonJS)
- routes/terminal.js - Express route handler (ESM)
- server.js - Main Express server (ESM with dotenv)

## Database Table Structure
Table: aok_entries
- entry_id (varchar) - Primary key like "#600001"
- title (varchar) - Question text
- content (text) - Answer text
- category_id (varchar) - Category reference
- difficulty_level (numeric) - Used as proxy for access level

## API Endpoint
POST /api/terminal/query
Body: { "question": "search term" }
Returns: { data: [...entries], message: "...", access_level: 0-4 }

## Test Query
curl -X POST http://localhost:3000/api/terminal/query \
  -H "Content-Type: application/json" \
  -d '{"question":"tanuki"}'
