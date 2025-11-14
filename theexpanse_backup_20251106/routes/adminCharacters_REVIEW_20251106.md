File: adminCharacters.js
Date: November 6, 2025, 6:46 PM AEST
Location: routes/adminCharacters.js
Size: 60 lines, 2,182 bytes
Purpose: Admin character management routes with proper authentication
Dependencies: express, pool, requireAdmin middleware, hexIdGenerator
Architecture: Express router with admin middleware protection
Authentication: requireAdmin() middleware on all routes
Hex ID Generation: Proper generateHexId('character_id') from hexIdGenerator
Table: character_profiles
Endpoints: GET /, POST /, PUT /:id
Character Fields: character_id, character_name, category, description, image_url
Response Format: {success: boolean, characters/character: data, message: error}
Error Handling: Try-catch with console.error and status codes
Status Codes: 200 OK, 404 Not Found, 500 Server Error
Timestamps: created_at, updated_at (CURRENT_TIMESTAMP on update)
Security: Admin middleware protection on all routes
Status: PRODUCTION READY
Good: Proper hex ID generation, admin protection, error handling
Issues: Console.error in production
