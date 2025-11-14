File: admin.html
Date: November 6, 2025, 6:37 PM AEST
Location: public/admin.html
Size: 419 lines, 13,089 bytes
Purpose: Admin panel for managing stories and characters
Dependencies: None - vanilla JavaScript
Architecture: Two-panel layout with sidebar navigation
CSS Variables: --fg: #00ff75, --accent: #00ff75, --panel: rgba(0,32,0,0.4)
Sections: Stories and Characters management forms
Story Form Fields: title, description, category, image, choices[], isStartNode
Character Form Fields: name, entity, department, securityLevel, summary, backstory, abilities, image
Dynamic UI: Choice builder with add/remove functionality
API Endpoints: /api/admin/stories, /api/admin/characters
Data Display: Grid layout with data cards
MongoDB: Uses _id field indicating MongoDB backend
Security Issues: No authentication check, direct DELETE operations
File Upload: FormData with multipart/form-data
Error Handling: Basic try-catch with alerts
Categories: Main Quest, Side Quest, Exploration, Combat
Status: FUNCTIONAL but lacks authentication
Issues: No auth checks, MongoDB IDs exposed in DOM
