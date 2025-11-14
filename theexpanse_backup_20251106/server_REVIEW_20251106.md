# server.js - Technical Review
Date: November 6, 2025, 6:33 PM AEST
Location: server.js (root)
Size: 133 lines, 5,138 bytes
Purpose: Main Express server with WebSocket support
Dependencies: Express, Helmet, CORS, Socket.io, multiple routers
Architecture: Express with middleware stack, WebSocket integration
Critical Issues: SECURITY - unsafe-inline/unsafe-eval in CSP
Major Issues: Duplicate /admin route (lines 62 & 105), file path injection risk (line 94)
Routes: 12+ API endpoints including TSE, traits, narrative, auth
Security: Helmet CSP configured but with unsafe directives
WebSocket: HTTP server wrapped for Socket.io
Good: Route registration logging, character loading on startup
Bad: CSP allows unsafe-inline/eval, path sanitization incomplete
Production Readiness: 70% - Security issues need fixing
Status: FUNCTIONAL WITH SECURITY RISKS
Notable: Lines 91-101 dossier save with incomplete sanitization
Fix Required: Remove unsafe-inline/eval, proper path sanitization
