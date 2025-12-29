import bcrypt from 'bcryptjs';
import { Server } from 'socket.io';
import pool from '../db/pool.js';
import cotwIntentMatcher from './cotwIntentMatcher.js';
import cotwQueryEngine from './cotwQueryEngine.js';
import generateHexId from '../utils/hexIdGenerator.js';
import { initializeRegistrationSockets } from './registrationSocketHandler.js';

function wrapSessionMiddleware(middleware) {
  return (socket, next) => middleware(socket.request, {}, next);
}

export default function initializeWebSocket(httpServer, sessionMiddleware) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
      credentials: true
    }
  });

  const publicIo = io.of('/public');
  initializeRegistrationSockets(publicIo);
  publicIo.on('connection', (socket) => {
    console.log('🟢 /public socket connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('🔴 /public socket disconnected:', socket.id);
    });
  });

  const terminalIo = io.of('/terminal');
  terminalIo.use(wrapSessionMiddleware(sessionMiddleware));
  terminalIo.use((socket, next) => {
    const sess = socket.request.session;
    if (!sess || !sess.userId) {
      return next(new Error('Unauthorized'));
    }
    socket.userId = sess.userId;
    socket.username = sess.username;
    socket.accessLevel = sess.accessLevel;
    next();
  });

  terminalIo.on('connection', (socket) => {
    console.log('🟢 /terminal socket connected for', socket.username, 'lvl', socket.accessLevel);

    socket.on('terminal-command', async (data) => {
      if (!socket.userId) {
        socket.emit('command-response', {
          error: 'NOT AUTHENTICATED'
        });
        return;
      }

      const session = {
        id: socket.userId,
        username: socket.username,
        accessLevel: socket.accessLevel,
        queryHistory: socket.queryHistory || [],
        context: socket.context || {
          lastEntity: null,
          lastEntityType: null,
          lastQueryType: null,
          conversationTurns: 0
        }
      };

      try {
        const { command } = data;
        const response = await processCommand(command, session);

        if (response.entityUsed) {
          if (!socket.context) socket.context = {};
          socket.context.lastEntity = response.entityUsed;
          socket.context.lastEntityType = response.entityType;
          socket.context.lastQueryType = response.queryType;
          socket.context.conversationTurns = (socket.context.conversationTurns || 0) + 1;
        }

        if (!socket.queryHistory) socket.queryHistory = [];
        if (socket.queryHistory.length >= 10) {
          socket.queryHistory.shift();
        }
        socket.queryHistory.push({
          command,
          timestamp: Date.now(),
          entity: response.entityUsed
        });

        // Get character profile image if available
        if (response.characterId) {
          try {
            const profileResult = await pool.query(
              'SELECT image_url FROM character_profiles WHERE character_id = $1',
              [response.characterId]
            );
            if (profileResult.rows[0]?.image_url) {
              response.profileImage = profileResult.rows[0].image_url;
            }
          } catch (err) {
            console.log('Profile image lookup failed:', err.message);
          }
        }

        console.log('Command response:', response);
        socket.emit('command-response', response);
      } catch (error) {
        console.error('Command error:', error);
        socket.emit('command-response', {
          error: 'COMMAND FAILED'
        });
      }
    });

    socket.on('gift-wizard:get-realms', async (ack) => {
      if (!socket.userId) { ack?.({ success: false, error: 'Not authenticated' }); return; }
      try {
        const r = await pool.query('SELECT DISTINCT realm FROM public.locations ORDER BY realm');
        const realms = r.rows.map(x => x.realm);
        ack?.({ success: true, realms });
        socket.emit('gift-wizard:realms', { success: true, realms });
      } catch (e) {
        console.error('[GIFT-WIZARD] error:', e.message);
        ack?.({ success: false, error: e.message });
        socket.emit('gift-wizard:error', { error: e.message });
      }
    });

    socket.on('gift-wizard:get-locations', async (data) => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          'SELECT location_id, name FROM public.locations WHERE realm = $1 ORDER BY name',
          [data.realm]
        );
        socket.emit('gift-wizard:locations', { success: true, locations: r.rows });
      } catch (e) {
        socket.emit('gift-wizard:error', { error: e.message });
      }
    });

    socket.on('gift-wizard:get-characters', async () => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          "SELECT character_id, character_name, category FROM public.character_profiles WHERE category NOT IN ('Knowledge Entity') LIMIT 20"
        );
        socket.emit('gift-wizard:characters', { success: true, characters: r.rows });
      } catch (e) {
        socket.emit('gift-wizard:error', { error: e.message });
      }
    });

    socket.on('gift-wizard:get-givers-only', async () => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          "SELECT DISTINCT cp.character_id, cp.character_name, cp.category FROM character_profiles cp JOIN character_inventory ci ON cp.character_id = ci.character_id WHERE cp.category NOT IN ('Knowledge Entity') ORDER BY cp.character_name"
        );
        socket.emit('gift-wizard:givers-only', { success: true, characters: r.rows });
      } catch (e) {
        socket.emit('gift-wizard:error', { error: e.message });
      }
    });

    socket.on('gift-wizard:get-giver-inventory', async (data) => {
      if (!socket.userId) return;
      try {
        const r = await pool.query(
          'SELECT ci.inventory_entry_id, ci.object_id, o.object_name, o.object_type, o.rarity FROM character_inventory ci JOIN objects o ON ci.object_id = o.object_id WHERE ci.character_id = $1',
          [data.giver_id]
        );
        socket.emit('gift-wizard:giver-inventory', { success: true, items: r.rows });
      } catch (e) {
        socket.emit('gift-wizard:error', { error: e.message });
      }
    });

    socket.on('gift-wizard:create-event', async (data) => {
      if (!socket.userId) return socket.emit('gift-wizard:error', { error: 'Not authenticated' });
      try {
        const eventId = await generateHexId('multiverse_event_id');
        const r = await pool.query(
          'INSERT INTO public.multiverse_events (event_id, realm, location, event_type, involved_characters, outcome, timestamp, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
          [
            eventId,
            data.realm,
            data.location?.name || 'Unknown',
            'gift_exchange',
            JSON.stringify({ giver: data.giver_id, receiver: data.receiver_id }),
            data.outcome,
            new Date().toISOString(),
            data.notes
          ]
        );
        socket.emit('gift-wizard:event-created', { success: true, event: r.rows[0] });
      } catch (e) {
        socket.emit('gift-wizard:error', { error: e.message });
      }
    });

    socket.on('menu-wizard:create-button', async (data, ack) => {
      if (!socket.userId) {
        ack?.({ success: false, error: 'Not authenticated' });
        return;
      }
      if (socket.accessLevel !== 11) {
        ack?.({ success: false, error: 'Unauthorized - God Mode required' });
        return;
      }
      try {
        const menuId = await generateHexId('wizard_guide_id');
        await pool.query(
          'INSERT INTO menu_configurations (menu_id, access_level, button_label, button_order, created_by) VALUES ($1, $2, $3, $4, $5)',
          [menuId, data.access_level, data.button_label, data.button_order, socket.userId]
        );
        ack?.({ success: true, menu_id: menuId });
      } catch (e) {
        console.error('menu-wizard:create-button error:', e.message);
        ack?.({ success: false, error: e.message });
      }
    });

    socket.on('menu:fetch', async (data, ack) => {
      if (!socket.userId) {
        ack?.({ success: false, error: 'Not authenticated' });
        return;
      }
      try {
        const result = await pool.query(
          'SELECT menu_id, button_label, button_order, active FROM menu_configurations WHERE access_level = $1 AND active = true ORDER BY button_order ASC',
          [data.access_level]
        );
        ack?.({ success: true, buttons: result.rows });
      } catch (e) {
        console.error('menu:fetch error:', e.message);
        ack?.({ success: false, error: e.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 /terminal socket disconnected', socket.username);
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
    session.context.lastEntity = null;
    session.context.lastEntityType = null;
    session.context.lastQueryType = null;
    return { clear: true };
  }

  if (cmd === 'history') {
    const recentQueries = session.queryHistory
      .slice(-5)
      .map((q, i) => `  ${i + 1}. ${q.command}`)
      .join('\n');
    return {
      output: `Recent Queries:\n${recentQueries || '  No recent queries'}`
    };
  }

  const user = {
    user_id: session.id,
    access_level: session.accessLevel,
    username: session.username
  };

  const intent = await cotwIntentMatcher.matchIntent(command, session.context, user);
  console.log('[DEBUG] Intent object RIGHT AFTER matchIntent:', JSON.stringify(intent, null, 2));

  if (session.accessLevel < 11) {
    if (intent.entityData) {
      const result = await cotwQueryEngine.executeQuery(intent, user);
      if (result.success) {
        return {
          output: result.message,
          entityUsed: intent.entityData.entity_name,
          entityType: intent.entityData.entity_type,
          queryType: intent.type
        };
      }
    }

    if (intent.searchResult && intent.searchResult.entity && intent.searchResult.action === 'clarify') {
      const result = await cotwQueryEngine.executeQuery(
        { ...intent, entityData: intent.searchResult.entity },
        user
      );
      if (result.success) {
        return {
          output: result.message,
          entityUsed: intent.searchResult.entity.entity_name,
          entityType: intent.searchResult.entity.entity_type,
          queryType: intent.type
        };
      }
    }

    if (intent.confirmation === 'affirmed' && intent.contextUsed) {
      const lastEntity = session.context.lastEntity;
      const lastQueryType = session.context.lastQueryType || intent.type;

      if (lastEntity) {
        const reconstructed = lastQueryType.toLowerCase() + ' is ' + lastEntity;
        console.log('[DEBUG] Rewriting confirmation to:', reconstructed);
        return await processCommand(reconstructed, session);
      }
    }

    if (intent.confidence > 0.6) {
      const result = await cotwQueryEngine.executeQuery(intent, user);
      if (result.success) {
        return {
          output: result.message,
          entityUsed: intent.entity,
          entityType: result.type,
          queryType: intent.type
        };
      }
    }

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

  if (session.accessLevel === 11) {
    let debugOutput = `=== INTENT ANALYSIS ===
Matcher: cotwIntentMatcher
Type: ${intent.type}
Entity: ${intent.entity}
Confidence: ${intent.confidence.toFixed(2)}
Original Query: "${intent.original}"
Realm: ${intent.realm}
Context Used: ${intent.contextUsed ? 'Yes' : 'No'}
`;

    if (intent.searchResult) {
      debugOutput += `Search Action: ${intent.searchResult.action}\n`;
      if (typeof intent.searchResult.confidence === 'number') {
        debugOutput += `Search Confidence: ${intent.searchResult.confidence.toFixed(2)}\n`;
      }
    }

    console.log('[DEBUG] Intent object BEFORE godModeSearch check:', JSON.stringify(intent, null, 2));
    console.log('[DEBUG] Has godModeSearch?', !!intent.godModeSearch);

    if (!intent.godModeSearch) {
      debugOutput += '\n⚠️ WARNING: God Mode search data missing for Level 11\n';
      debugOutput += 'Attempting normal search fallback...\n\n';
    } else {
      console.log('[DEBUG] ENTERING GOD MODE DISPLAY SECTION');
      debugOutput += `\n\n${'='.repeat(60)}\n\n=== THREE-TIER SEARCH RESULTS ===\n`;
      debugOutput += `Query: "${intent.godModeSearch.query}"\n`;
      debugOutput += `Total Latency: ${intent.godModeSearch.total_latency_ms}ms\n\n`;

      debugOutput += `TIER 1: EXACT MATCH (${intent.godModeSearch.tier1_latency_ms}ms)\n`;
      if (intent.godModeSearch.tier1 && intent.godModeSearch.tier1.count > 0) {
        debugOutput += `  Found: ${intent.godModeSearch.tier1.count} match(es)\n`;
        debugOutput += `  Method: ${intent.godModeSearch.tier1.method}\n`;
        debugOutput += `  Confidence: ${Number(intent.godModeSearch.tier1.confidence).toFixed(2)}\n`;
        intent.godModeSearch.tier1.matches.forEach(m => {
          debugOutput += `    - ${m.entity_name} (${m.entity_type}) [${m.entity_id}]\n`;
        });
      } else {
        debugOutput += '  No match\n';
      }
      debugOutput += '\n';

      debugOutput += `TIER 2: PHONETIC MATCH (${intent.godModeSearch.tier2_latency_ms}ms)\n`;
      if (intent.godModeSearch.tier2 && intent.godModeSearch.tier2.count > 0) {
        debugOutput += `  Found: ${intent.godModeSearch.tier2.count} match(es)\n`;
        debugOutput += `  Method: ${intent.godModeSearch.tier2.method}\n`;
        debugOutput += `  Confidence: ${Number(intent.godModeSearch.tier2.confidence || 0).toFixed(2)}\n`;
        intent.godModeSearch.tier2.matches.forEach(m => {
          debugOutput += `    - ${m.entity_name} (${m.entity_type}) [${m.entity_id}]\n`;
        });
      } else {
        debugOutput += '  No match\n';
      }
      debugOutput += '\n';

      debugOutput += `TIER 3: FUZZY MATCH (${intent.godModeSearch.tier3_latency_ms}ms)\n`;
      if (intent.godModeSearch.tier3 && intent.godModeSearch.tier3.count > 0) {
        debugOutput += `  Found: ${intent.godModeSearch.tier3.count} match(es)\n`;
        debugOutput += `  Method: ${intent.godModeSearch.tier3.method}\n`;
        debugOutput += `  Confidence: ${Number(intent.godModeSearch.tier3.confidence || 0).toFixed(2)}\n`;
        intent.godModeSearch.tier3.matches.forEach(m => {
          debugOutput += `    - ${m.entity_name} (${m.entity_type}) [${m.entity_id}]\n`;
        });
      } else {
        debugOutput += '  No match\n';
      }

      debugOutput += `\n\n${'='.repeat(60)}\n\n=== DETAILED QUERY RESULTS ===\n`;

      const tiersToQuery = [
        { tier: intent.godModeSearch.tier1, name: 'TIER 1' },
        { tier: intent.godModeSearch.tier2, name: 'TIER 2' },
        { tier: intent.godModeSearch.tier3, name: 'TIER 3' }
      ];

      for (const { tier, name } of tiersToQuery) {
        if (tier && tier.count > 0) {
          debugOutput += `\n--- ${name} DETAILED RESULT ---\n`;
          const tierEntity = tier.matches[0];
          const tierIntent = {
            type: intent.type,
            entity: tierEntity.entity_name,
            entityData: tierEntity,
            realm: intent.realm,
            original: intent.original
          };
          try {
            const tierResult = await cotwQueryEngine.executeQuery(tierIntent, user);
            console.log(`[GOD MODE] ${name} full result:`, JSON.stringify(tierResult, null, 2));
            if (!tierResult.success) {
              debugOutput += `ERROR: ${tierResult.message}\n`;
            } else {
              debugOutput += `${tierResult.message}\n\n`;
              if (tierResult.data) {
                debugOutput += `Entity ID: ${tierResult.data.entity_id}\n`;
                debugOutput += `Type: ${tierResult.data.entity_type}\n`;
                debugOutput += `Category: ${tierResult.data.category}\n`;
                if (tierResult.data.search_context) {
                  debugOutput += `Context: ${tierResult.data.search_context}\n`;
                }
              }
            }
          } catch (err) {
            debugOutput += `ERROR executing ${name} query: ${err.message}\n`;
          }
          debugOutput += `\n${'='.repeat(60)}\n`;
        }
      }

      debugOutput += `\n\n${'='.repeat(60)}\n`;
      debugOutput += `\n\n${"=".repeat(60)}\n`;
      debugOutput += "\n=== WHAT USERS WOULD SEE ===\n\n";
      
      // Generate the actual user response
      const bestMatch = intent.godModeSearch.tier1?.matches[0] || 
                       intent.godModeSearch.tier2?.matches[0] || 
                       intent.godModeSearch.tier3?.matches[0];
      
      if (bestMatch) {
        const userIntent = {
          type: intent.type,
          entity: bestMatch.entity_name,
          entityData: bestMatch,
          realm: intent.realm,
          original: intent.original
        };
        
        try {
          const userResult = await cotwQueryEngine.executeQuery(userIntent, user);
          if (userResult.success) {
            debugOutput += "--- USER MODE ---\n";
            debugOutput += `${userResult.message}\n`;
          } else {
            debugOutput += "--- USER MODE ---\n";
            debugOutput += `No information found for: ${intent.entity}\n`;
          }
        } catch (err) {
          debugOutput += "--- USER MODE ---\n";
          debugOutput += `Error generating user response: ${err.message}\n`;
        }
      } else {
        debugOutput += "--- USER MODE ---\n";
        debugOutput += `No matches found for: ${intent.entity}\n`;
      }
      
      debugOutput += `\n${"=".repeat(60)}\n`;    }

    return { output: debugOutput };
  }

  const result = await cotwQueryEngine.executeQuery(intent, user);

  if (result.error) {
    return { output: `ERROR: ${result.error}` };
  }

  if (result.count === 0) {
    let output = `No data found for: "${intent.entity}"\n`;

    if (result.suggestions && result.suggestions.length > 0) {
      output += '\nDid you mean:\n';
      result.suggestions.forEach(s => {
        output += `  • ${s}\n`;
      });
    }

    if (result.helpfulMessage) {
      output += `\n${result.helpfulMessage}`;
    }

    return { output };
  }

  let output = formatQueryResponse(intent, result);

  if (result.relatedEntities && result.relatedEntities.length > 0) {
    output += '\nRelated:\n';
    result.relatedEntities.forEach(r => {
      output += `  • ${r.name}\n`;
    });
  }

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

function formatQueryResponse(intent, result) {
  let output = `[${intent.type} QUERY: ${intent.entity}]\n`;

  if (intent.contextUsed) {
    output = '[Using context from previous query]\n' + output;
  }

  if (intent.suggestions && intent.suggestions.length > 0) {
    output += `[Showing results for: ${intent.entity}]\n`;
    output += `Other suggestions: ${intent.suggestions.slice(1).join(', ')}\n\n`;
  }

  const dataArray = Array.isArray(result.data)
    ? result.data
    : (result.data ? [result.data] : []);

  const totalCount = typeof result.count === 'number'
    ? result.count
    : dataArray.length;

  output += `Found ${totalCount} result(s)\n\n`;

  dataArray.slice(0, 3).forEach((item, i) => {
    output += `[${i + 1}] `;

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
