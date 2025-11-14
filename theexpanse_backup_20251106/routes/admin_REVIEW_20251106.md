File: admin.js
Date: November 6, 2025, 6:43 PM AEST
Location: routes/admin.js
Size: 361 lines, 9,866 bytes
Purpose: Admin API routes with authentication and media management
Dependencies: express, bcryptjs, multer, sharp, pool, jwtUtil
Architecture: Express router with JWT authentication
Endpoints: /login, /verify, /media, /entities, /hex/next, /relationships, /stats
Authentication: bcrypt password compare, access_level >= 5 required
JWT: generateToken and verifyToken from jwtUtil
Media Upload: Multer memory storage, 10MB limit, image types only
CRT Filter: Sharp library for green tint, gamma 1.4, blur 0.3
Storage: public/gallery directory with hex ID filenames
Database Tables: users, multimedia_assets, hex_relationships, hex_entities
Hex ID Generation: get_next_hex_id() SQL function
Transaction: BEGIN/COMMIT/ROLLBACK for media upload
File Validation: Check if hex ID file already exists
Relationships: JSON array in request, stored in hex_relationships
Stats Endpoint: Counts for all entity types
Security: Password hashing, JWT tokens, access level check
Status: FUNCTIONAL
Issues: Console.log in production, no rate limiting
