# The Expanse Project - Thread Continuation Brief
## Date: November 4, 2025

I'm building "The Expanse" - an autonomous character simulation with 100+ AI entities. Each character has up to 370 slots (traits, inventory, knowledge) that determine ALL behavior through emergent interactions.

## Current Status
Just completed CharacterEngine v1.0 - successfully loads characters from PostgreSQL database and manages their 370-slot profiles. Tested with Claude (#700002) who has 270 traits loaded.

## Technical Stack
- Node.js with ES6 modules
- PostgreSQL on Render (URL: postgresql://pizasukerutondb_user:Srd0ECwQ4GeulQxTFhdDUYirRwxp71G6@dpg-d1l7cr7diees73fag97g-a.oregon-postgres.render.com/pizasukerutondb)
- Project location: ~/Desktop/theexpanse

## Database Schema
- character_profiles: Basic character info (uses character_name not name)
- character_trait_scores: Which slots each character has filled
- characteristics: Master list of all 370 slots (includes Inventory, Knowledge categories)
- character_claimed_knowledge_slots: Knowledge domain assignments

## 370 Slot System
All in characteristics table with categories: Emotional (30), Cognitive (60), Social (60), Behavioral (60), Specialized (60), Inventory (30), Knowledge (50), Blank Slot (20)

## Working Files
- backend/engines/CharacterEngine_TEST.js - Working simplified version
- backend/engines/CharacterEngine_FIXED.js - Full production version
- backend/db/pool.js - Database connection (SSL conditional)
- backend/engines/testSimple.js - Test script

## Key Implementation Notes
- Characters ONLY have traits defined in database (sparse profiles)
- Traits use 0-100 scale (0=minimal, 100=maximum)
- No separate inventory table - it's category='Inventory' in characteristics
- Must run from project root: cd ~/Desktop/theexpanse && node backend/engines/test.js
- SSL in pool.js must be conditional based on environment

## Test Results
Claude (#700002): 270 traits loaded, 0 inventory, 0 knowledge, category "Tanuki"

## Next Task
Build the first module (TSE Learning Module) that plugs into CharacterEngine to handle how characters learn based on their trait combinations. The engine detects interactions, modules decide responses.

## Module Interface
Modules receive traits/inventory/knowledge maps and implement initialize() and action methods. CharacterEngine handles registration and execution.
