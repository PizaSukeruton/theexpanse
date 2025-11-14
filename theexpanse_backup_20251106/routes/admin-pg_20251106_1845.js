import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from '../backend/db/pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Get all narrative segments
router.get('/stories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM narrative_segments ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new narrative segment
router.post('/stories', upload.single('image'), async (req, res) => {
  try {
    const { title, content, segment_type, summary } = req.body;
    const segment_id = '#' + Math.random().toString(16).substr(2, 6).toUpperCase();
    
    let multimedia_asset_id = null;
    if (req.file) {
      const asset_id = '#' + Math.random().toString(16).substr(2, 6).toUpperCase();
      await pool.query(
        'INSERT INTO multimedia_assets (asset_id, asset_type, file_path) VALUES ($1, $2, $3)',
        [asset_id, 'image', `/uploads/${req.file.filename}`]
      );
      multimedia_asset_id = asset_id;
    }
    
    const result = await pool.query(
      `INSERT INTO narrative_segments (segment_id, title, content, segment_type, summary, multimedia_asset_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [segment_id, title, content, segment_type || 'narration', summary, multimedia_asset_id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get narrative paths for a segment
router.get('/paths/:segment_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM narrative_paths WHERE source_segment_id = $1 ORDER BY order_in_choices',
      [req.params.segment_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create narrative path (choice)
router.post('/paths', async (req, res) => {
  try {
    const { source_segment_id, target_segment_id, choice_text, path_type } = req.body;
    const path_id = '#' + Math.random().toString(16).substr(2, 6).toUpperCase();
    
    const result = await pool.query(
      `INSERT INTO narrative_paths (path_id, source_segment_id, target_segment_id, path_type, choice_text) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [path_id, source_segment_id, target_segment_id, path_type || 'choice_option', choice_text]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all characters
router.get('/characters', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM characters ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create character
router.post('/characters', upload.single('image'), async (req, res) => {
  try {
    const { name, role, species, description, abilities } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await pool.query(
      `INSERT INTO characters (name, role, species, description, abilities, image_url) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, role, species, description, abilities ? abilities.split(',') : null, image_url]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Media Gallery endpoints
router.post("/media", upload.single("image"), async (req, res) => {
  try {
    const { title = "Untitled" } = req.body;
    const image_id = "#" + Math.random().toString(16).substr(2, 6).toUpperCase();
    const file_path = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = await pool.query(
      "INSERT INTO uploaded_images (filename, original_name, title, file_size, file_path, image_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [req.file.filename, req.file.originalname, title, req.file.size, file_path, image_id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/media", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM uploaded_images ORDER BY upload_date DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;
