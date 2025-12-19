# The Expanse V005 - Memory & Learning System

## 🧠 Complete System Architecture

### Phase 1: Vector Memory System ✅
**File:** `backend/utils/vectorMemoryManager.js`
- Semantic memory with embeddings (Ollama nomic-embed-text)
- HNSW vector indexes for ~1-2ms similarity search
- Stores conversations with metadata
- Retrieves similar past interactions

**Database Tables:**
- `tse_conversation_vectors` - Vector embeddings with metadata
- `tse_session_contexts` - User session state
- `tse_memory_stats` - Performance metrics

---

### Phase 2: Significance Scorer ✅
**File:** `backend/utils/significanceScorer.js`
- Scores each conversation (0.0 to 1.0)
- 6-signal analysis:
  - Keywords detection
  - Intent type (WHO, WHAT, WHERE, WHY, SHOW_IMAGE)
  - Context changes (new entities)
  - Confidence threshold (>0.85)
  - Query complexity
  - Result quality

**Output:**
- `score` - Overall significance
- `isSignificant` - Boolean flag
- `recommendation` - ASK_TO_REMEMBER or SKIP

---

### Phase 3: Dossier Generator ✅
**File:** `backend/utils/dossierGenerator.js`
- Creates C.O.T.W. Dossier entries
- Tracks research depth per entity
- Calculates Council membership progression

**Thresholds:**
- 3+ questions on entity → Creates Dossier entry
- Research levels: NOVICE → APPRENTICE → SCHOLAR → ARCHIVIST → MASTER
- Council readiness calculated from dossier count + quality

**Database Table:** `tse_dossier_entries`

---

### Phase 4: User Belt Progression ✅
**File:** `backend/utils/userBeltProgressionManager.js`
- Quiz-based advancement system
- 5 belts × 5 stripes per topic
- Much faster than character progression (3 quizzes per stripe)

**Belt Order:** White → Blue → Purple → Brown → Black

**Advancement Criteria:**
- Quiz completion threshold
- Accuracy requirement
- Council readiness score

**Database Table:** `user_belt_progression`

---

### Phase 5: Session Summarizer ✅
**File:** `backend/utils/sessionSummarizer.js`
- Creates session summaries on logout
- Tracks entities discussed
- Topics covered
- Generates next session greeting
- Commits summary to memory

---

### Phase 6: Logout/Login Handlers ✅
**File:** `backend/sockets/logoutSocketHandler.js`

**On Logout:**
1. Summarizes session
2. Commits to memory
3. Prepares greeting for next login
4. Emits farewell message

**On Login:**
1. Retrieves last session memory
2. Personalizes greeting
3. Shows Council progress
4. Displays dossier entries

---

## 🎮 User Journey

### Session Flow:
1. **Login** → Claude greets with last session context
2. **Research** → User asks questions about entities
3. **Significance Detection** → System scores conversations
4. **Dossier Creation** → 3+ questions = entry created
5. **Quiz Invitation** → Claude asks mastery questions
6. **Belt Advancement** → Successful quizzes = belt progression
7. **Logout** → Session summarized & committed to memory

### Council Membership Progression:
- **BEGINNING_JOURNEY** → <3 dossiers
- **EARLY_EXPLORER** → 3-5 dossiers
- **DEDICATED_RESEARCHER** → 5-8 dossiers
- **SERIOUS_SCHOLAR** → 8-12 dossiers
- **COUNCIL_CANDIDATE** → 12+ dossiers, 75%+ worthiness
- **COUNCIL_MATERIAL** → Max achieved

---

## 📊 Key Metrics Tracked

### Per User:
- Total vectors stored
- Average relevance score
- Dossier entries (by topic)
- Council readiness %
- Belt progression (per topic)
- Quiz accuracy

### Per Entity:
- Research depth
- Questions asked
- Significance scores
- Last discussed date

---

## 🔌 Socket Events

### Emit (Server → Client):
- `logout:status` - Progress updates during logout
- `logout:complete` - Logout finished with summary
- `login:complete` - Login finished with greeting
- `memory-committed` - Memory saved successfully
- `memory-error` - Memory operation failed

### Listen (Client → Server):
- `user:logout` - User is logging out
- `user:login` - User is logging in
- `memory:commit-important` - Save moment to memory
- `memory:retrieve-context` - Get similar memories

---

## 🗄️ Database Schema

### New Tables Created:
1. `tse_conversation_vectors` - Vector embeddings
2. `tse_session_contexts` - Session state
3. `tse_memory_stats` - Performance tracking
4. `tse_dossier_entries` - Research tracking
5. `user_belt_progression` - Quiz advancement

### Key Columns:
- Hex IDs for all entries (using hex generator)
- JSON metadata for flexible storage
- JSONB for complex nested data
- Timestamps for session tracking

---

## 🎯 Next Steps (Optional)

1. **Quiz Generator** - Create questions based on dossiers
2. **Memory Retrieval Integration** - Auto-inject relevant memories into responses
3. **Belt Badge System** - Visual representation of progression
4. **Analytics Dashboard** - Track learning patterns
5. **VIP Personalization** - Track specific user interactions (for Vans Japan meetings)

---

## 💡 Key Features

✅ **Semantic Memory** - Understands meaning, not just keywords
✅ **Automatic Significance Detection** - Knows what's worth remembering
✅ **Research Tracking** - C.O.T.W. Dossiers show expertise building
✅ **Gamified Learning** - Belt system keeps users engaged
✅ **Personalized Greetings** - Claude remembers each user's journey
✅ **No Fake Data** - All using real hex IDs and actual generators
✅ **Production Ready** - Error handling, logging, transactions

---

Generated: 2025-11-27 11:49 AEST
