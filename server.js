import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import fs from "fs";
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './backend/db/pool.js';
import expanseRoutes from './backend/expanse/index.js';
import { registerRoute } from './backend/utils/routeLogger.js';
import characterRouter from './backend/api/character.js';
import characterKnowledgeRouter from './backend/api/character-knowledge.js';
import generateAokHexId from './backend/utils/hexIdGenerator.js';
import narrativeRouter from './backend/api/narrative-router.js';
import authRoutes from './routes/auth.js';
const __filename = fileURLToPath(import.meta.url);
import adminRoutes from './routes/admin.js';
import psychicAdminRoutes from './routes/psychic-admin.js';
import adminCharactersRoutes from './routes/adminCharacters.js';
import qaExtractorRouter from './backend/api/qa-extractor.js';
const __dirname = dirname(__filename);

const app = express();
import loreAdminRoutes from "./routes/lore-admin.js";
import tseRouter from './backend/TSE/index.js';
import terminalRoutes from "./routes/terminal.js";
const PORT = process.env.PORT || 3000;
import traitsRouter from './backend/traits/index.js';
import { createServer } from "http";
import initializeWebSocket from "./backend/councilTerminal/socketHandler.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:", "blob:"],
        "connect-src": ["'self'", "ws:", "http://localhost:3000"],
        "font-src": ["'self'", "https:", "data:"],
        "media-src": ["'self'", "blob:", "data:"],
        "object-src": ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/dossiers', express.static(path.join(__dirname, 'dossiers')));

app.get('/', (req, res) => {
  res.send('<h1 style="font-family: Courier New; color: #00ff00; background: black; text-align:center; padding: 50px;">🖥️ THE EXPANSE SERVER RUNNING</h1>');
});

app.get("/admin", (req, res) => {
  res.sendFile(join(__dirname, "public", "admin.html"));
});

app.use("/api/lore", loreAdminRoutes);
registerRoute("/api/lore", "Lore Admin");
app.use("/api/expanse", expanseRoutes);
registerRoute("/api/expanse", "Expanse API");
app.use('/api/character', characterRouter);
registerRoute("/api/character", "Character API");
app.use('/api/character', characterKnowledgeRouter);
registerRoute("/api/character/:id/knowledge", "Knowledge API");
app.use('/api/narrative', narrativeRouter);
registerRoute("/api/narrative", "Narrative System");
app.use("/api/terminal", terminalRoutes);
app.use('/api/auth', authRoutes);
registerRoute("/api/auth", "Authentication");
registerRoute("/api/terminal", "Terminal API");
app.use('/api/admin', adminRoutes);
app.use('/api/psychic', psychicAdminRoutes);
registerRoute("/api/psychic", "Psychic Engine Admin");
registerRoute("/api/admin", "Admin API");
app.use('/api/admin/characters', adminCharactersRoutes);
registerRoute("/api/admin/characters", "Admin Characters");

app.use('/api/tse', tseRouter);
registerRoute("/api/tse", "TSE Pipeline");
app.use('/api/traits', traitsRouter);
app.use('/api/qa', qaExtractorRouter);
registerRoute("/api/qa", "Q&A Extractor");
registerRoute("/api/traits", "Traits System");

app.post('/save-dossier', express.json({limit: '2mb'}), (req, res) => {
  const { fileName, content } = req.body;
  if (!fileName || !content) return res.status(400).send('Missing file or content');
  const filePath = path.join(__dirname, 'dossiers', fileName.replace(/[^a-zA-Z0-9\-_\.]/g, '_'));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  
  const cleanContent = content
    .replace(/<input[^>]*type=["']file["'][^>]*>/gi, "")
    .replace(/<button[^>]*id=["']commitBtn["'][^>]*>.*?<\/button>/gis, "")
    .replace(/<div[^>]*class=["']editor-only["'][^>]*>.*?<\/div>/gis, "");
  fs.writeFileSync(filePath, cleanContent);

  res.send('ok');
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

async function loadAllCharacters() {
  try {
    const result = await pool.query(`
      SELECT character_id, character_name, category 
      FROM character_profiles 
      ORDER BY category, character_id
    `);
    
    const narrative = result.rows.filter(c => c.category !== 'Knowledge Entity');
    const knowledge = result.rows.filter(c => c.category === 'Knowledge Entity');
    
    console.log(`\n👥 Narrative Characters (${narrative.length}):`);
    narrative.forEach(char => {
      console.log(`   ${char.character_id} - ${char.character_name} [${char.category}]`);
    });
    
    if (knowledge.length > 0) {
      console.log(`\n📚 Knowledge Entities (${knowledge.length}):`);
      knowledge.forEach(char => {
        console.log(`   ${char.character_id} - ${char.character_name}`);
      });
    }
    
    console.log('' );
  } catch (error) {
    console.error('❌ Failed to load characters:', error.message);
  }
}

const httpServer = createServer(app);
const io = initializeWebSocket(httpServer);
import { WebSocketServer } from "ws";
import { startPsychicRadar } from "./backend/psychicRadarEmitter.js";
import { startPsychicEngine } from "./backend/psychicEngineScheduler.js";
const radarWSS = new WebSocketServer({ noServer: true });
httpServer.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws/psychic-radar") {
    radarWSS.handleUpgrade(req, socket, head, (ws) => {
      radarWSS.emit("connection", ws, req);
    });
  }
});
startPsychicRadar(radarWSS, { intervalMs: 100, rmax: 10000 });
startPsychicEngine();
httpServer.listen(PORT, async () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server initialized`);
  await loadAllCharacters();
});
