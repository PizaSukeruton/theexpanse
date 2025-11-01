# THE EXPANSE - COMPLETE PROJECT BLUEPRINT
Generated: November 1, 2025 - 5:30 PM AEST
Thread Continuation Document
Project Root: /Users/pizasukeruton/Desktop/theexpanse/

## PROJECT OVERVIEW
The Expanse is a narrative universe management system centered around Piza Sukeruton (Pizza Skeleton), featuring a WebSocket-based terminal interface, character management, and multiverse storytelling capabilities.

## CURRENT SYSTEM STATE (AS OF NOV 1, 2025 5:30 PM)

### WORKING FEATURES
✅ WebSocket terminal with authentication (dossier-login.html)
✅ Intent matching system (cotwIntentMatcher.js)
✅ Query engine with fuzzy logic (cotwQueryEngine.js)
✅ Hex ID generation system (#70XXXX for characters)
✅ PostgreSQL database on AWS RDS
✅ Basic admin panel (Cheese Fang login)
✅ Session management with context tracking
✅ Fuzzy matching with Fuse.js
✅ Dynamic help generation from database

### ISSUES TO FIX
❌ "show me an image" returns JSON instead of displaying image
❌ WHO queries too broad (shows mentions in descriptions)
❌ Intent manager needs image display logic
❌ Query engine queryShowImage function incomplete
❌ Password storage is plain text (needs bcrypt)

## COMPLETE DATABASE SCHEMA

### character_profiles TABLE (PRIMARY)
CREATE TABLE character_profiles (
    character_id VARCHAR(7) PRIMARY KEY CHECK (character_id ~ '^#70[0-9A-F]{4}$'),
    character_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    traits JSONB,
    trait_vector JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Current Categories:
- Protagonist
- Antagonist  
- Tanuki
- Council Of The Wise
- B-Roll Chaos
- Machines
- Angry Slice Of Pizza
- Mutai

### users TABLE
CREATE TABLE users (
    user_id VARCHAR(7) PRIMARY KEY CHECK (user_id ~ '^#D0[0-9A-F]{4}$'),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    access_level INTEGER DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Current Users:
- Cheese Fang / P1zz@P@rty@666 (Admin, access_level: 5)
- piza Sukeruton / P1zz@L0v3r@666 (User, access_level: 1)

### events TABLE
CREATE TABLE events (
    event_id VARCHAR(7) PRIMARY KEY CHECK (event_id ~ '^#E0[0-9A-F]{4}$'),
    event_name VARCHAR(255) NOT NULL,
    event_description TEXT,
    event_type VARCHAR(100),
    multiverse_id VARCHAR(50),
    timeline_position INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### narratives TABLE
CREATE TABLE narratives (
    narrative_id VARCHAR(7) PRIMARY KEY CHECK (narrative_id ~ '^#C0[0-9A-F]{4}$'),
    title VARCHAR(255),
    content TEXT,
    arc_id VARCHAR(7),
    sequence_number INTEGER,
    branching_points JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### knowledge_entries TABLE (AOK System)
CREATE TABLE knowledge_entries (
    entry_id VARCHAR(7) PRIMARY KEY CHECK (entry_id ~ '^#K0[0-9A-F]{4}$'),
    title VARCHAR(255),
    content TEXT,
    category VARCHAR(100),
    source_character VARCHAR(7) REFERENCES character_profiles(character_id),
    target_character VARCHAR(7) REFERENCES character_profiles(character_id),
    transfer_date TIMESTAMP,
    review_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### story_arcs TABLE
CREATE TABLE story_arcs (
    arc_id VARCHAR(7) PRIMARY KEY CHECK (arc_id ~ '^#AR[0-9A-F]{4}$'),
    arc_name VARCHAR(255),
    description TEXT,
    start_event VARCHAR(7) REFERENCES events(event_id),
    end_event VARCHAR(7) REFERENCES events(event_id),
    participants VARCHAR(7)[] ARRAY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### multimedia_assets TABLE
CREATE TABLE multimedia_assets (
    asset_id VARCHAR(7) PRIMARY KEY CHECK (asset_id ~ '^#A0[0-9A-F]{4}$'),
    asset_type VARCHAR(50),
    file_path VARCHAR(255),
    s3_url TEXT,
    associated_entity VARCHAR(7),
    entity_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

## FILE STRUCTURE WITH CURRENT STATE

theexpanse/
├── server.js (Express + Socket.io - WORKING)
├── package.json (ES6 modules - CONFIGURED)
├── .env (Database credentials - SECURED)
├── .gitignore (CONFIGURED)
│
├── backend/
│   ├── councilTerminal/
│   │   ├── socketHandler.js (WebSocket handling - WORKING)
│   │   ├── cotwQueryEngine.js (13KB - NEEDS FIX for images)
│   │   ├── cotwIntentMatcher.js (8KB - WORKING, needs expansion)
│   │   ├── cotwIntentMatcher.backup.js (3.8KB)
│   │   ├── cotwIntentMatcher.backup1.js (3.8KB)
│   │   ├── cotwIntentMatcher.messy.js (9.7KB)
│   │   ├── cotwQueryEngine.backup-20251101.js (13KB)
│   │   ├── cotwQueryEngine.backup.js (5.4KB)
│   │   └── commandProcessor.js (BASIC)
│   │
│   ├── expanse/
│   │   └── services/
│   │       └── intentEngine/
│   │           └── intentParser.js (BASIC parser)
│   │
│   ├── utils/
│   │   ├── hexGenerator.js (WORKING - generates #70XXXX IDs)
│   │   └── dbConnection.js (PostgreSQL pool - WORKING)
│   │
│   ├── routes/
│   │   ├── terminal.js (WebSocket route - WORKING)
│   │   ├── character.js (BASIC CRUD)
│   │   └── admin.js (TO BE CREATED)
│   │
│   └── systems/
│       └── (EMPTY - needs TSE, traits, narratives)
│
├── public/
│   ├── dossier-login.html (MAIN INTERFACE - WORKING)
│   ├── admin-panel.js (8.9KB - BASIC)
│   ├── admin-panel-v2.js (Copy of v1)
│   ├── admin-menu.js (CLEAN COLLAPSIBLE - CURRENT)
│   ├── css/
│   │   └── terminal.css (WORKING)
│   └── gallery/
│       └── (EMPTY - needs character images)
│
├── fix-image-query.js (CREATED but not applied)
└── test files/
    ├── test-websocket-auth.js (PASSING)
    └── test-fuzzy-features.js (10/10 PASSING)

## ADMIN PANEL STATUS

### Current Implementation (admin-menu.js)
- Clean collapsible accordion menu
- Activates when Cheese Fang logs in
- Sections: Characters, Events, Story Arcs, Narratives, Knowledge, Media, System
- Character view/create working (basic)
- Image editor with CRT effect (basic implementation)

### Admin Features Needed:
1. JWT authentication (currently using localStorage)
2. Full CRUD for all entities
3. Image upload to S3
4. Hex ID management interface
5. Relationship editor
6. Timeline visualization
7. Multiverse branching editor

## INTENT MANAGER FIXES NEEDED

### Problem 1: Image Display
Current: Returns JSON data
// CURRENT (BROKEN)
async queryShowImage(entity) {
  // Returns: { type: 'image', data: rows, count: 1 }
}

Fix Required:
// NEEDED FIX
async queryShowImage(entity) {
  // Should return: { type: 'image', image: '/gallery/pizzaskeleton.png', character: data }
}

### Problem 2: WHO Query Precision
Current: Shows any character with name in description
Fix: Prioritize exact matches, then partial name matches, then description mentions

### Problem 3: Missing Intent Types
Need to add:
- TELL_ME_ABOUT
- EXPLAIN
- DESCRIBE
- SHOW_IMAGE (separate from WHO)
- LIST_ALL
- TIMELINE
- MULTIVERSE

## API ENDPOINTS STATUS

### Working Endpoints:
- GET /api/characters (basic list)
- POST /api/admin/login (returns success but no JWT)
- WebSocket terminal-auth (plain text password)
- WebSocket terminal-command (processes queries)

### Needed Endpoints:
- POST /api/admin/characters (with hex ID generation)
- PUT /api/admin/characters/:id
- DELETE /api/admin/characters/:id
- POST /api/upload/image (S3 integration)
- GET /api/timeline/:multiverse_id
- POST /api/narratives/branch
- GET /api/knowledge/transfers
- POST /api/tse/evaluate

## WEBSOCKET MESSAGE FLOW

### Current Flow:
Client → 'terminal-auth' → Server validates → 'auth-response'
Client → 'terminal-command' → Intent Matcher → Query Engine → 'command-response'

### Session Context Structure:
{
  authenticated: true,
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
    recentQueries: []
  },
  queryHistory: []
}

## NPM DEPENDENCIES INSTALLED

{
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "socket.io-client": "^4.6.1",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "fuse.js": "^7.0.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  }
}

## ENVIRONMENT VARIABLES (.env)

DB_HOST=database-1.czqf[redacted].us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pizasukerutondb
DB_USER=postgres
DB_PASSWORD=[REDACTED]
JWT_SECRET=[TO BE SET]
AWS_ACCESS_KEY=[TO BE SET]
AWS_SECRET_KEY=[TO BE SET]
AWS_BUCKET_NAME=[TO BE SET]

## TERMINAL COMMANDS WORKING

who is [character name]
what is [entity]
when did [event]
where is [location]
why [reason query]
how [process query]
show me [entity]
show me an image of [character] (BROKEN - returns JSON)
help
clear
logout

## SAMPLE CHARACTER DATA IN DATABASE

#700000: Piza Sukeruton (Protagonist) - The Skeleton who loves Pizza
#700001: Pineaple Yurei (Antagonist) - Ghost villain
#700002: Claude The Tanuki (Tanuki) - Guide and Narrator
#700003: Frankie Trouble (Council Of The Wise) - Wu-Tang loving friend
#700004: Slicifer (Angry Slice Of Pizza) - Sentient pizza slice
#700005: Chuckles The Monkey (B-Roll Chaos) - Unpredictable trickster
#700006: Test Mutai Warrior (Mutai) - Test character

## SOCKET.IO CLIENT CONNECTION CODE (dossier-login.html)

const socket = io();
let loginState = "username";
let tempUsername = "";
let currentUser = null;

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('auth-response', (data) => {
  if (data.success) {
    addLine("SYSTEM: " + data.message, "granted");
    currentUser = data.user;
    localStorage.setItem("terminal_user", data.user.username);
    if (data.user.username === "Cheese Fang") {
      setTimeout(() => {
        if (typeof initAdminPanel === "function") {
          initAdminPanel();
        }
      }, 500);
    }
    loginState = "command";
    input.type = "text";
    input.placeholder = "> Enter command";
    input.value = "";
  } else {
    addLine("SYSTEM: " + data.message, "error");
    loginState = "username";
    input.type = "text";
    input.placeholder = "> Enter username";
    input.value = "";
    tempUsername = "";
  }
});

## SERVER.JS STRUCTURE

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import socketHandler from './backend/councilTerminal/socketHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

socketHandler(io);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

## SOCKET HANDLER STRUCTURE (socketHandler.js)

import pool from '../utils/dbConnection.js';
import IntentMatcher from './cotwIntentMatcher.js';
import QueryEngine from './cotwQueryEngine.js';

const sessions = new Map();

export default function socketHandler(io) {
  io.on('connection', (socket) => {
    const sessionId = socket.id;
    sessions.set(sessionId, {
      authenticated: false,
      user: null,
      context: {
        lastEntity: null,
        lastEntityType: null,
        lastQueryType: null,
        conversationTurns: 0,
        recentQueries: []
      },
      queryHistory: []
    });

    socket.on('terminal-auth', async (data) => {
      // Authentication logic
    });

    socket.on('terminal-command', async (data) => {
      // Command processing logic
    });

    socket.on('disconnect', () => {
      sessions.delete(sessionId);
    });
  });
}

## INTENT MATCHER CORE LOGIC

class IntentMatcher {
  constructor(context = {}) {
    this.context = context;
    this.synonyms = {
      'piza': ['pizza', 'piza sukeruton', 'pizza skeleton', 'skeleton'],
      'frankie': ['frankie trouble', 'trouble'],
      'claude': ['claude the tanuki', 'tanuki'],
      // ... more synonyms
    };
  }

  async matchIntent(input) {
    const normalized = input.toLowerCase().trim();
    
    // Pronoun resolution
    if (normalized.match(/^(show|tell|who|what|where|when|why|how)\s+(me\s+)?(it|that|them|this)$/i)) {
      if (this.context.lastEntity) {
        const resolvedInput = normalized.replace(/(it|that|them|this)/i, this.context.lastEntity);
        return this.matchIntent(resolvedInput);
      }
    }

    // Image detection
    if (normalized.match(/(?:show|display|see|view).*(?:picture|photo|image|pic|portrait|visual)/i)) {
      // Extract entity and return SHOW_IMAGE intent
    }

    // WHO/WHAT/WHEN/WHERE/WHY/HOW detection
    // ... rest of intent matching logic
  }
}

## QUERY ENGINE CORE STRUCTURE

class QueryEngine {
  async query(intentResult, context = {}) {
    const { type, entity } = intentResult;
    
    switch (type) {
      case 'WHO':
        result = await this.queryWho(entity);
        break;
      case 'SHOW_IMAGE':
        result = await this.queryShowImage(entity);
        break;
      // ... other cases
    }
    
    return result;
  }

  async queryWho(entity) {
    // Database query logic for characters
  }

  async queryShowImage(entity) {
    // BROKEN - needs to return image path not JSON
  }
}

## CRITICAL NEXT STEPS

1. Fix queryShowImage to return image paths
2. Improve WHO query precision (exact match priority)
3. Add bcrypt for password hashing
4. Create JWT authentication for admin
5. Build image upload system
6. Implement narrative branching
7. Create TSE pipeline
8. Add multiverse timeline management
9. Build knowledge transfer system
10. Create character trait editor

## TESTING CHECKLIST

[x] Terminal authentication works
[x] Basic WHO queries work (but too broad)
[x] Fuzzy matching works
[x] Context tracking works
[x] Admin panel displays for Cheese Fang
[ ] Images display in terminal
[ ] JWT authentication
[ ] File uploads
[ ] Narrative branching
[ ] Knowledge transfers

## KNOWN BUGS

1. "show me an image" returns JSON data instead of displaying image
2. WHO queries return characters that just mention the name in description
3. Passwords stored in plain text
4. No JWT token validation
5. Admin panel has no real backend integration
6. No image files in /public/gallery/
7. No S3 integration configured
8. Query engine doesn't handle multiverse queries

## TERMINAL UI STRUCTURE

Left Panel (dossier-panel):
- Shows character info when not admin
- Shows admin menu when Cheese Fang logs in

Right Panel (terminal):
- Green phosphor CRT effect
- Command input at bottom
- Scrolling output above

## COMPLETE PACKAGE.JSON

{
  "name": "theexpanse",
  "version": "1.0.0",
  "type": "module",
  "description": "The Expanse - Narrative Universe Management System",
  "main": "server.js",
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
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "fuse.js": "^7.0.0",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}

## END OF BLUEPRINT DOCUMENT
This document contains complete project state as of November 1, 2025 5:30 PM AEST
Use this to continue development in next thread
