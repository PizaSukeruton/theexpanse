# CMS - Character Management System

**Purpose:** Hybrid GUI + Command-line interface for managing The Expanse characters

## Architecture

### Three-Window Layout (Integrated with Terminal v003)
- **LEFT:** Character list (dropdown/menu style)
- **TOP RIGHT:** Character profile display (images, knowledge, relationships)
- **BOTTOM RIGHT:** Command bar (natural language + structured commands)

### Dual Input System
1. **GUI Route:** Click character → Display profile → Click "Add Knowledge" button
2. **Command Route:** Type "add knowledge 'The Cheese Wars' to Piza" → Execute

### Backend API Routes (server.js)
- GET /api/character_profiles
- GET /api/character_profiles/:id
- GET /api/knowledge_items
- POST /api/relationships
- GET /api/relationships/:hexId
- DELETE /api/relationships/:id

### Phase 1: Foundation (Week 1)
- [x] Create cms/ directory structure
- [ ] Basic character list display
- [ ] Character profile viewer
- [ ] Simple command parser (5-10 commands)

### Phase 2: Knowledge Integration (Week 2)
- [ ] Knowledge tag system
- [ ] Relationship creation UI
- [ ] Command: "add knowledge [name] to [character]"

### Phase 3: Full Integration (Week 3)
- [ ] Story arc linking
- [ ] Image gallery integration
- [ ] Advanced commands
- [ ] Natural language processing

