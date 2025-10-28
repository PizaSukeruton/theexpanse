import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import fs from "fs";
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import expanseRoutes from './backend/expanse/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
import loreAdminRoutes from "./routes/lore-admin.js";
import terminalRoutes from "./routes/terminal.js";
const PORT = process.env.PORT || 3000;

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
app.use("/api/expanse", expanseRoutes);
app.use("/api/terminal", terminalRoutes);

app.post('/save-dossier', express.json({limit: '2mb'}), (req, res) => {
  const { fileName, content } = req.body;
  if (!fileName || !content) return res.status(400).send('Missing file or content');
  const filePath = path.join(__dirname, 'dossiers', fileName.replace(/[^a-zA-Z0-9\-_\.]/g, '_'));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  
// Clean undesirable editor sections before saving
const cleanContent = content
  .replace(/<input[^>]*type=["']file["'][^>]*>/gi, "")
  .replace(/<button[^>]*id=["']commitBtn["'][^>]*>.*?<\/button>/gis, "")
  .replace(/<div[^>]*class=["']editor-only["'][^>]*>.*?<\/div>/gis, "");
fs.writeFileSync(filePath, cleanContent);

  res.send('ok');
});

// --- Expanse API integration ---
// --- End Expanse API integration ---




// Chat endpoint for dossier terminal

// Working chat endpoint for dossier terminal
app.post('/api/tmbot/chat', async (req, res) => {
  const { message, userId, context } = req.body;
  
  // Simple response for now (no tmMessageProcessor dependency)
  const responses = {
    "hello": "Greetings, Agent. How may I assist you?",
    "who are you": "I am the Council interface.",
    "status": "All systems operational. Expanse project active.",
    "help": "Available commands: status, mission, intel, logout"
  };
  
  const lowerMsg = message.toLowerCase();
  let response = responses[lowerMsg];
  
  if (!response) {
    // Default response
    response = `Acknowledged: "${message}". Processing through secure channels...`;
  }
  
  res.json({ 
    response: response,
    timestamp: new Date().toISOString(),
    userId: userId
  });
});
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
