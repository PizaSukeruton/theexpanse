#!/bin/zsh

cp server.js server.js.bak

grep -v "tseRouter" server.js.bak > server.js.tmp

cat > server.js << 'ENDJS'
import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import fs from "fs";
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from './backend/db/pool.js';
import adminRoutes from './backend/routes/admin.js';
import authRoutes from './backend/routes/auth.js';
import traitsRouter from './backend/traits/index.js';
import qaExtractorRouter from "./backend/api/qa-extractor.js";
import tseRouter from './backend/api/tseRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tse', tseRouter);
app.use('/api/traits', traitsRouter);
app.use('/api/qa', qaExtractorRouter);

app.get('/', (req, res) => {
  res.send('<h1>THE EXPANSE SERVER RUNNING</h1>');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
ENDJS

rm server.js.tmp
chmod +x fix_server_tse_router.sh
echo "✅ server.js cleaned and tseRouter correctly mounted"
