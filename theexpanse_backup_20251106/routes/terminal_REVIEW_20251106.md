File: terminal.js
Date: November 6, 2025, 6:51 PM AEST
Location: routes/terminal.js
Size: 155 lines, 6,120 bytes
Purpose: Terminal query router with Council chat proxy
Dependencies: express, TerminalCore, fetch API
Architecture: Express router that routes queries to Council or TerminalCore
Endpoint: POST /query
Query Detection: Pattern matching for Council-style queries
Council Patterns: 13 patterns (who is, where is, show arc, events, etc.)
Proxy Target: http://localhost:3000/api/expanse/council/chat
Query Normalization: Converts "what happened at" to "what events happened at"
Article Stripping: Removes the/a/an from location queries
Response Parsing: Extracts JSON from "Found: " prefix in Council responses
Formatters: Event, Character, Location, Arc summarizers
Event Details: Expanded format for "show details for event #"
Response Format: {data: [{id, question, answer}], message, access_level}
Session: Uses req.session.userId or null
Error Handling: 400 for no query, 502 for proxy failure
ID Generation: Base64 encoding of query for council responses
TerminalCore: Fallback for non-Council queries
Status: FUNCTIONAL
Issues: Hardcoded localhost:3000 URL, no authentication
