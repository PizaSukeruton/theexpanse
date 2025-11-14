File: admin-pg.js
Date: November 6, 2025, 6:45 PM AEST
Location: routes/admin-pg.js
Size: 156 lines, 5,206 bytes
Purpose: Admin routes for narrative segments and characters (PostgreSQL version)
Dependencies: express, multer, pool
Architecture: Express router with file upload to disk
Storage: public/uploads directory with timestamp filenames
Upload Limit: 5MB file size limit
Hex ID Generation: Math.random() based, NOT using proper hex system
Tables: narrative_segments, narrative_paths, multimedia_assets, characters, uploaded_images
Endpoints: /stories, /paths, /characters, /media
Segment Types: narration (default), others unspecified
Path Types: choice_option (default)
Character Fields: name, role, species, description, abilities[], image_url
Critical Issues: Random hex ID generation instead of sequential system
Security Issues: No authentication, no input validation
File Storage: Direct disk storage without validation
Status: FUNCTIONAL but flawed hex ID generation
Major Issue: Lines 49, 54, 89, 134 use Math.random() for hex IDs
Note: Appears to be older version before proper hex system implementation
