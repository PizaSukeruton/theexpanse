File: qa-extractor.html
Date: November 6, 2025, 6:40 PM AEST
Location: public/qa-extractor.html
Size: 636 lines, 19,780 bytes
Purpose: 3-step PDF Q&A extraction interface
Dependencies: None - vanilla JavaScript
Architecture: 3-step wizard (Upload PDF, Select Topics, Review Q&A)
CSS Theme: Green terminal (#00ff00) on black background
Step 1: PDF upload, page selection with grid display
Step 2: Topic extraction from selected pages, entity frequency display
Step 3: Q&A pair review with approve/reject functionality
API Endpoints: /api/qa/analyze, /api/qa/extract-topics, /api/qa/extract-qa
Data Storage: Client-side Sets and arrays (selectedPages, selectedTopics, qaData)
Page Selection: All, none, range, custom selection string
Topic Selection: All, none, top 10, top 25
Q&A Limit: Default 25, max 100 configurable
Q&A Fields: question, answer_short, answer_sentence, evidence_span
UI Components: Page cards (150px), Topic cards (200px), Q&A cards with actions
Status Indicators: Processing (yellow), Success (green), Error (red)
Summary Stats: Approved/Rejected counters
Status: FUNCTIONAL - No authentication required
Note: Console.log for approved pairs, no actual AOK submission implemented
