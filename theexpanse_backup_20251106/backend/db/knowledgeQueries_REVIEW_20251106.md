# knowledgeQueries.js - Technical Review
Date: November 6, 2025, 6:25 PM AEST
Location: backend/db/knowledgeQueries.js
Size: 275 lines, 10,022 bytes
Purpose: Database query layer for knowledge system
Dependencies: pool.js only
Architecture: Object with async query methods for knowledge operations
Critical Issues: NONE
Major Issues: No error handling, no transaction support for multi-step operations
Tables: knowledge_items, character_knowledge_state, knowledge_domains, knowledge_review_logs, knowledge_transfer_logs
Key Operations: CRUD for knowledge items, state management, review tracking, transfer logging
UPSERT Pattern: ON CONFLICT DO UPDATE for state management
Good: Clean SQL, proper parameterization, consistent patterns
Bad: No connection pooling per query, no retry logic
Production Readiness: 85% - Solid data layer
Status: PRODUCTION READY (add error handling)
Notable: Lines 35-62 excellent UPSERT implementation
