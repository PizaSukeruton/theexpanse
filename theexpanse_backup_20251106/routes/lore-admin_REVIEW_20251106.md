File: lore-admin.js
Date: November 6, 2025, 6:49 PM AEST
Location: routes/lore-admin.js
Size: 134 lines, 4,720 bytes
Purpose: Story arc management API routes
Dependencies: express, crypto, pool
Architecture: Express router with CRUD operations for story arcs
Table: story_arcs
Fields: arc_id, title, summary, tags[], keywords[], created_at
Hex ID Generation: crypto.randomBytes(3) - NOT using proper hex system
Endpoints: /test, /arcs (GET/POST), /arcs/:arc_id (GET/PATCH/DELETE), /arcs/search, /arcs/by-hex
Search: ILIKE on title, summary, tags array, keywords array
Pagination: limit (max 200), offset, order (ASC/DESC)
Array Handling: Converts comma-separated strings to arrays
SQL Escaping: Escapes % and _ in LIKE patterns
UNNEST: Uses PostgreSQL UNNEST for array searching
COALESCE: Partial updates with COALESCE in PATCH
Response Format: {items: [], limit, offset, order} or single object
Error Handling: Returns {error: message} with status codes
Status Codes: 200, 400, 404, 500
Critical Issue: Line 6 uses crypto.randomBytes() instead of hex system
Security: No authentication on any endpoints
Status: FUNCTIONAL but flawed hex generation
