import bcrypt from 'bcryptjs';
import { Server } from 'socket.io';
import pool from '../db/pool.js';
import cotwIntentMatcher from './cotwIntentMatcher.js';
import cotwQueryEngine from './cotwQueryEngine.js';
import generateHexId from '../utils/hexIdGenerator.js';

import initializeRegistrationSockets from './registrationSocketHandler.js';
export function initializeWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const sessions = new Map();

  initializeRegistrationSockets(io);

  io.on('connection', (socket) => {
    console.log(`🟢 Terminal connected: ${socket.id}`);
    
    socket.on('terminal-auth', async (data) => {
      console.log("Auth attempt:", data);
      try {
        const { username, password } = data;
        
        const result = await pool.query(
"SELECT user_id, username, access_level, password_hash, last_login FROM users WHERE username = $1",
          [username]
        );
        if (result.rows.length > 0 && await bcrypt.compare(password, result.rows[0].password_hash)) {
          const user = result.rows[0];
          
          
          await pool.query(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1",
            [user.user_id]
          );          sessions.set(socket.id, {
            id: user.user_id,
            username: user.username,
            accessLevel: user.access_level,
            queryHistory: [],
            context: {
              lastEntity: null,
              lastEntityType: null,
              lastQueryType: null,
              conversationTurns: 0
            }
          });
          
          socket.emit('auth-response', {
            success: true,
            user: user,
            message: 'ACCESS GRANTED'
          });
          
        } else {
          socket.emit('auth-response', {
            success: false,
            message: 'ACCESS DENIED'
          });
        }
      } catch (error) {
        console.error('Auth error:', error);
        socket.emit('auth-response', {
          success: false,
          message: 'SYSTEM ERROR'
        });
      }
    });

    socket.on('terminal-command', async (data) => {
      const session = sessions.get(socket.id);
      if (!session) {
        socket.emit('command-response', {
          error: 'NOT AUTHENTICATED'
        });
        return;
      }

      try {
        const { command } = data;
        const response = await processCommand(command, session);
        
        // Update session context
        if (response.entityUsed) {
          session.context.lastEntity = response.entityUsed;
          session.context.lastEntityType = response.entityType;
          session.context.lastQueryType = response.queryType;
          session.context.conversationTurns++;
        }
        
        // Store in query history
        if (session.queryHistory.length >= 10) {
          session.queryHistory.shift();
        }
        session.queryHistory.push({
          command,
          timestamp: Date.now(),
          entity: response.entityUsed
        });
        
        console.log("Command response:", response);
        socket.emit('command-response', response);
      } catch (error) {
        console.error('Command error:', error);
        socket.emit('command-response', {
          error: 'COMMAND FAILED'
        });
      }
    });

    // GIFT WIZARD HANDLERS
    socket.on("gift-wizard:get-realms", async (ack) => {
      const session = sessions.get(socket.id);
      if (!session) { ack?.({ success:false, error:"Not authenticated" }); return; }
      try {
        const r = await pool.query("SELECT DISTINCT realm FROM public.locations ORDER BY realm");
        const realms = r.rows.map(x => x.realm);
        ack?.({ success: true, realms });
        socket.emit("gift-wizard:realms", { success: true, realms });
      } catch (e) { 
        console.error("[GIFT-WIZARD] error:", e.message); 
        ack?.({ success:false, error:e.message }); 
        socket.emit("gift-wizard:error", { error: e.message }); 
      }
    });

    socket.on("gift-wizard:get-locations", async (data) => {
      const session = sessions.get(socket.id);
      if (!session) return;
      try {
        const r = await pool.query("SELECT location_id, name FROM public.locations WHERE realm = $1 ORDER BY name", [data.realm]);
        socket.emit("gift-wizard:locations", { success: true, locations: r.rows });
      } catch (e) { socket.emit("gift-wizard:error", { error: e.message }); }
    });

    socket.on("gift-wizard:get-characters", async (data) => {
      const session = sessions.get(socket.id);
      if (!session) return;
      try {
        const r = await pool.query("SELECT character_id, character_name, category FROM public.character_profiles WHERE category NOT IN ('Knowledge Entity') LIMIT 20");
        socket.emit("gift-wizard:characters", { success: true, characters: r.rows });
      } catch (e) { socket.emit("gift-wizard:error", { error: e.message }); }
    });

    socket.on("gift-wizard:get-givers-only", async (data) => {
      const session = sessions.get(socket.id);
      if (!session) return;
      try {
        const r = await pool.query("SELECT DISTINCT cp.character_id, cp.character_name, cp.category FROM character_profiles cp JOIN character_inventory ci ON cp.character_id = ci.character_id WHERE cp.category NOT IN ('Knowledge Entity') ORDER BY cp.character_name");
        socket.emit("gift-wizard:givers-only", { success: true, characters: r.rows });
      } catch (e) { socket.emit("gift-wizard:error", { error: e.message }); }
    });

    socket.on("gift-wizard:get-giver-inventory", async (data) => {
      const session = sessions.get(socket.id);
      if (!session) return;
      try {
        const r = await pool.query("SELECT ci.inventory_entry_id, ci.object_id, o.object_name, o.object_type, o.rarity FROM character_inventory ci JOIN objects o ON ci.object_id = o.object_id WHERE ci.character_id = $1", [data.giver_id]);
        socket.emit("gift-wizard:giver-inventory", { success: true, items: r.rows });
      } catch (e) { socket.emit("gift-wizard:error", { error: e.message }); }
    });

    socket.on("gift-wizard:create-event", async (data) => {
      const session = sessions.get(socket.id);
      if (!session) return socket.emit("gift-wizard:error", { error: "Not authenticated" });
      try {
        const eventId = await generateHexId("multiverse_event_id");
        const r = await pool.query("INSERT INTO public.multiverse_events (event_id, realm, location, event_type, involved_characters, outcome, timestamp, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *", [eventId, data.realm, data.location?.name || 'Unknown', "gift_exchange", JSON.stringify({giver: data.giver_id, receiver: data.receiver_id}), data.outcome, new Date().toISOString(), data.notes]);
        socket.emit("gift-wizard:event-created", { success: true, event: r.rows[0] });
      } catch (e) { socket.emit("gift-wizard:error", { error: e.message }); }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Terminal disconnected: ${socket.id}`);
      sessions.delete(socket.id);
    });
  });

  console.log('🔌 WebSocket server initialized');
  return io;
}

async function processCommand(command, session) {
  const cmd = command.toLowerCase().trim();
  
  if (cmd === 'help') {
    return await generateHelpResponse(session);
  }
  
  if (cmd === 'status') {
    return {
      output: `System Status: OPERATIONAL
User: ${session.username}
Access Level: ${session.accessLevel}
Queries This Session: ${session.context.conversationTurns}`
    };
  }
  
  if (cmd === 'clear') {
    // Reset context on clear
    session.context.lastEntity = null;
    session.context.lastEntityType = null;
    session.context.lastQueryType = null;
    return { clear: true };
  }
  
  if (cmd === 'history') {
    const recentQueries = session.queryHistory
      .slice(-5)
      .map((q, i) => `  ${i+1}. ${q.command}`)
      .join('\n');
    return {
      output: `Recent Queries:\n${recentQueries || '  No recent queries'}`
    };
  }
  
  // Use the intent matcher with context
  const intent = await cotwIntentMatcher.matchIntent(command, session.context);
  
  if (intent.confidence > 0.6) {
    const result = await cotwQueryEngine.executeQuery(intent);
    
    if (result.error) {
      return { output: `ERROR: ${result.error}` };
    }
    
    if (result.count === 0) {
      let output = `No data found for: "${intent.entity}"\n`;
      
      // Add suggestions if available
      if (result.suggestions && result.suggestions.length > 0) {
        output += `\nDid you mean:\n`;
        result.suggestions.forEach(s => {
          output += `  • ${s}\n`;
        });
      }
      
      // Add helpful message
      if (result.helpfulMessage) {
        output += `\n${result.helpfulMessage}`;
      }
      
      return { output };
    }
    
    // Format successful output
    let output = formatQueryResponse(intent, result);
    
    // Add related entities if available
    if (result.relatedEntities && result.relatedEntities.length > 0) {
      output += `\nRelated:\n`;
      result.relatedEntities.forEach(r => {
        output += `  • ${r.name}\n`;
      });
    }
    
    // Track entity for context
    const response = { 
      output,
      image: result.image,
      entityUsed: intent.entity,
      entityType: result.type,
      queryType: intent.type
    };
    
    if (intent.contextUsed) {
      response.contextNote = '[Context from previous query used]';
    }
    
    return response;
  }
  
  // Low confidence - suggest alternatives
  return {
    output: `I'm not sure what you're asking about "${command}".
    
Try queries like:
  • who is [character name]
  • what is [concept]
  • when did [event]
  • where is [location]
  • why did ...
  • how does ...
  • search [any term]
  
Type 'help' for more examples.`
  };
}

function formatQueryResponse(intent, result) {
  let output = `[${intent.type} QUERY: ${intent.entity}]\n`;
  
  // Add context note if applicable
  if (intent.contextUsed) {
    output = `[Using context from previous query]\n` + output;
  }
  
  // Add suggestions note if fuzzy match was used
  if (intent.suggestions && intent.suggestions.length > 0) {
    output += `[Showing results for: ${intent.entity}]\n`;
    output += `Other suggestions: ${intent.suggestions.slice(1).join(', ')}\n\n`;
  }
  
  output += `Found ${result.count} result(s)\n\n`;
  
  result.data.slice(0, 3).forEach((item, i) => {
    output += `[${i+1}] `;
    
    if (result.type === 'characters') {
      output += `${item.character_name} (${item.character_id})\n`;
      output += `   Category: ${item.category || 'Unknown'}\n`;
      output += `   ${item.description || 'No description available'}\n`;
      if (item.relevanceScore) {
        output += `   Relevance: ${Math.round(item.relevanceScore)}%\n`;
      }
    } else if (result.type === 'knowledge') {
      output += `${item.concept || 'Knowledge Item'}\n`;
      if (item.domain_name) {
        output += `   Domain: ${item.domain_name}\n`;
      }
      const content = item.content || '';
      output += `   ${content.substring(0, 150)}${content.length > 150 ? '...' : ''}\n`;
      if (item.relevanceScore) {
        output += `   Relevance: ${Math.round(item.relevanceScore)}%\n`;
      }
    } else if (result.type === 'narrative') {
      output += `${item.title || 'Narrative Segment'}\n`;
      const content = item.content || '';
      output += `   ${content.substring(0, 150)}${content.length > 150 ? '...' : ''}\n`;
      if (item.segment_type) {
        output += `   Type: ${item.segment_type}\n`;
      }
    } else if (result.type === 'events') {
      output += `${item.event_type || 'Event'} (${item.event_id})\n`;
      if (item.timestamp) {
        output += `   Time: ${new Date(item.timestamp).toLocaleString()}\n`;
      }
      if (item.realm) {
        output += `   Realm: ${item.realm}\n`;
      }
      const notes = item.notes || '';
      output += `   ${notes.substring(0, 150)}${notes.length > 150 ? '...' : ''}\n`;
    } else if (result.type === 'search_results') {
      output += `[${item.source_type}] ${item.title || item.id}\n`;
      const content = item.content || '';
      output += `   ${content.substring(0, 150)}${content.length > 150 ? '...' : ''}\n`;
      if (item.relevanceScore) {
        output += `   Relevance: ${Math.round(item.relevanceScore)}%\n`;
      }
    } else {
      // Generic fallback
      const str = JSON.stringify(item, null, 2);
      output += str.substring(0, 200) + (str.length > 200 ? '...' : '') + '\n';
    }
    output += '\n';
  });
  
  if (result.count > 3) {
    output += `[${result.count - 3} more results not shown]\n`;
  }
  
  return output;
}

async function generateHelpResponse(session) {
  // Get some example entities from database for dynamic help
  const exampleQuery = `
    SELECT 
      (SELECT character_name FROM character_profiles LIMIT 1) as example_character,
      (SELECT concept FROM knowledge_items WHERE concept IS NOT NULL LIMIT 1) as example_concept,
      (SELECT event_type FROM multiverse_events LIMIT 1) as example_event
  `;
  
  let examples = { 
    example_character: '[character]',
    example_concept: '[concept]',
    example_event: '[event]'
  };
  
  try {
    const result = await pool.query(exampleQuery);
    if (result.rows.length > 0) {
      examples = result.rows[0];
    }
  } catch (error) {
    console.error('Failed to get help examples:', error);
  }
  
  let helpText = `==== COUNCIL TERMINAL HELP ====

Query Examples:
- who is ...
- what is ...
- when did ...
- where is ...
- why did ...
- how does ...
- search ...
- show me ...

Commands:
- help      : Show this guide
- clear     : Reset terminal
- status    : Show system info
- history   : Recent queries
- logout    : End session

Tips:
- I remember context, so you can ask follow-up questions
- Try different phrasings if you don't get results
- Use 'search' for broad queries`;

  if (session.queryHistory.length > 0) {
    helpText += `\n\nYour last query: ${session.queryHistory[session.queryHistory.length - 1].command}`;
  }

  if (session.context.lastEntity) {
    helpText += `\nCurrent context: ${session.context.lastEntity}`;
  }

  helpText += '\n================================';

  return { output: helpText };
}

export default initializeWebSocket;
