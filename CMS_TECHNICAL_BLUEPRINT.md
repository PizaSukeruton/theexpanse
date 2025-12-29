# THE EXPANSE CMS - TECHNICAL BLUEPRINT

## System Architecture

### Core Technologies
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with connection pooling
- **Session Management**: express-session with PostgreSQL session store
- **WebSocket**: Socket.io for real-time terminal communication
- **Authentication**: Cookie-based sessions with access level verification
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Styling**: Custom CSS with #00ff75 hex color theme

## Database Schema

### character_profiles table
```sql
- character_id (VARCHAR(7), PRIMARY KEY) - Hex format #XXXXXX
- character_name (VARCHAR(100), NOT NULL)
- category (VARCHAR(50)) - Constrained to specific values
- description (TEXT)
- is_b_roll_autonomous (BOOLEAN) - Required for B-Roll/Machines, NULL for others
- trait_vector (VECTOR(350))
- image_url (VARCHAR(255))
- forgetting_enabled (BOOLEAN, DEFAULT true)
- omiyage_giving_affinity (NUMERIC(5,2))
- omiyage_receiving_comfort (NUMERIC(5,2))
- image_gallery (JSONB)
```

### Key Constraints
- `chk_b_roll_autonomy_by_category`: Enforces B-Roll Chaos/Machines require is_b_roll_autonomous
- `chk_character_id_hex`: Validates hex ID format ^#[0-9A-F]{6}$
- Category limited to: Protagonist, Antagonist, Tanuki, Council Of The Wise, B-Roll Chaos, Machines, Angry Slice Of Pizza, Knowledge Entity

### Related Tables
- character_inventory (links characters to objects)
- character_image_gallery (stores character images)
- multiverse_events (tracks events with involved_characters JSONB)
- narrative_segments (stories with associated_character_ids array)
- story_arcs + arc_characters (story arc participation)
- objects (items with PAD emotional values)

## API Endpoints

### Authentication
- `GET /cms-login` - Login page
- `POST /auth/login` - Process login (via authRoutes)
- `GET /cms` - Main CMS page (requires authentication)

### CMS Character Management
- `GET /api/cms/characters` - List all non-Knowledge-Entity characters
- `GET /api/cms/character/:characterId` - Get single character details
- `POST /api/cms/character/create` - Create character + Knowledge Entity
- `PUT /api/cms/character/:characterId/profile-image` - Update profile image

### Character Data Endpoints
- `GET /api/cms/character/:characterId/inventory` - Character's objects with PAD values
- `GET /api/cms/character/:characterId/events` - Multiverse events involvement
- `GET /api/cms/character/:characterId/narratives` - Story segments
- `GET /api/cms/character/:characterId/story-arcs` - Story arc participation

### Image Management
- `POST /api/images/upload` - Upload image with hex ID generation
- `GET /api/images/character/:characterId` - Get character's image gallery

## Hex ID System

### Generator Function
Located in: `backend/utils/hexIdGenerator.js`

### ID Ranges
- character_id: 0x700000 - 0x70FFFF
- gallery_entry_id: 0xCA0000 - 0xCAFFFF
- multimedia_asset_id: 0xC20000 - 0xC2FFFF

### Implementation
- Uses hex_id_counters table for tracking
- Transactional generation with rollback on conflicts
- Format: #XXXXXX (e.g., #70000A)

## Frontend Architecture

### File Structure
```
cms/
├── public/
│   ├── index.html (main CMS page)
│   └── cms-login.html (login page)
├── css/
│   └── cms-styles.css (terminal theme styling)
└── js/
    ├── adminMenu.js (admin menu system)
    ├── characterDisplay.js (character dossier display)
    ├── cmsSocketHandler.js (WebSocket connection)
    └── imageHandler.js (image upload/display)
```

### Admin Menu Structure
- CHARACTER MANAGEMENT (View/Create/Edit/Inventory/Traits)
- ENTITY MANAGEMENT (Entities/Knowledge Editor/Relationships)
- WORLD BUILDING (Locations/Objects/Knowledge Domains)
- NARRATIVE SYSTEM (Story Arcs/Segments/Paths)
- EVENTS SYSTEM (Multiverse/Psychic/Omiyage Events)
- USER & SYSTEM (Users/Settings/Database Health/Hex Monitor)

## Character Creation Flow

1. User fills form with name, category, description, password
2. System validates session authentication
3. Generates two hex IDs via generateHexId('character_id')
4. Begins PostgreSQL transaction
5. Creates character with category-specific constraints
   - B-Roll Chaos/Machines: is_b_roll_autonomous = false
   - Others: is_b_roll_autonomous = NULL
6. Creates Knowledge Entity (always is_b_roll_autonomous = NULL)
7. Commits transaction or rollbacks on error
8. Returns both character IDs to frontend

## WebSocket Integration

### Terminal Connection
- Namespace: /terminal
- Authentication via session cookies
- Real-time command execution
- Character psychic state broadcasting

### Session Sharing
```javascript
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
```

## Security Features

1. **Session-based Authentication**
   - PostgreSQL session store
   - Access level verification
   - Cookie security with httpOnly flags

2. **CSRF Protection**
   - Via session tokens

3. **Input Validation**
   - Hex ID format validation
   - Category constraints
   - Required field checking

4. **Password Confirmation**
   - Required for character creation/deletion
   - TODO: Implement actual password verification

## Module Dependencies

### Core Modules
- express, express-session, cookie-parser
- pg, pg-pool (PostgreSQL)
- socket.io (WebSocket)
- multer (file uploads)
- helmet (security headers)
- cors (cross-origin support)

### Custom Modules
- hexIdGenerator.js - ID generation
- pool.js - Database connection pooling
- Various route handlers in backend/routes/

## Performance Optimizations

1. **Database**
   - Connection pooling
   - Indexed character_id fields
   - JSONB for flexible data structures

2. **Frontend**
   - Vanilla JS (no framework overhead)
   - Event delegation for dynamic content
   - Lazy loading of character details

3. **Filtering**
   - Knowledge Entities excluded from main character list
   - Pagination limits (20 events per character)

## Error Handling

1. **Database Errors**
   - Transaction rollback on failures
   - Detailed constraint violation messages
   - Connection pool error recovery

2. **Frontend Errors**
   - Try-catch blocks on all API calls
   - User-friendly error messages
   - Console logging for debugging

3. **Session Errors**
   - Redirect to login on missing session
   - Clear error messages for auth failures

## Future TODO Items

1. Implement actual password verification for character creation
2. Add character editing functionality
3. Complete remaining admin menu features
4. Add bulk operations support
5. Implement character relationships
6. Add audit logging for all operations
