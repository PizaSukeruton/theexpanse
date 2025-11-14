import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../backend/db/pool.js';
import { generateToken, verifyToken } from '../backend/utils/jwtUtil.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query(
      'SELECT user_id, username, password_hash, access_level FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0 || !await bcrypt.compare(password, result.rows[0].password_hash)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    const user = result.rows[0];
    
    if (user.access_level < 5) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required (level 5+)' 
      });
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        access_level: user.access_level
      }
    });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const decoded = verifyToken(token);
    res.json({ success: true, user: decoded });
    
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: error.message 
    });
  }
});

import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

async function applyCRTFilter(buffer) {
  try {
    const processed = await sharp(buffer)
      .modulate({
        brightness: 1.1,
        saturation: 0.7
      })
      .tint({ r: 0, g: 30, b: 0 })
      .gamma(1.4)
      .blur(0.3)
      .sharpen({ sigma: 0.5 })
      .toBuffer();
    
    return processed;
  } catch (error) {
    console.error('Error applying CRT filter:', error);
    return buffer;
  }
}

router.post("/media", upload.single("image"), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const hexResult = await client.query(
      'SELECT get_next_hex_id($1) as hex_id', 
      ['multimedia_asset']
    );
    const hexId = hexResult.rows[0].hex_id;
    
    console.log(`Sequential HEX ID: ${hexId}`);
    
    let processedBuffer = req.file.buffer;
    if (req.body.applyCRT === 'true') {
      console.log('Applying CRT filter...');
      processedBuffer = await applyCRTFilter(req.file.buffer);
    }
    
    const ext = path.extname(req.file.originalname);
    const hexClean = hexId.substring(1);
    const filename = `${hexClean}${ext}`;
    
    const uploadPath = path.join(__dirname, "../public/gallery");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    const filepath = path.join(uploadPath, filename);
    
    if (fs.existsSync(filepath)) {
      throw new Error(`File with hex ID ${hexId} already exists!`);
    }
    
    fs.writeFileSync(filepath, processedBuffer);
    
    const relationships = req.body.relationships ? JSON.parse(req.body.relationships) : [];
    
    const result = await client.query(
      `INSERT INTO multimedia_assets (
        asset_id, 
        asset_type, 
        url,
        description,
        original_filename,
        file_size,
        mime_type,
        tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        hexId,
        'image',
        `/gallery/${filename}`,
        req.body.title || 'Uploaded image',
        req.file.originalname,
        processedBuffer.length,
        req.file.mimetype,
        req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : []
      ]
    );
    
    for (const rel of relationships) {
      await client.query(
        `INSERT INTO hex_relationships (source_hex, target_hex, relationship_type, metadata)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [hexId, rel.target_hex, rel.relationship_type || 'depicts', rel.metadata || {}]
      );
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      hex_id: hexId,
      filepath: `/gallery/${filename}`,
      asset: result.rows[0],
      message: `Media uploaded: ${hexId} (${filename})`
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Upload error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

router.get("/media", async (req, res) => {
  try {
    const query = `
      SELECT 
        ma.asset_id,
        ma.asset_type,
        ma.url,
        ma.description,
        ma.original_filename,
        ma.tags,
        ma.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'hex_id', he.hex_id,
              'name', he.name,
              'entity_type', he.entity_type,
              'relationship', hr.relationship_type
            )
          ) FILTER (WHERE he.hex_id IS NOT NULL),
          '[]'::json
        ) as relationships
      FROM multimedia_assets ma
      LEFT JOIN hex_relationships hr ON hr.source_hex = ma.asset_id
      LEFT JOIN hex_entities he ON he.hex_id = hr.target_hex
      WHERE ma.asset_type = 'image'
      GROUP BY ma.asset_id, ma.asset_type, ma.url, ma.description, 
               ma.original_filename, ma.tags, ma.created_at
      ORDER BY ma.created_at DESC
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/entities", async (req, res) => {
  try {
    const { entity_type } = req.query;
    
    let query = 'SELECT * FROM hex_entities';
    const params = [];
    
    if (entity_type) {
      query += ' WHERE entity_type = $1';
      params.push(entity_type);
    }
    
    query += ' ORDER BY hex_id LIMIT 100';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/hex/next/:entityType", async (req, res) => {
  try {
    const entityTypeMap = {
      'multimedia': 'multimedia_asset',
      'character': 'character',
      'location': 'location',
      'story_arc': 'story_arc',
      'knowledge': 'knowledge_entry'
    };
    
    const dbEntityType = entityTypeMap[req.params.entityType] || req.params.entityType;
    
    const result = await pool.query(
      'SELECT get_next_hex_id($1) as hex_id',
      [dbEntityType]
    );
    
    res.json({
      success: true,
      entity_type: dbEntityType,
      hex_id: result.rows[0].hex_id
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/relationships", async (req, res) => {
  try {
    const { source_hex, target_hex, relationship_type, metadata } = req.body;
    
    await pool.query(
      `INSERT INTO hex_relationships (source_hex, target_hex, relationship_type, metadata)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (source_hex, target_hex, relationship_type) 
       DO UPDATE SET metadata = $4`,
      [source_hex, target_hex, relationship_type, metadata || {}]
    );
    
    res.json({
      success: true,
      message: `Relationship created: ${source_hex} ${relationship_type} ${target_hex}`
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/relationships/:hexId", async (req, res) => {
  try {
    const hexId = '#' + req.params.hexId.replace('#', '');
    
    const result = await pool.query(
      'SELECT * FROM get_entity_relationships($1)',
      [hexId]
    );
    
    res.json({
      success: true,
      hex_id: hexId,
      relationships: result.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM hex_relationships) as total_relationships,
        (SELECT COUNT(*) FROM multimedia_assets WHERE asset_type = 'image') as total_images,
        (SELECT COUNT(*) FROM multimedia_assets WHERE asset_type = 'video') as total_videos,
        (SELECT COUNT(*) FROM character_profiles) as total_characters,
        (SELECT COUNT(*) FROM story_arcs) as total_story_arcs,
        (SELECT COUNT(*) FROM locations) as total_locations,
        (SELECT COUNT(*) FROM knowledge_items) as total_knowledge
    `);
    
    const hexCounters = await pool.query('SELECT * FROM hex_counters ORDER BY entity_type');
    
    res.json({
      success: true,
      stats: stats.rows[0],
      hex_counters: hexCounters.rows
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
