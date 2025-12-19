import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../../db/pool.js';
import generateHexId from '../../utils/hexIdGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../../public/wizard-uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created wizard-uploads directory');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images only');
    }
  }
});

// SPECIFIC ROUTES FIRST (before generic /:table routes)
router.get('/tables', async (req, res) => {
  console.log('→ Fetching available tables');
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log(`✓ Found ${result.rows.length} tables`);
    res.json({ tables: result.rows.map(r => r.table_name) });
  } catch (error) {
    console.error('✗ Failed to fetch tables:', error.message);
    res.status(500).json({ error: error.message, tables: [] });
  }
});

router.post('/upload/:table/:id', upload.single('image'), async (req, res) => {
  console.log(`→ Wizard uploading image for ${req.params.table}/${req.params.id}`);
  
  if (!req.file) {
    return res.json({ success: false, error: 'No file uploaded' });
  }
  
  const table = req.params.table;
  const recordId = req.params.id.replace(/^#/, '');
  const characterId = `#${recordId}`;
  
  try {
    const assetId = await generateHexId('multimedia_asset_id');
    const galleryEntryId = await generateHexId('gallery_entry_id');
    
    const imageUrl = `/wizard-uploads/${req.file.filename}`;
    
    await pool.query(
      `INSERT INTO multimedia_assets (asset_id, asset_type, url, original_filename, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [assetId, 'image', imageUrl, req.file.originalname, req.file.size, req.file.mimetype]
    );
    
    const existingGallery = await pool.query(
      `SELECT COUNT(*) as count FROM character_image_gallery WHERE character_id = $1`,
      [characterId]
    );
    const isFirstImage = existingGallery.rows[0].count === '0';
    
    await pool.query(
      `INSERT INTO character_image_gallery (gallery_entry_id, character_id, asset_id, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [galleryEntryId, characterId, assetId, isFirstImage, 0]
    );
    
    const galleryResult = await pool.query(
      `SELECT g.gallery_entry_id, g.asset_id, g.is_active, g.display_order, g.uploaded_at,
              m.url, m.original_filename
       FROM character_image_gallery g
       JOIN multimedia_assets m ON g.asset_id = m.asset_id
       WHERE g.character_id = $1
       ORDER BY g.display_order, g.uploaded_at DESC`,
      [characterId]
    );
    
    console.log(`✓ Image uploaded: ${assetId} → ${galleryEntryId}`);
    res.json({ 
      success: true, 
      imageUrl, 
      assetId,
      galleryEntryId,
      gallery: galleryResult.rows 
    });
  } catch (error) {
    console.error('✗ Upload failed:', error.message);
    res.json({ success: false, error: error.message });
  }
});

router.put('/:table/:id/image/active', async (req, res) => {
  const { assetId } = req.body;
  const characterId = `#${req.params.id.replace(/^#/, '')}`;
  
  console.log(`→ Setting active image: ${assetId} for ${characterId}`);
  
  try {
    await pool.query(
      `UPDATE character_image_gallery SET is_active = false WHERE character_id = $1`,
      [characterId]
    );
    
    await pool.query(
      `UPDATE character_image_gallery SET is_active = true 
       WHERE character_id = $1 AND asset_id = $2`,
      [characterId, assetId]
    );
    
    const galleryResult = await pool.query(
      `SELECT g.gallery_entry_id, g.asset_id, g.is_active, g.display_order, g.uploaded_at,
              m.url, m.original_filename
       FROM character_image_gallery g
       JOIN multimedia_assets m ON g.asset_id = m.asset_id
       WHERE g.character_id = $1
       ORDER BY g.display_order, g.uploaded_at DESC`,
      [characterId]
    );
    
    console.log(`✓ Active image set: ${assetId}`);
    res.json({ success: true, gallery: galleryResult.rows });
  } catch (error) {
    console.error('✗ Failed to set active image:', error.message);
    res.json({ success: false, error: error.message });
  }
});

router.delete('/:table/:id/image', async (req, res) => {
  const { assetId } = req.body;
  const characterId = `#${req.params.id.replace(/^#/, '')}`;
  
  console.log(`→ Deleting image: ${assetId}`);
  
  try {
    const assetResult = await pool.query(
      `SELECT url FROM multimedia_assets WHERE asset_id = $1`,
      [assetId]
    );
    
    if (assetResult.rows.length > 0) {
      const filePath = path.join(__dirname, '../../../public', assetResult.rows[0].url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await pool.query(
      `DELETE FROM character_image_gallery WHERE character_id = $1 AND asset_id = $2`,
      [characterId, assetId]
    );
    
    await pool.query(
      `DELETE FROM multimedia_assets WHERE asset_id = $1`,
      [assetId]
    );
    
    const galleryResult = await pool.query(
      `SELECT g.gallery_entry_id, g.asset_id, g.is_active, g.display_order, g.uploaded_at,
              m.url, m.original_filename
       FROM character_image_gallery g
       JOIN multimedia_assets m ON g.asset_id = m.asset_id
       WHERE g.character_id = $1
       ORDER BY g.display_order, g.uploaded_at DESC`,
      [characterId]
    );
    
    console.log(`✓ Image deleted: ${assetId}`);
    res.json({ success: true, gallery: galleryResult.rows });
  } catch (error) {
    console.error('✗ Failed to delete image:', error.message);
    res.json({ success: false, error: error.message });
  }
});

// GENERIC ROUTES LAST (after specific routes)
router.get('/:table', async (req, res) => {
  const table = req.params.table;
  console.log(`→ Fetching records from table: ${table}`);
  
  try {
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT 100`);
    console.log(`✓ Fetched ${result.rows.length} records from ${table}`);
    res.json(result.rows);
  } catch (error) {
    console.error(`✗ Failed to fetch from ${table}:`, error.message);
    res.status(500).json({ error: error.message, tables: [] });
  }
});

router.get('/:table/:id', async (req, res) => {
  const table = req.params.table;
  const recordId = `#${req.params.id.replace(/^#/, '')}`;
  const idColumn = `${table.slice(0, -1)}_id`;
  
  console.log(`→ Fetching record ${recordId} from ${table}`);
  
  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE ${idColumn} = $1`, [recordId]);
    
    if (result.rows.length > 0) {
      const record = result.rows[0];
      
      const galleryResult = await pool.query(
        `SELECT g.gallery_entry_id, g.asset_id, g.is_active, g.display_order, g.uploaded_at,
                m.url, m.original_filename
         FROM character_image_gallery g
         JOIN multimedia_assets m ON g.asset_id = m.asset_id
         WHERE g.character_id = $1
         ORDER BY g.display_order, g.uploaded_at DESC`,
        [recordId]
      );
      
      record.gallery = galleryResult.rows;
      console.log(`✓ Fetched record with ${galleryResult.rows.length} gallery images`);
      res.json(record);
    } else {
      res.json({ error: 'Record not found' });
    }
  } catch (error) {
    console.error(`✗ Failed to fetch record:`, error.message);
    res.status(500).json({ error: error.message, tables: [] });
  }
});

export default router;
