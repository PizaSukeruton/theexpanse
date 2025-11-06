import express from 'express';
const router = express.Router();
import pool from '../db/pool.js';
import requireAdmin from '../middleware/requireAdmin.js';

import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/gallery');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'char-' + uniqueSuffix + '.png');
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'), false);
    }
    cb(null, true);
  }
});

router.get('/', async (req, res) => {
    const { character_id } = req.query;

    if (!/^#[0-9A-Fa-f]{6}$/.test(character_id)) {
        return res.status(400).json({ error: 'Invalid character_id. Must be hex format.' });
    }

    try {
        const result = await pool.query(`
            SELECT character_id, character_name, category, description, image_url, created_at, updated_at
            FROM character_profiles
            WHERE character_id = $1
        `, [character_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching character:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/all', requireAdmin(5), async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT character_id, character_name, category, description, image_url, created_at
            FROM character_profiles
            ORDER BY created_at DESC
        `);
        
        return res.json({
            success: true,
            characters: result.rows
        });
    } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/', requireAdmin(5), upload.single('character_image'), async (req, res) => {
    const { character_name, category, description } = req.body;
    
    if (!character_name || !category) {
        return res.status(400).json({ error: 'Name and category required' });
    }
    
    try {
        const maxResult = await pool.query('SELECT MAX(character_id) as max_id FROM character_profiles');
        let newId = '#700001';
        
        if (maxResult.rows[0].max_id) {
            const currentMax = parseInt(maxResult.rows[0].max_id.substring(1), 16);
            newId = '#' + (currentMax + 1).toString(16).toUpperCase().padStart(6, '0');
        }
        
        const isAutonomous = (category === "B-Roll Chaos" || category === "Machines") ? true : null;
        const imageUrl = req.file ? '/gallery/' + req.file.filename : null;
        
        const result = await pool.query(`
            INSERT INTO character_profiles 
            (character_id, character_name, category, description, is_b_roll_autonomous, image_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [newId, character_name, category, description, isAutonomous, imageUrl]);
        
        return res.json({
            success: true,
            character: result.rows[0]
        });
    } catch (error) {
        if (req.file) {
            try {
                await fs.unlink(path.join(__dirname, '../../public/gallery', req.file.filename));
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }
        
        console.error('Error creating character:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.put("/:id", requireAdmin(5), upload.single('character_image'), async (req, res) => {
    const characterId = "#" + req.params.id.replace("#", "");
    const { character_name, category, description } = req.body;
    
    try {
        let updateFields = [];
        let values = [];
        let paramCounter = 1;
        
        if (character_name !== undefined) {
            updateFields.push(`character_name = $${paramCounter}`);
            values.push(character_name);
            paramCounter++;
        }
        
        if (category !== undefined) {
            updateFields.push(`category = $${paramCounter}`);
            values.push(category);
            paramCounter++;
            
            const isAutonomous = (category === "B-Roll Chaos" || category === "Machines") ? true : null;
            updateFields.push(`is_b_roll_autonomous = $${paramCounter}`);
            values.push(isAutonomous);
            paramCounter++;
        }
        
        if (description !== undefined) {
            updateFields.push(`description = $${paramCounter}`);
            values.push(description);
            paramCounter++;
        }
        
        if (req.file) {
            updateFields.push(`image_url = $${paramCounter}`);
            values.push('/gallery/' + req.file.filename);
            paramCounter++;
        }
        
        updateFields.push('updated_at = NOW()');
        
        values.push(characterId);
        
        const result = await pool.query(`
            UPDATE character_profiles 
            SET ${updateFields.join(', ')}
            WHERE character_id = $${paramCounter}
            RETURNING *
        `, values);
        
        if (result.rows.length === 0) {
            if (req.file) {
                try {
                    await fs.unlink(path.join(__dirname, '../../public/gallery', req.file.filename));
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            }
            
            return res.status(404).json({ 
                success: false,
                error: "Character not found" 
            });
        }
        
        return res.json({ 
            success: true,
            character: result.rows[0]
        });
        
    } catch (error) {
        if (req.file) {
            try {
                await fs.unlink(path.join(__dirname, '../../public/gallery', req.file.filename));
            } catch (err) {
                console.error('Error deleting file:', err);
            }
        }
        
        console.error('Error updating character:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.delete("/:id", requireAdmin(5), async (req, res) => {
    const characterId = "#" + req.params.id.replace("#", "");
    
    try {
        const result = await pool.query(`
            DELETE FROM character_profiles
            WHERE character_id = $1
            RETURNING *
        `, [characterId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Character not found" 
            });
        }
        
        return res.json({ 
            success: true,
            message: "Character deleted",
            character: result.rows[0]
        });
        
    } catch (error) {
        console.error('Error deleting character:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

export default router;
