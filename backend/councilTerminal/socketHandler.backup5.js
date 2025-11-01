import { Server } from 'socket.io';
import pool from '../db/pool.js';
import cotwIntentMatcher from './cotwIntentMatcher.js';
import cotwQueryEngine from './cotwQueryEngine.js';

export function initializeWebSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  const sessions = new Map();

  io.on('connection', (socket) => {
    console.log(`🟢 Terminal connected: ${socket.id}`);
    
    socket.on('terminal-auth', async (data) => {
      console.log("Auth attempt:", data);
      try {
        const { username, password } = data;
        
        const result = await pool.query(
          'SELECT user_id, username, access_level FROM users WHERE username = $1 AND password_hash = $2',
          [username, password]
        );
        
        if (result.rows.length > 0) {
          const user = result.rows[0];
          
          sessions.set(socket.id, {
            id: user.user_id,
            username: user.username,
            accessLevel: user.access_level
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
        console.log("Command response:", response);
        socket.emit('command-response', response);
      } catch (error) {
        console.error('Command error:', error);
        socket.emit('command-response', {
          error: 'COMMAND FAILED'
        });
      }
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
    return {
      output: `Available commands:
- help: Show this message
- status: Show system status
- who is [name]: Query character dossier
- what is [concept]: Query knowledge base
- when did [event]: Query timeline
- where is [location]: Query locations
- why [reason]: Query causality
- how [process]: Query methods
- search [term]: Comprehensive search
- clear: Clear terminal`
    };
  }
  
  if (cmd === 'status') {
    return {
      output: `System Status: OPERATIONAL
User: ${session.username}
Access Level: ${session.accessLevel}`
    };
  }
  
  if (cmd === 'clear') {
    return { clear: true };
  }
  
  // Legacy "who is" handler for backward compatibility
  if (cmd.startsWith('who is ')) {
    const name = command.substring(7).trim();
    try {
      const result = await pool.query(
        'SELECT * FROM character_profiles WHERE LOWER(character_name) = LOWER($1)',
        [name]
      );
      
      if (result.rows.length > 0) {
        const character = result.rows[0];
        
        return {
          output: `[CLASSIFIED DOSSIER]
Name: ${character.character_name}
ID: ${character.character_id}
Category: ${character.category || 'UNKNOWN'}
Description: ${character.description || 'CLASSIFIED'}`,
          image: character.image_url
        };
      }
    } catch (error) {
      console.error('Query error:', error);
    }
  }
  
  // Use the COTW intent matcher for intelligent queries
  const intent = cotwIntentMatcher.matchIntent(command);
  
  if (intent.confidence > 0.6) {
    const result = await cotwQueryEngine.executeQuery(intent);
    
    if (result.error) {
      return { output: `ERROR: ${result.error}` };
    }
    
    if (result.count === 0) {
      return { output: `No data found for: "${intent.entity}"` };
    }
    
    // Format output based on result type
    let output = `[${intent.type} QUERY: ${intent.entity}]\n`;
    output += `Found ${result.count} result(s)\n\n`;
    
    result.data.slice(0, 3).forEach((item, i) => {
      output += `[${i+1}] `;
      if (result.type === 'characters') {
        output += `${item.character_name} (${item.character_id})\n`;
        output += `   ${item.description || 'No description available'}\n`;
        // Return first character's image if available
        if (i === 0 && item.image_url) {
          result.image = item.image_url;
        }
      } else if (result.type === 'knowledge') {
        output += `${item.concept || 'Knowledge Item'}\n`;
        const content = item.content || '';
        output += `   ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n`;
      } else if (result.type === 'search_results') {
        output += `[${item.source_type}] ${item.title || item.id}\n`;
        const content = item.content || '';
        output += `   ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}\n`;
      } else {
        // Generic fallback
        output += JSON.stringify(item, null, 2).substring(0, 150) + '...\n';
      }
      output += '\n';
    });
    
    return { 
      output,
      image: result.image
    };
  }
  
  return { output: `Unknown command: ${command}` };
}

export default initializeWebSocket;
