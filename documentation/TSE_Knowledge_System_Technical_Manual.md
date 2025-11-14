# TSE Knowledge System - Technical Manual
## Complete Architecture & Implementation Guide
### Version 1.0 - November 8, 2024

---

## 1. System Architecture Overview

### 1.1 Core Concept
The TSE Knowledge System treats knowledge topics as "Knowledge Entities" - special character profiles that can accumulate knowledge items over time. This enables:
- Organized knowledge management by subject/topic
- Predictive caching based on access patterns
- Integration with the FSRS spaced repetition system
- Trait-influenced knowledge delivery

### 1.2 Database Structure

#### Character Profiles Table
```sql
character_profiles
├── character_id (VARCHAR(7)) - Hex ID (#700000-#70FFFF)
├── character_name (VARCHAR(100))
├── category (VARCHAR(50)) - Including "Knowledge Entity"
├── description (TEXT)
└── [other character fields...]
```

#### Knowledge Items Table
```sql
knowledge_items
├── knowledge_id (VARCHAR(7)) - Hex ID (#AF0000-#AFFFFF)
├── content (TEXT) - JSON structured data
├── domain_id (VARCHAR(7)) - References knowledge_domains
├── source_type (VARCHAR(50))
├── initial_character_id (VARCHAR(7)) - Links to entity owner
├── complexity_score (DOUBLE) - 0.0-1.0 difficulty rating
└── concept (VARCHAR(40))
```

---

## 2. Data Flow Architecture

### 2.1 Knowledge Entity Creation Flow
```
Frontend (admin-menu.js) 
    ↓ [POST /api/character]
Server (routes/admin.js)
    ↓ [Generate hex ID via character_id sequence]
PostgreSQL (character_profiles)
    ↓ [Insert with category="Knowledge Entity"]
Response → Frontend
```

### 2.2 Knowledge Item Addition Flow
```
Frontend (admin-menu.js)
    ↓ [POST /api/admin/knowledge-item]
Server (routes/admin.js)
    ↓ [Generate knowledge_id, create JSON content]
PostgreSQL (knowledge_items)
    ↓ [Insert with initial_character_id = entity_id]
Response → Frontend
```

---

## 3. Implementation Details

### 3.1 Frontend Components

#### Admin Menu Integration (public/admin-menu.js)
```javascript
// Menu Structure
menuItems = [
  {
    title: "KNOWLEDGE",
    items: ["AOK Entries", "Transfers", "Domains"]
  }
]

// Key Functions
window.loadKnowledgeEntities() - Fetches all Knowledge Entities
window.showCreateKnowledgeEntity() - Shows entity creation form
window.showAddKnowledge(entityId, entityName) - Shows knowledge addition form
window.createKnowledgeEntity() - Creates new entity via API
window.addKnowledgeItem(entityId, entityName) - Adds knowledge to entity
```

### 3.2 API Endpoints

#### GET /api/admin/knowledge-entities
- **Purpose**: Retrieve all Knowledge Entities with knowledge counts
- **Auth**: Requires admin token (JWT)
- **Response**: 
```json
{
  "success": true,
  "entities": [
    {
      "character_id": "#700006",
      "character_name": "NOFX",
      "description": "Punk rock band",
      "knowledge_count": 1
    }
  ]
}
```

#### POST /api/admin/knowledge-item
- **Purpose**: Add knowledge item to an entity
- **Auth**: Requires admin token (JWT)
- **Payload**:
```json
{
  "entity_id": "#700006",
  "entity_name": "NOFX",
  "statement": "Fat Mike is the Singer and Bass Player",
  "difficulty": 50
}
```
- **Response**:
```json
{
  "success": true,
  "knowledge_id": "#AF0001",
  "message": "Knowledge item added successfully"
}
```

### 3.3 Knowledge Item JSON Structure
```json
{
  "type": "fact",
  "subject": "NOFX",
  "statement": "Fat Mike is the Singer and Bass Player",
  "entity_id": "#700006",
  "context_type": "WHO|WHAT|WHERE|WHEN|WHY|HOW",
  "keywords": ["fat mike", "bassist", "singer"],
  "meta": {
    "origin": "admin_entry",
    "contributor": "Cheese Fang",
    "veracity": "canon"
  }
}
```

---

## 4. Authentication & Security

### 4.1 JWT Token Flow
```
Terminal Login (socketHandler.js)
    ↓ [Session-based auth, no JWT]
Admin Login (routes/admin.js)
    ↓ [POST /api/admin/login]
JWT Generation (jwtUtil.js)
    ↓ [24-hour expiry]
localStorage → Frontend
    ↓ [Bearer token in headers]
API Verification (middleware/auth.js)
```

### 4.2 Security Considerations
- JWT_SECRET: Fixed value across server restarts
- Token expiry: 24 hours
- Admin role verification: access_level >= 5
- Input validation: Username allows spaces after modification
- SQL injection protection via parameterized queries

---

## 5. Hex ID Generation System

### 5.1 ID Ranges
```
Character IDs: #700000 - #70FFFF
Knowledge IDs: #AF0000 - #AFFFFF
Domain IDs:    #AE0000 - #AE9FFF
```

### 5.2 Generation Method
- Characters: Using PostgreSQL sequence via generateHexId('character_id')
- Knowledge: Manual generation with SQL MAX() + 1 (needs improvement)

---

## 6. TSE Integration Points

### 6.1 Knowledge Acquisition Engine
```javascript
// Searches knowledge_items by entity
SELECT * FROM knowledge_items 
WHERE initial_character_id = [entity_id]
AND content ILIKE '%[search_term]%'
```

### 6.2 FSRS Memory System
- complexity_score: Affects retention difficulty
- current_retrievability: Stored in character_knowledge_state
- stability: Memory strength parameter

### 6.3 Trait Influence
- Knowledge delivery shaped by character traits
- 81 trait patterns in KnowledgeResponseEngine
- Emergent patterns: curious_cautious, anxious_genius, etc.

---

## 7. Current System State

### 7.1 Working Components
- ✅ Knowledge Entity creation
- ✅ Knowledge item addition
- ✅ Frontend admin interface
- ✅ API endpoints
- ✅ Database storage
- ✅ JWT authentication

### 7.2 Known Issues
- Knowledge ID generation uses lowercase (#af0001 instead of #AF0001)
- Terminal login doesn't generate admin token (separate from admin login)
- No bulk import functionality
- No knowledge item editing/deletion UI

---

## 8. Future Enhancement Paths

### 8.1 Immediate Improvements
1. **Fix Hex ID Generation**: Ensure uppercase for knowledge_ids
2. **Unified Auth**: Make terminal login generate admin token
3. **CRUD Operations**: Add edit/delete for knowledge items
4. **Bulk Import**: CSV/JSON import for knowledge sets

### 8.2 Advanced Features
1. **Knowledge Relationships**: Link related knowledge items
2. **Access Pattern Tracking**: 
```sql
ALTER TABLE knowledge_items ADD COLUMN access_count INTEGER DEFAULT 0;
ALTER TABLE knowledge_items ADD COLUMN last_accessed TIMESTAMP;
```
3. **Predictive Caching**: Pre-load frequently accessed knowledge
4. **5W1H Classification**: Auto-categorize by question type
5. **Knowledge Validation**: Verify JSON structure before insert

### 8.3 Integration Opportunities
1. **Claude Integration**: Direct knowledge queries in terminal
2. **Council Member Profiles**: Personal knowledge domains
3. **Learning Analytics**: Track knowledge acquisition rates
4. **Export Functions**: Generate study materials

---

## 9. API Extension Template

### Adding New Knowledge Operations
```javascript
// routes/admin.js

// Update knowledge item
router.put('/knowledge-item/:id', verifyToken, async (req, res) => {
  // Implementation
});

// Delete knowledge item
router.delete('/knowledge-item/:id', verifyToken, async (req, res) => {
  // Implementation
});

// Bulk import
router.post('/knowledge-import', verifyToken, upload.single('file'), async (req, res) => {
  // Parse CSV/JSON
  // Validate structure
  // Batch insert
});
```

---

## 10. Database Optimization Queries

### Useful Maintenance Queries
```sql
-- Fix lowercase hex IDs
UPDATE knowledge_items 
SET knowledge_id = UPPER(knowledge_id) 
WHERE knowledge_id ~ '^#[a-f]';

-- Knowledge statistics by entity
SELECT 
  cp.character_name,
  COUNT(ki.knowledge_id) as item_count,
  AVG(ki.complexity_score) as avg_complexity
FROM character_profiles cp
LEFT JOIN knowledge_items ki ON ki.initial_character_id = cp.character_id
WHERE cp.category = 'Knowledge Entity'
GROUP BY cp.character_id, cp.character_name;

-- Orphaned knowledge items
SELECT * FROM knowledge_items 
WHERE initial_character_id NOT IN (
  SELECT character_id FROM character_profiles
);
```

---

## 11. File Structure

### Project Files Modified/Created
```
theexpanse/
├── public/
│   ├── admin-menu.js (Modified - Added Knowledge management)
│   └── dossier-login.html (Modified - Username validation)
├── routes/
│   └── admin.js (Modified - Added knowledge endpoints)
├── backend/
│   └── utils/
│       └── validator.js (Modified - Allow spaces in usernames)
└── documentation/
    └── TSE_Knowledge_System_Technical_Manual.md (This file)
```

---

## 12. Testing Procedures

### 12.1 Create Knowledge Entity
1. Login as admin (Cheese Fang)
2. Navigate to KNOWLEDGE → AOK Entries
3. Click "Create New Entity"
4. Enter entity name and description
5. Verify entity appears in list

### 12.2 Add Knowledge Item
1. Click "+ Add Knowledge" next to entity
2. Enter knowledge statement
3. Set difficulty (1-100)
4. Submit and verify in database

### 12.3 Database Verification
```bash
# Check entities
echo "SELECT * FROM character_profiles WHERE category = 'Knowledge Entity';" | psql

# Check knowledge items
echo "SELECT * FROM knowledge_items WHERE initial_character_id IN (SELECT character_id FROM character_profiles WHERE category = 'Knowledge Entity');" | psql
```

---

## Summary

The TSE Knowledge System successfully implements a character-based knowledge management system where topics become entities that can accumulate knowledge over time. The system integrates with the existing TSE Loop, FSRS spaced repetition, and trait-influenced delivery mechanisms. With the frontend admin tool, knowledge can be easily managed through a web interface, setting the foundation for sophisticated AI-driven learning experiences.

**Core Innovation**: Treating knowledge topics as character entities enables predictive caching, relationship mapping, and personality-driven knowledge delivery - creating a unique educational architecture that goes beyond traditional knowledge bases.

---
*Technical Manual v1.0 - November 8, 2024*
*System Designer: James (Piza Sukeruton)*
*Implementation: TSE Knowledge Entity System*
