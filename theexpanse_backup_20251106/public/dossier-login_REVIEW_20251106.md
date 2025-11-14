File: dossier-login.html
Date: November 6, 2025, 6:36 PM AEST
Location: public/dossier-login.html
Size: 318 lines, 12,763 bytes
Purpose: Terminal authentication interface with dossier viewing
Dependencies: Socket.io, admin-menu.js
Architecture: Two-panel layout with left dossier display and right terminal chat
Security Issues: Password shown as asterisks only, hardcoded admin check for "Cheese Fang"
CSS: Custom properties with hex color #00ff75 for accent
WebSocket: Real-time auth and command handling via Socket.io
Image: Hardcoded portrait /gallery/pizasukerutonprofile.png
State Machine: username -> password -> command states
Data Flow: socket.emit terminal-auth, terminal-command events
Response Events: auth-response, command-response, dossier-data
Accessibility: ARIA labels and roles implemented
CRT Effect: CSS filter and scanlines overlay
Responsive: Media queries for tablet and mobile
Decoy Fields: Hidden inputs to confuse password managers
localStorage: Stores terminal_user after successful auth
Status: FUNCTIONAL with hardcoded admin name issue
