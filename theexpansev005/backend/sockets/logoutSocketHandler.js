import sessionSummarizer from '../utils/sessionSummarizer.js';
import vectorMemoryManager from '../utils/vectorMemoryManager.js';
import pool from '../db/pool.js';

export async function integrateLogoutHandlers(terminalIo) {
  terminalIo.on('connection', (socket) => {
    
    socket.on('user:logout', async (data) => {
      const userId = socket.userId;
      const { sessionContext = {} } = data;

      if (!userId) {
        socket.emit('logout-error', { error: 'Not authenticated' });
        return;
      }

      try {
        console.log(`[LOGOUT] Starting logout sequence for ${socket.username}...`);

        socket.emit('logout:status', { status: 'creating-summary', message: 'Summarizing your session...' });

        const dossierQuery = `
          SELECT COUNT(*) as count FROM tse_dossier_entries WHERE user_id = $1
        `;
        const dossierResult = await pool.query(dossierQuery, [userId]);
        const dossierCount = dossierResult.rows[0]?.count || 0;

        const summary = await sessionSummarizer.createSessionSummary(
          userId,
          sessionContext,
          Array(dossierCount).fill({})
        );

        socket.emit('logout:status', { status: 'committing-memory', message: 'Saving memories to C.O.T.W. Archives...' });

        if (summary) {
          await sessionSummarizer.commitSessionToMemory(userId, summary);
        }

        socket.emit('logout:status', { status: 'finalizing', message: 'Preparing your greeting for next time...' });

        const farewell = {
          message: `Thanks for exploring the Cheese Wars with me! I'll remember ${summary?.entities_discussed?.length || 0} discoveries you made today.`,
          next_greeting: summary?.greeting_prompt || `Welcome back! Let's continue our investigation.`,
          session_summary: summary,
          council_progress: dossierCount
        };

        console.log(`✓ Logout complete for ${socket.username}`);
        socket.emit('logout:complete', farewell);

      } catch (error) {
        console.error(`✗ Logout error for ${userId}:`, error.message);
        socket.emit('logout-error', { error: error.message });
      }
    });

    socket.on('user:login', async (data) => {
      const userId = socket.userId;

      if (!userId) {
        socket.emit('login-error', { error: 'Not authenticated' });
        return;
      }

      try {
        console.log(`[LOGIN] Starting login sequence for ${socket.username}...`);

        socket.emit('login:status', { status: 'retrieving-memory', message: 'Consulting my memory...' });

        const lastSessionMemory = await vectorMemoryManager.retrieveSimilarVectors(
          userId,
          'session summary greeting',
          1,
          0.65
        );

        let greeting = `Welcome back, ${socket.username}! Ready to continue your investigation into the Cheese Wars?`;

        if (lastSessionMemory.vectors && lastSessionMemory.vectors.length > 0) {
          const lastSession = lastSessionMemory.vectors[0];
          greeting = `Welcome back! Last time we were chatting about ${lastSession.metadata?.entities?.join(', ') || 'the mysteries of this realm'}. Should we pick up where we left off?`;
        }

        const dossierQuery = `
          SELECT COUNT(*) as total_entries, AVG(council_worthiness) as avg_worthiness
          FROM tse_dossier_entries WHERE user_id = $1
        `;
        const dossierResult = await pool.query(dossierQuery, [userId]);
        const stats = dossierResult.rows[0];

        console.log(`✓ Login complete for ${socket.username}`);
        socket.emit('login:complete', {
          greeting,
          claude_message: `Claude the Tanuki: "${greeting}"`,
          council_progress: {
            dossier_entries: stats?.total_entries || 0,
            average_worthiness: Math.round(stats?.avg_worthiness || 0)
          }
        });

      } catch (error) {
        console.error(`✗ Login error for ${userId}:`, error.message);
        socket.emit('login-error', { error: error.message });
      }
    });

  });
}

export default integrateLogoutHandlers;
