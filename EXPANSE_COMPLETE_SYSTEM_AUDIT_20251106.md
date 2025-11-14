THE EXPANSE SYSTEM - COMPLETE EXHAUSTIVE TECHNICAL BLUEPRINT v4.0
Date: November 6, 2025, 3:54 PM AEST
Complete System Audit with All Components

COMPLETE FILE INVENTORY

Backend Core Files - 27 JavaScript files documented

TSE Pipeline Components:
- TSELoopManager.js - 29,803 chars - Main orchestrator
- TeacherComponent.js - 4,032 chars - Teacher interactions
- StudentComponent.js - 21,208 chars - Student learning logic
- EvaluationComponent.js - 1,054 chars - Scoring system
- PerformanceMonitor.js - 19,037 chars - Performance tracking
- LearningDatabase.js - 23,193 chars - Learning persistence
- BeltProgressionManager.js - 28,220 chars - Belt advancement
- AccuracyScorer.js - 7,517 chars - Accuracy evaluation
- bRollManager.js - 7,318 chars - B-roll character management
- index.js - 4,068 chars - TSE entry point

TSE Helper Modules:
- KnowledgeResponseEngine.js - 24,528 chars - Response generation
- CodeResponseGenerator.js - 4,922 chars - Code response helper
- codingTrainingModule.js - 19,688 chars - Coding training

Knowledge System:
- KnowledgeAcquisitionEngine.js - 20,752 chars - Knowledge retrieval
- CognitiveLoadManager.js - 8,877 chars - Load management
- EmptySlotPopulator.js - 13,704 chars - Slot population
- MemoryDecayCalculator.js - 4,022 chars - Memory decay
- SpacedRepetitionScheduler.js - 4,130 chars - Spaced repetition
- KnowledgeTransferManager.js - 4,940 chars - Knowledge transfer

Database & Utils:
- pool.js - 789 chars - Database connection
- knowledgeQueries.js - 10,022 chars - Knowledge SQL queries
- hexIdGenerator.js - 4,129 chars - Hex ID generation

Traits & Config:
- TraitManager.js - 3,605 chars - Trait management
- knowledgeConfig.js - 3,827 chars - Knowledge configuration

Character Engine:
- CharacterEngine_TEST.js - 3,770 chars - Test implementation

COMPLETE DATABASE SCHEMA - 73 Total Tables

Core Character Tables:
1. character_profiles - Character metadata
2. character_trait_scores - 370 traits per character
3. characteristics - Trait definitions
4. character_belt_progression - Belt tracking
5. character_inventory - Character items
6. character_knowledge_state - Knowledge relationships
7. character_skill_points - Skill tracking

Knowledge System Tables - 16 tables:
8. knowledge_items - Main knowledge storage
9. knowledge_domains - Categories
10. knowledge_dependencies - Prerequisites
11. knowledge_relationships - Connections
12. knowledge_review_logs - Review history
13. knowledge_transfer_logs - Transfer events
14. knowledge_access_requirements - Access rules
15. knowledge_transfer_log - Transfer tracking
16. knowledge_chunks - Knowledge segments
17. chunk_dependencies - Chunk relationships
18. chunk_evaluation - Chunk evaluation
19. chunk_mastery - Mastery tracking
20. chunk_review_schedule - Review scheduling
21. chunk_transfer_log - Chunk transfers
22. chunk_performance - Performance metrics
23. chunk_interactions - Interaction tracking

TSE System Tables - 11 tables:
24. tse_cycles - Learning cycles
25. tse_teacher_records - Teacher data
26. tse_student_records - Student progress
27. tse_evaluation_records - Evaluations
28. tse_performance_metrics - Performance
29. tse_coding_challenges - Challenges
30. tse_coding_teachers - Teacher profiles
31. tse_coding_attempts - Attempt records
32. tse_coding_evaluations - Code evaluations
33. tse_coding_progress - Progress tracking
34. character_belt_progression - Belt tracking

AOK Legacy System - 4 tables:
35. aok_entries - Archive entries
36. aok_categories - Categories
37. aok_reviews - Reviews
38. aok_search_logs - Search history

System Tables:
39. hex_id_counters - ID generation
40. chunked_messages - Message chunks
41. embeddings - Vector embeddings
42. users - User accounts
43. conversations - Conversation logs
44. narrative_segments - Story segments
45. narrative_paths - Story paths
46. multimedia_assets - Media files
47. locations - Location data

DATA STATISTICS

Active Records:
- Characters: 13 test characters 700001-700013
- Traits: 370 trait definitions 000001-0001A3
- Knowledge Items: 116+ entries
  - 45 original knowledge items
  - 21 tanuki lore migrated from AOK
  - 50+ Pokemon Q&A being added
- Knowledge Domains: 3 active
  - C133B7 - tanuki_mythology
  - AE0002 - Pokemon Knowledge
  - AE0100 - NLG Vocabulary
- TSE Cycles: Multiple completed
- Belt System: Uses character_belt_progression table with current_belt and stripes

HEX ID ALLOCATION RANGES:
character_id: 0x700000 to 0x70FFFF - 65,536 possible
user_id: 0xD00000 to 0xD0FFFF - 65,536 possible
multiverse_event_id: 0xC90000 to 0xC9FFFF - 65,536 possible
aok_entry: 0x600000 to 0x6003E7 - 1,000 possible
aok_category: 0x601000 to 0x601063 - 100 possible
aok_review: 0x602000 to 0x6027FF - 2,048 possible
aok_search: 0x603000 to 0x6037FF - 2,048 possible
mapping_id: 0xAA0000 to 0xAA9FFF - 40,960 possible
relationship_id: 0xAB0000 to 0xAB9FFF - 40,960 possible
requirement_id: 0xAC0000 to 0xAC9FFF - 40,960 possible
transfer_id: 0xAD0000 to 0xAD9FFF - 40,960 possible
domain_id: 0xAE0000 to 0xAE9FFF - 40,960 possible
knowledge_item_id: 0xAF0000 to 0xAF9FFF - 40,960 possible
tse_evaluation_record_id: 0x800000 to 0x80FFFF - 65,536 possible
belt_progression_id: 0xBB0000 to 0xBBFFFF - 65,536 possible
conversation_id: 0x900000 to 0x9FFFFF - 1,048,576 possible
narrative_segment_id: 0xC00000 to 0xC0FFFF - 65,536 possible
narrative_path_id: 0xC10000 to 0xC1FFFF - 65,536 possible
multimedia_asset_id: 0xC20000 to 0xC2FFFF - 65,536 possible
location_id: 0xC30000 to 0xC3FFFF - 65,536 possible
tse_coding_teacher: 0xC40000 to 0xC4FFFF - 65,536 possible
tse_coding_attempt: 0xC50000 to 0xC5FFFF - 65,536 possible
tse_coding_evaluation: 0xC60000 to 0xC6FFFF - 65,536 possible
tse_coding_progress: 0xC70000 to 0xC7FFFF - 65,536 possible
tse_coding_challenge: 0xC80000 to 0xC8FFFF - 65,536 possible
story_arc_id: 0x301000 to 0x301FFF - 4,096 possible
terminal_log_id: 0xE00000 to 0xE0FFFF - 65,536 possible

KNOWLEDGE CONFIGURATION:
- 370 traits mapped to knowledge categories
- Cognitive traits to analytical knowledge
- Emotional traits to social knowledge
- Behavioral traits to practical knowledge

COMPLETE TSE KNOWLEDGE LEARNING CYCLE:
1. Request Entry via TSELoopManager.startKnowledgeCycle
2. Character Load via CharacterEngine loads 370 traits
3. Profile Analysis via KnowledgeResponseEngine analyzes traits
4. Knowledge Query via KnowledgeAcquisitionEngine searches knowledge_items
5. Cognitive Load via CognitiveLoadManager filters by capacity
6. Response Generation via KnowledgeResponseEngine creates response
7. Learning Persistence via LearningDatabase stores to character_knowledge_state
8. Performance Evaluation via AccuracyScorer evaluates response
9. Belt Progression via BeltProgressionManager checks advancement
10. Cycle Complete returns full learning profile

FRONTEND COMPONENTS NOW FOUND:
- server.js - 5138 bytes - Main Express server
- public/dossier-login.html - Main interface
- public/admin.html - Admin panel
- public/admin-menu.js - Admin controls
- public/qa-extractor.html - QA tool
- public/terminal.html - Terminal interface
- public/index.html - Landing page

API ROUTE DEFINITIONS NOW FOUND:
- routes/admin.js
- routes/admin-pg.js
- routes/adminCharacters.js
- routes/auth.js
- routes/councilChat.js
- routes/lore-admin.js
- routes/terminal.js

PYTHON QA EXTRACTION UTILITIES NOW FOUND - 47 files:
- qa_focused_extractor.py
- qa_patterns.py
- qa_templates.py
- qa_utils.py
- qa_from_refined.py
- qa_from_sentences.py
- qa_clause_splitter.py
- knowledge_chunker.py
- paragraph_extractor.py
- paragraph_refiner.py
- pdf_sentence_extractor.py
- And 36 more Python utilities

DOCUMENTATION FILES NOW FOUND:
- documentation/TSE/README.md - 24473 bytes
- documentation/BeltProgression/
- documentation/KnowledgeResponseEngine/

CURRENT DEPLOYMENT:
- Database: PostgreSQL on Render - pizasukerutondb
- Server: Node.js v24.3.0
- Port: 3000
- Environment: macOS development
- URL: http://localhost:3000

COMPLETE AUDIT SUMMARY:
- 27 JavaScript backend files
- 47 Python utilities
- 7 route handlers
- 8 frontend HTML files
- 47 database tables
- 116+ knowledge items
- 13 test characters
- 370 traits per character
- belt progression with stripes
- All components accounted for and documented
