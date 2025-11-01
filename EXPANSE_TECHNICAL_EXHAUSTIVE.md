# THE EXPANSE - EXHAUSTIVE TECHNICAL DOCUMENTATION
Generated: November 1, 2025 - 5:56 AM AEST
Project Root: /Users/pizasukeruton/Desktop/theexpanse/

## COMPLETE DATABASE SCHEMA - PostgreSQL (pizasukerutondb on AWS RDS)

### characters TABLE
- character_id VARCHAR(7) PRIMARY KEY CHECK (character_id ~ '^#70[0-9A-F]{4}$')
- name VARCHAR(100) NOT NULL UNIQUE
- description TEXT
- character_type VARCHAR(50)
- image_url VARCHAR(255)
- first_appearance VARCHAR(100)
- associated_asset_id VARCHAR(7) FOREIGN KEY REFERENCES multimedia_assets(asset_id)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- traits JSONB

### multimedia_assets TABLE
- asset_id VARCHAR(7) PRIMARY KEY CHECK (asset_id ~ '^#A[0-9A-F]{5}$')
- asset_type VARCHAR(50)
- file_path VARCHAR(255)
- description TEXT
- associated_entity_id VARCHAR(7)
- associated_entity_type VARCHAR(50)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- metadata JSONB

### narrative_segments TABLE
- segment_id VARCHAR(7) PRIMARY KEY CHECK (segment_id ~ '^#C0[0-9A-F]{4}$')
- title VARCHAR(200)
- content TEXT
- sequence_number INTEGER
- chapter VARCHAR(100)
- associated_characters VARCHAR(7)[] ARRAY
- associated_location_id VARCHAR(7) FOREIGN KEY REFERENCES locations(location_id)
- themes VARCHAR(50)[] ARRAY
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### locations TABLE
- location_id VARCHAR(7) PRIMARY KEY CHECK (location_id ~ '^#C3[0-9A-F]{4}$')
- name VARCHAR(100) NOT NULL UNIQUE
- description TEXT
- realm VARCHAR(50) INDEX idx_locations_realm
- associated_asset_id VARCHAR(7) FOREIGN KEY REFERENCES multimedia_assets(asset_id)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### knowledge_graph TABLE
- entity1_id VARCHAR(7)
- entity1_type VARCHAR(50)
- relationship VARCHAR(100)
- entity2_id VARCHAR(7)
- entity2_type VARCHAR(50)
- strength DECIMAL(3,2) CHECK (strength BETWEEN 0 AND 1)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- PRIMARY KEY (entity1_id, entity2_id, relationship)

### users TABLE
- user_id VARCHAR(7) PRIMARY KEY CHECK (user_id ~ '^#D0[0-9A-F]{4}$')
- username VARCHAR(50) UNIQUE NOT NULL
- password_hash VARCHAR(255)
- access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 10)
- last_login TIMESTAMP
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- session_data JSONB

### traits TABLE
- trait_id SERIAL PRIMARY KEY
- trait_name VARCHAR(100) UNIQUE NOT NULL
- trait_category VARCHAR(50)
- description TEXT

### themes TABLE
- theme_id SERIAL PRIMARY KEY
- theme_name VARCHAR(100) UNIQUE NOT NULL
- description TEXT
- parent_theme VARCHAR(100)

### objects TABLE
- object_id SERIAL PRIMARY KEY
- object_name VARCHAR(100) UNIQUE NOT NULL
- object_type VARCHAR(50)
- description TEXT
- properties JSONB

### synonyms TABLE
- id SERIAL PRIMARY KEY
- entity_name VARCHAR(255) NOT NULL
- entity_type VARCHAR(50) NOT NULL
- synonym VARCHAR(255) NOT NULL
- confidence_score DECIMAL(3,2) DEFAULT 1.0 CHECK (confidence_score BETWEEN 0 AND 1)
- UNIQUE (entity_name, entity_type, synonym)

## COMPLETE WEBSOCKET IMPLEMENTATION DETAILS

### Socket Handler (backend/councilTerminal/socketHandler.js)
io.on('connection', (socket) => {
  console.log('Terminal connected:', socket.id);
  sessions.set(socket.id, {
    authenticated: false,
    user: null,
    context: {
      lastEntity: null,
      lastEntityType: null,
      lastQueryType: null,
      conversationTurns: 0,
      recentQueries: []
    },
    queryHistory: [],
    startTime: new Date()
  });

  socket.on('terminal-auth', async (data) => {
    const { username, password } = data;
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    if (result.rows[0] && result.rows[0].password_hash === password) {
      session.authenticated = true;
      session.user = {
        user_id: result.rows[0].user_id,
        username: result.rows[0].username,
        access_level: result.rows[0].access_level
      };
      socket.emit('auth-response', {
        success: true,
        message: 'ACCESS GRANTED',
        user: session.user
      });
    }
  });

  socket.on('terminal-command', async (data) => {
    const intent = await intentMatcher.match(data.command);
    const response = await queryEngine.executeQuery(intent);
    session.context.lastEntity = response.entityUsed;
    session.context.lastEntityType = response.entityType;
    session.context.lastQueryType = response.queryType;
    session.queryHistory.push({
      command: data.command,
      timestamp: new Date()
    });
    socket.emit('command-response', response);
  });

  socket.on('disconnect', () => {
    sessions.delete(socket.id);
    console.log('Terminal disconnected:', socket.id);
  });
});

## QUERY ENGINE IMPLEMENTATION (cotwQueryEngine.js)

### Main Query Executor
async executeQuery(intent) {
  switch(intent.type) {
    case 'WHO': return this.queryWho(intent.entity);
    case 'WHAT': return this.queryWhat(intent.entity);
    case 'WHERE': return this.queryWhere(intent.entity);
    case 'WHEN': return this.queryWhen(intent.entity);
    case 'WHY': return this.queryWhy(intent.entity);
    case 'HOW': return this.queryHow(intent.entity);
    case 'CAN': return this.queryCan(intent.entity);
    case 'SEARCH': return this.searchAll(intent.entity);
    case 'SHOW_IMAGE': return this.showImage(intent.entity);
    default: return { error: 'Unknown query type' };
  }
}

### Fuzzy Matching Configuration
const fuseOptions = {
  threshold: 0.4,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: ['name', 'title', 'description'],
  includeScore: true,
  includeMatches: true
};

### Relevance Scoring Algorithm
calculateRelevance(baseScore, factors) {
  let score = baseScore;
  if (factors.exactMatch) score = 175;
  else if (factors.fuzzyScore) score = Math.round((1 - factors.fuzzyScore) * 100);
  if (factors.isRelated) score = 30;
  if (factors.contextMatch) score += 50;
  return score;
}

## INTENT MATCHER PATTERNS (cotwIntentMatcher.js)

### Complete Pattern Set
const patterns = {
  WHO: [
    /^who is (.+?)$/i,
    /^who are the (.+?)$/i,
    /^tell me about (.+?)$/i,
    /^identify (.+?)$/i,
    /^show me (.+?)$/i
  ],
  WHAT: [
    /^what is (.+?)$/i,
    /^what are (.+?)$/i,
    /^define (.+?)$/i,
    /^explain (.+?)$/i,
    /^describe (.+?)$/i
  ],
  WHERE: [
    /^where is (.+?)$/i,
    /^where are (.+?)$/i,
    /^location of (.+?)$/i,
    /^find (.+?)$/i
  ],
  WHEN: [
    /^when did (.+?)$/i,
    /^when was (.+?)$/i,
    /^when will (.+?)$/i,
    /^what time (.+?)$/i
  ],
  WHY: [
    /^why did (.+?)$/i,
    /^why does (.+?)$/i,
    /^why is (.+?)$/i,
    /^reason for (.+?)$/i
  ],
  HOW: [
    /^how does (.+?)$/i,
    /^how to (.+?)$/i,
    /^how can (.+?)$/i,
    /^how did (.+?)$/i
  ],
  CAN: [
    /^can (.+?)$/i,
    /^could (.+?)$/i,
    /^is it possible to (.+?)$/i,
    /^able to (.+?)$/i
  ],
  SEARCH: [
    /^search for (.+?)$/i,
    /^search (.+?)$/i,
    /^find all (.+?)$/i,
    /^list all (.+?)$/i
  ]
};

### Entity Resolution Process
1. Check for pronouns and resolve from context
2. Direct database match attempt
3. Synonym expansion from synonyms table
4. Fuzzy matching using Fuse.js
5. Generate "did you mean" suggestions using Levenshtein distance
6. Return best match with confidence score

## HEX ID GENERATION SYSTEM (backend/utils/hexGenerator.js)

### ID Format Specification
Format: #XXYYYY
XX = Type prefix (2 hex chars)
YYYY = Sequential number (4 hex chars)

### Type Prefixes
const ID_PREFIXES = {
  character: '70',      // #70XXXX
  narrative: 'C0',      // #C0XXXX  
  location: 'C3',       // #C3XXXX
  asset: 'A0',          // #A0XXXX
  user: 'D0',           // #D0XXXX
  trait: 'T0',          // #T0XXXX
  theme: 'TH',          // #THXXXX
  object: 'OB',         // #OBXXXX
  event: 'E0'           // #E0XXXX
};

### Generator Function
async function generateHexId(type, pool) {
  const prefix = ID_PREFIXES[type];
  if (!prefix) throw new Error('Invalid entity type');
  
  const table = getTableForType(type);
  const idColumn = getIdColumnForType(type);
  
  const query = `SELECT ${idColumn} FROM ${table} 
                 WHERE ${idColumn} LIKE '#${prefix}%' 
                 ORDER BY ${idColumn} DESC LIMIT 1`;
  
  const result = await pool.query(query);
  
  if (result.rows.length === 0) {
    return `#${prefix}0000`;
  }
  
  const lastId = result.rows[0][idColumn];
  const lastNum = parseInt(lastId.slice(3), 16);
  const nextNum = lastNum + 1;
  
  if (nextNum > 0xFFFF) {
    throw new Error('ID space exhausted for type: ' + type);
  }
  
  return `#${prefix}${nextNum.toString(16).padStart(4, '0').toUpperCase()}`;
}

## COMPLETE FILE STRUCTURE

theexpanse/
├── server.js (Main Express + Socket.io server)
├── package.json (ES6 module configuration)
├── .env (Database credentials - NOT in git)
├── .gitignore
├── README.md
├── PROJECT_BRIEF_2025-11-01.md
├── TECHNICAL_BRIEF_2025-11-01.md
├── backend/
│   ├── councilTerminal/
│   │   ├── socketHandler.js (WebSocket event handling)
│   │   ├── cotwQueryEngine.js (Query processing logic)
│   │   ├── cotwIntentMatcher.js (Intent recognition)
│   │   └── commandProcessor.js (Command routing)
│   ├── utils/
│   │   ├── hexGenerator.js (ID generation)
│   │   ├── dbConnection.js (PostgreSQL connection pool)
│   │   ├── logger.js (Logging utility)
│   │   └── validators.js (Input validation)
│   ├── routes/
│   │   ├── lore.js (Lore endpoints)
│   │   ├── expanse.js (Expanse API)
│   │   ├── character.js (Character CRUD)
│   │   ├── narrative.js (Story management)
│   │   ├── auth.js (Authentication)
│   │   └── admin.js (TO BE CREATED)
│   └── systems/
│       ├── traitManager.js (Character traits)
│       ├── narrativeSystem.js (Story logic)
│       └── tseSystem.js (TSE pipeline)
├── public/
│   ├── dossier-login.html (Main login)
│   ├── dossier-login-websocket.html (WebSocket version)
│   ├── dossier-login.backup-before-fix.html
│   ├── terminal.html (Terminal interface)
│   ├── css/
│   │   └── terminal.css
│   └── js/
│       └── terminal.js
├── backups/
│   └── 2025-11-01-0530-fuzzy-enhancements/
│       ├── README.md
│       ├── cotwIntentMatcher.js
│       ├── cotwQueryEngine.js
│       └── socketHandler.js
├── test files/
│   ├── test-websocket-auth.js
│   ├── test-fuzzy-features.js
│   └── test-login.js
└── uploads/ (TO BE CREATED for images)

## NPM DEPENDENCIES

{
  "name": "theexpanse",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node test-fuzzy-features.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "socket.io-client": "^4.6.1",
    "pg": "^8.11.3",
    "pg-pool": "^3.6.1",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "fuse.js": "^7.0.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}

## ENVIRONMENT CONFIGURATION (.env)

DB_HOST=database-1.czqfxxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pizasukerutondb
DB_USER=pizasukeruton
DB_PASSWORD=[secured]
PORT=3000
NODE_ENV=development
JWT_SECRET=[to be generated]
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[for S3 uploads]
AWS_SECRET_ACCESS_KEY=[for S3 uploads]
S3_BUCKET_NAME=[for image storage]

## AUTHENTICATION & SESSION MANAGEMENT

### Terminal Authentication Flow
1. Client connects via WebSocket (socket.io)
2. Client emits 'terminal-auth' with {username, password}
3. Server queries users table (plain text password comparison - TO BE HASHED)
4. On success, creates session with hex user_id (#D0XXXX)
5. Session stores context for conversation continuity
6. All commands validated against session.authenticated

### Session Context Structure
{
  authenticated: boolean,
  user: {
    user_id: '#D00001',
    username: 'Cheese Fang',
    access_level: 5
  },
  context: {
    lastEntity: 'Piza Sukeruton',
    lastEntityType: 'character',
    lastQueryType: 'WHO',
    conversationTurns: 3,
    recentQueries: ['who is piza', 'what is he', 'where is he']
  },
  queryHistory: [
    {command: 'who is piza', timestamp: '2025-11-01T05:30:00Z'},
    {command: 'what is he', timestamp: '2025-11-01T05:30:15Z'}
  ],
  startTime: '2025-11-01T05:29:45Z'
}

## IMPLEMENTED FEATURES

### Fuzzy Logic & Intelligence
✅ Typo tolerance (Fuse.js threshold: 0.4)
✅ Case-insensitive matching throughout
✅ Partial name matching
✅ Synonym expansion from database
✅ Levenshtein distance for suggestions
✅ "Did you mean?" suggestions
✅ Context-aware pronoun resolution
✅ Multi-turn dialogue support
✅ Query history tracking (last 10)
✅ Relevance scoring (175% exact, variable fuzzy, 30% related)
✅ Related entity surfacing
✅ Dynamic help generation from database

### Terminal Commands
- help: Show dynamic help
- clear: Reset terminal
- status: System information
- history: Show query history
- logout: End session
- who/what/where/when/why/how queries
- search: Broad search
- show me: Display character

## TESTING SUITE

### Test WebSocket Authentication
node test-websocket-auth.js
// Tests: Connection, authentication, basic command

### Test Fuzzy Features
node test-fuzzy-features.js
// Tests: Typo handling, context, suggestions, ranking

### Manual Testing
1. Start server: npm start
2. Open browser: http://localhost:3000/dossier-login.html
3. Login: Cheese Fang / P1zz@P@rty@666
4. Test commands in terminal

### Database Testing
psql -h [rds-endpoint] -U pizasukeruton -d pizasukerutondb
\dt  -- List tables
SELECT * FROM characters LIMIT 5;
SELECT * FROM synonyms WHERE entity_name = 'Piza Sukeruton';

## KNOWN ISSUES & TODO

### Current Issues
1. "search" command treats whole phrase as entity name
   - Fix: Parse out "search" prefix before entity extraction
2. "what is" queries fail on narrative entities
   - Fix: Add narrative content to what queries
3. Location query result formatting inconsistent
   - Fix: Standardize location response format
4. Image display not implemented
   - Fix: Add image URL handling in response
5. Session cleanup incomplete on disconnect
   - Fix: Properly clear session data
6. Passwords stored as plain text
   - Fix: Implement bcrypt hashing

### Priority TODO List
1. Build admin authentication system
2. Create image upload system with S3
3. Implement character CRUD with hex IDs
4. Build story arc/timeline interface
5. Create relationship manager
6. Add content validation
7. Implement version control for narratives
8. Add audit logging

## ADMIN SYSTEM SPECIFICATIONS (TO BUILD)

### Requirements
1. Separate admin authentication (JWT tokens)
2. Role-based access control (admin, editor, viewer)
3. Character management:
   - Create with auto hex ID generation
   - Upload images to S3
   - Edit all fields
   - Manage relationships
   - Assign traits
4. Story management:
   - Create narrative segments
   - Timeline editor
   - Chapter organization
   - Event sequencing
5. Asset management:
   - Image upload/crop/resize
   - Video support
   - Audio clips
   - Document attachments
6. Content validation:
   - Hex ID format checking
   - Relationship integrity
   - Required field validation
   - Duplicate prevention

### Technical Stack for Admin
- Frontend: React or Vue.js
- State management: Redux/Vuex
- UI: Material-UI or Tailwind
- File handling: Multer + Sharp
- Storage: AWS S3
- Auth: JWT + bcrypt
- API: RESTful + GraphQL

## CRITICAL OPERATING PRINCIPLES

1. NO HARDCODED DATA - Everything from database
2. All IDs use hex color format (#XXYYYY)
3. ES6 modules only (import/export)
4. Mac-friendly EOF heredocs for file creation
5. No hashtag descriptions in executable commands
6. Create timestamped backups before changes
7. Test thoroughly before implementing
8. One task at a time approach
9. Best architectural solution over quickest
10. Maintain backwards compatibility

## GIT WORKFLOW

git add -A
git commit -m "Description of changes"
git push origin main

## BACKUP STRATEGY

Before major changes:
mkdir -p backups/$(date +%Y-%m-%d-%H%M)-description
cp -r backend/* backups/$(date +%Y-%m-%d-%H%M)-description/

## DEPLOYMENT NOTES

Currently local development only
Future: Deploy to AWS EC2/ECS
Database: Already on AWS RDS
Static files: Will use S3 + CloudFront
WebSocket: Consider AWS API Gateway WebSocket

## CONTACT & RESOURCES

Project Owner: pizasukeruton
Location: /Users/pizasukeruton/Desktop/theexpanse/
Database: pizasukerutondb on AWS RDS
Node Version: v24.3.0
Last Updated: November 1, 2025 - 5:56 AM AEST
