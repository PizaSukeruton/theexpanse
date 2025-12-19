import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db/pool.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/characters');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + crypto.randomBytes(8).toString('hex') + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage, limits: { fileSize: 5242880 }});

router.post('/upload/:characterId', upload.single('image'), async (req, res) => {
  try {
    const { characterId } = req.params;
    if (!req.file) return res.status(400).json({ success: false });
    
    const assetId = '#A' + Date.now().toString(16).toUpperCase();
    const galleryId = '#G' + Date.now().toString(16).toUpperCase();
    const imageUrl = '/uploads/characters/' + req.file.filename;
    
    await pool.query('INSERT INTO multimedia_assets (asset_id, url, asset_type, original_filename, file_size, mime_type) VALUES ($1, $2, $3, $4, $5, $6)', 
      [assetId, imageUrl, 'image', req.file.originalname, req.file.size, req.file.mimetype]);
    
    await pool.query('INSERT INTO character_image_gallery (gallery_entry_id, character_id, asset_id) VALUES ($1, $2, $3)', 
      [galleryId, characterId, assetId]);
    
    res.json({ success: true, url: imageUrl });
  } catch (e) {
    console.error('Upload error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/character/:characterId', async (req, res) => {
  try {
    const result = await pool.query(`SELECT cig.gallery_entry_id, cig.asset_id, ma.url, ma.original_filename, cig.is_active, cig.display_order, cig.uploaded_at 
      FROM character_image_gallery cig 
      JOIN multimedia_assets ma ON cig.asset_id = ma.asset_id 
      WHERE cig.character_id = $1 
      ORDER BY cig.display_order ASC`, [req.params.characterId]);
    res.json({ success: true, images: result.rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.put('/set-active/:galleryId', async (req, res) => {
  try {
    const charResult = await pool.query('SELECT character_id FROM character_image_gallery WHERE gallery_entry_id = $1', [req.params.galleryId]);
    if (charResult.rows.length === 0) return res.status(404).json({ success: false });
    const characterId = charResult.rows[0].character_id;
    await pool.query('UPDATE character_image_gallery SET is_active = false WHERE character_id = $1', [characterId]);
    await pool.query('UPDATE character_image_gallery SET is_active = true WHERE gallery_entry_id = $1', [req.params.galleryId]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.delete('/:galleryId', async (req, res) => {
  try {
    const imageResult = await pool.query('SELECT ma.url, cig.asset_id FROM character_image_gallery cig JOIN multimedia_assets ma ON cig.asset_id = ma.asset_id WHERE cig.gallery_entry_id = $1', [req.params.galleryId]);
    if (imageResult.rows.length === 0) return res.status(404).json({ success: false });
    const { url, asset_id } = imageResult.rows[0];
    await pool.query('DELETE FROM character_image_gallery WHERE gallery_entry_id = $1', [req.params.galleryId]);
    await pool.query('DELETE FROM multimedia_assets WHERE asset_id = $1', [asset_id]);
    const filePath = path.join(__dirname, '../../', url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;