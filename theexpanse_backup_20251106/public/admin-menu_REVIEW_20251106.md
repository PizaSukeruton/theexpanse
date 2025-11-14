File: admin-menu.js
Date: November 6, 2025, 6:38 PM AEST
Location: public/admin-menu.js
Size: 481 lines, 13,883 bytes
Purpose: Collapsible admin menu for dossier-login.html
Dependencies: Requires dossier-login.html DOM structure
Architecture: Injected menu system with collapsible sections
Security Issues: Hardcoded credentials username:'Cheese Fang' password:'P1zz@P@rty@666'
Menu Sections: CHARACTERS, EVENTS, STORY ARCS, NARRATIVES, KNOWLEDGE, MEDIA, SYSTEM
Character Categories: Protagonist, Antagonist, Tanuki, Council Of The Wise, B-Roll Chaos, Machines, Angry Slice Of Pizza, Mutai
API Endpoints: /api/admin/characters, /api/character, /api/admin/login
Image Editor: Canvas-based with CRT filter effect
Canvas Size: 256x256 fixed dimensions
Auth Token: Stored in localStorage as admin_token
Character Modal: Edit/delete functionality with inline modal
Hex ID Handling: Removes '#' from character IDs for API calls
CSS Colors: #00ff00 green theme throughout
Status: SECURITY CRITICAL - Hardcoded admin credentials exposed
Critical Issue: Lines 346-350 hardcoded credentials in client-side code
