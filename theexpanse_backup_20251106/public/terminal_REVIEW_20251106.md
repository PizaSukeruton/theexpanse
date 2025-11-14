File: terminal.html
Date: November 6, 2025, 6:41 PM AEST
Location: public/terminal.html
Size: 213 lines, 6,947 bytes
Purpose: Standalone terminal interface with hardcoded authentication
Dependencies: None - vanilla JavaScript
Architecture: Two-panel layout (info panel, chat panel)
CSS Theme: Green terminal #39ff14 on dark #070b0f background
Security Issues: Hardcoded credentials username:'pizasukeruton' password:'ctw-secret'
Authentication: Client-side only, no server validation
Login Flow: Username prompt -> Password prompt -> Access granted/denied
Commands: help, who is..., missions, logout
CRT Effects: Scanlines, glow, blinking cursor animation
Dossier Content: Hardcoded Agent Piza Sukeruton, Multiverse Reaper, Psi Div Level 0
UI Components: Chat log (320px), input bar, send button
Responsive: Flexbox layout switches column at 800px
Status Messages: YOU (user), BOT (response), // (system)
Cursor: Animated blinking span element
Status: FUNCTIONAL but insecure - all auth client-side
Critical Issue: Lines 151-152 hardcoded credentials visible in source
Note: Line 191 "no API connection yet" - simulated chatbot only
