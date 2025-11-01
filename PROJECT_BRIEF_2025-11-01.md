# THE EXPANSE PROJECT BRIEF
Generated: November 1, 2025 - 5:45 AM AEST
Location: /Users/pizasukeruton/Desktop/theexpanse/

## CRITICAL: ATTACH THIS FILE TO NEW THREADS

## WORKING PRINCIPLES

### NO HARDCODED DATA
- Everything from PostgreSQL
- Dynamic generation only
- No static examples

### COMMAND FORMAT
- Use EOF heredocs without hashtag descriptions
- Clean executable commands only
- One task at a time

### HEX ID SYSTEM (CRITICAL)
- Format: #XXYYYY
- #70XXXX = characters
- #C0XXXX = narrative segments
- #C3XXXX = locations
- #AXXXXX = multimedia assets

## SYSTEM ARCHITECTURE

### Database
- PostgreSQL: pizasukerutondb (AWS RDS)
- All tables use hex IDs
- Fuzzy matching via synonyms table

### Current Features
- Terminal interface (WebSocket)
- Fuzzy search with typo tolerance
- Context-aware conversations
- Session management
- Query history
- Relevance scoring

### File Structure
/theexpanse/
├── server.js
├── backend/
│   ├── councilTerminal/
│   │   ├── socketHandler.js
│   │   ├── cotwQueryEngine.js
│   │   └── cotwIntentMatcher.js
│   └── utils/
│       └── hexGenerator.js
├── public/
│   ├── dossier-login.html
│   └── terminal.html
└── backups/

### Authentication
- Terminal users: username/password
- Admin system: TO BE BUILT

## NEXT PRIORITY: ADMIN SYSTEM

### Required Features
1. Admin authentication (separate from terminal)
2. Character image upload system
3. Story/event creation interface
4. Timeline management
5. Relationship builder

### Must Support
- Hex ID generation for all entities
- Image uploads with character association
- Story arc creation with events
- Historical timeline entries
- Character relationships

## KNOWN ISSUES
- "search" command treats whole phrase as entity
- "what is" on narrative needs fixing
- Location queries need formatting

## TEST CREDENTIALS
- Username: Cheese Fang
- Password: P1zz@P@rty@666

## IMPORTANT NOTES
- Always backup before changes
- Use ES6 modules (import, not require)
- Test with node test-fuzzy-features.js
- Server runs on port 3000
