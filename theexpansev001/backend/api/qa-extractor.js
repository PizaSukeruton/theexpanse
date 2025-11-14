import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
    destination: '/tmp/pdf-uploads/',
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

router.post('/analyze', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const pdfPath = req.file.path;
    const analyzerPath = path.join(__dirname, '../utils/pdf_analyzer.py');

    console.log(`[QA Analyzer] Analyzing: ${req.file.originalname}`);

    const python = spawn('python3', [analyzerPath, pdfPath]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
        stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log(data.toString());
    });
    
    python.on('close', (code) => {
        if (code !== 0) {
            fs.unlinkSync(pdfPath);
            console.error('[QA Analyzer] Error:', stderr);
            return res.status(500).json({ error: stderr || 'Analysis failed' });
        }
        
        try {
            const result = JSON.parse(stdout);
            result.pdf_path = pdfPath;
            result.original_name = req.file.originalname;
            console.log(`[QA Analyzer] PDF has ${result.total_pages} pages`);
            res.json(result);
        } catch (error) {
            fs.unlinkSync(pdfPath);
            console.error('[QA Analyzer] Parse error:', error.message);
            res.status(500).json({ error: 'Failed to parse analysis results' });
        }
    });
});

router.post('/extract-topics', express.json(), async (req, res) => {
    const { pdf_path, page_selection } = req.body;
    
    if (!pdf_path || !fs.existsSync(pdf_path)) {
        return res.status(400).json({ error: 'Invalid PDF path' });
    }

    const extractorPath = path.join(__dirname, '../utils/topic_extractor.py');

    console.log(`[Topic Extractor] Pages: ${page_selection}`);

    const python = spawn('python3', [extractorPath, pdf_path, page_selection || 'all', '50']);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
        stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log(data.toString());
    });
    
    python.on('close', (code) => {
        if (code !== 0) {
            console.error('[Topic Extractor] Error:', stderr);
            return res.status(500).json({ error: stderr || 'Topic extraction failed' });
        }
        
        try {
            const result = JSON.parse(stdout);
            console.log(`[Topic Extractor] Found ${result.topics.length} topics`);
            res.json(result);
        } catch (error) {
            console.error('[Topic Extractor] Parse error:', error.message);
            res.status(500).json({ error: 'Failed to parse topic results' });
        }
    });
});

router.post('/extract-qa', express.json(), async (req, res) => {
    const { pdf_path, selected_topics, page_selection, limit } = req.body;
    
    if (!pdf_path || !fs.existsSync(pdf_path)) {
        return res.status(400).json({ error: 'Invalid PDF path' });
    }

    if (!selected_topics || selected_topics.length === 0) {
        return res.status(400).json({ error: 'No topics selected' });
    }

    const extractorPath = path.join(__dirname, '../utils/qa_focused_extractor.py');
    const topicsJson = JSON.stringify(selected_topics);

    console.log(`[QA Extractor] Topics: ${selected_topics.join(', ')}`);
    console.log(`[QA Extractor] Limit: ${limit}`);

    const python = spawn('python3', [
        extractorPath, 
        pdf_path, 
        topicsJson,
        page_selection || 'all',
        (limit || 25).toString()
    ]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
        stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
        stderr += data.toString();
        // Print stderr in real-time to console
        process.stderr.write(data);
    });
    
    python.on('close', (code) => {
        fs.unlinkSync(pdf_path);
        
        if (code !== 0) {
            console.error('[QA Extractor] Error:', stderr);
            return res.status(500).json({ error: stderr || 'Q&A extraction failed' });
        }
        
        try {
            const result = JSON.parse(stdout);
            console.log(`[QA Extractor] Generated ${result.total_extracted} Q&A pairs`);
            res.json(result);
        } catch (error) {
            console.error('[QA Extractor] Parse error:', error.message);
            res.status(500).json({ error: 'Failed to parse extraction results' });
        }
    });
});

router.post('/cleanup', express.json(), async (req, res) => {
    const { pdf_path } = req.body;
    
    if (pdf_path && fs.existsSync(pdf_path)) {
        fs.unlinkSync(pdf_path);
        console.log(`[QA Extractor] Cleaned up: ${pdf_path}`);
    }
    
    res.json({ status: 'success' });
});

export default router;
