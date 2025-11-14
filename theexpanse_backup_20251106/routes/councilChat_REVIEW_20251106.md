File: councilChat.js
Date: November 6, 2025, 6:48 PM AEST
Location: routes/councilChat.js
Size: 170 lines, 9,076 bytes
Purpose: Natural language query interface for multiverse data
Dependencies: express, pool
Architecture: Express router with pattern matching query parser
Endpoint: POST /chat
Query Types: who is, where is, show arc, show details, list events
Tables: characters, locations, story_arcs, multiverse_events
Hex ID Pattern: Extracts #XXXXXX format IDs
Pagination: limit (max 100), offset (max 10000)
Sort: ASC/DESC on timestamp
Default Limits: 50 items if not specified
Query Patterns: 13 different natural language patterns
Event Queries: By location, type, realm, date range
Sighting Support: Special handling for sighting events
ILIKE Searches: Case-insensitive pattern matching with %wildcards%
Response Format: {text: string, type: 'success'|'error'|'not_found'}
Session: Uses req.session.userId or "debug-test"
Security Issues: SQL injection safe (parameterized), but exposes raw JSON
Status: FUNCTIONAL
Issues: Returns raw JSON.stringify() of database rows
