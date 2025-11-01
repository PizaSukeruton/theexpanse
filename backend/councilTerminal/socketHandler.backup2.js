import { Server } from 'socket.io';
import pool from '../db/pool.js';

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
        console.log("Command response:", response);        socket.emit('command-response', response);
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
          output: `[CLASSIFIED DOSSIER]\nName: ${character.character_name}\nID: ${character.character_id}\nCategory: ${character.category || 'UNKNOWN'}\nDescription: ${character.description || 'CLASSIFIED'}`,
          image: character.image_url
        };
      }
      
      return { output: `No records found for "${name}"` };
    } catch (error) {
      console.error('Query error:', error);
      return { output: 'Database query failed' };
    }
  }
    return { clear: true };
  }
  
  
  return { output: `Unknown command: ${command}` };
}

export default initializeWebSocket;
