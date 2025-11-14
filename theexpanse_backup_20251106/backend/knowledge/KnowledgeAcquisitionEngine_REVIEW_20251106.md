# KnowledgeAcquisitionEngine.js - Technical Review
Date: November 6, 2025, 5:57 PM AEST
Location: backend/knowledge/KnowledgeAcquisitionEngine.js
Size: 458 lines, 20,076 bytes
Purpose: Knowledge retrieval, spaced repetition, transfer, and memory decay
Dependencies: 6 managers (Memory, Cognitive, SpacedRep, Transfer, SlotPopulator, Trait)
Architecture: JavaScript semantic search with keyword extraction, FSRS algorithm
Critical Issues: NONE
Major Issues: Console logging, ingestNewKnowledge not implemented (line 199)
Strengths: Complete FSRS implementation, knowledge transfer system, decay scheduler
Semantic Search: Stop words filtering, ILIKE queries, relevance scoring
Spaced Repetition: Stability/difficulty tracking, review intervals, decay calculation
Knowledge Transfer: Success rate based on traits, quality degradation
Database: knowledge_items, knowledge_domains, character_knowledge_state tables
Production Readiness: 85% - Mature implementation missing ingestion
Notable: Lines 89-117 dynamic SQL generation, Lines 243-293 transfer algorithm
