import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import knowledgeQueries from '../db/knowledgeQueries.js';
import pool from '../db/pool.js';
import generateHexId from './hexIdGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CurriculumLoader {
    constructor() {
        this.chunkerPath = path.join(__dirname, 'knowledge_chunker.py');
    }

    async callChunker(filePath, domainId, method = 'semantic', chunkSize = 200, overlap = 20) {
        return new Promise((resolve, reject) => {
            const args = [this.chunkerPath, filePath, domainId, method, chunkSize.toString(), overlap.toString()];
            const python = spawn('python3', args);
            
            let stdout = '';
            let stderr = '';
            
            python.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            
            python.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            python.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Chunker failed: ${stderr}`));
                    return;
                }
                
                try {
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (error) {
                    reject(new Error(`Failed to parse chunker output: ${error.message}`));
                }
            });
        });
    }

    async getOrCreateDomain(domainName, description = null) {
        const existingQuery = 'SELECT domain_id FROM knowledge_domains WHERE domain_name = $1';
        const existing = await pool.query(existingQuery, [domainName]);
        
        if (existing.rows.length > 0) {
            return existing.rows[0].domain_id;
        }
        
        const domainId = await generateHexId('domain_id');
        const insertQuery = `
            INSERT INTO knowledge_domains (domain_id, domain_name, domain_description)
            VALUES ($1, $2, $3)
            RETURNING domain_id
        `;
        const result = await pool.query(insertQuery, [domainId, domainName, description]);
        return result.rows[0].domain_id;
    }

    async loadCurriculum(filePath, domainName, options = {}) {
        const {
            method = 'semantic',
            chunkSize = 200,
            overlap = 20,
            description = null
        } = options;
        
        console.log(`[CurriculumLoader] Starting curriculum load: ${filePath}`);
        console.log(`[CurriculumLoader] Domain: ${domainName}`);
        console.log(`[CurriculumLoader] Method: ${method}, ChunkSize: ${chunkSize}, Overlap: ${overlap}`);
        
        try {
            const domainId = await this.getOrCreateDomain(domainName, description);
            console.log(`[CurriculumLoader] Domain ID: ${domainId}`);
            
            console.log('[CurriculumLoader] Calling Python chunker...');
            const chunkerResult = await this.callChunker(filePath, domainId, method, chunkSize, overlap);
            
            if (chunkerResult.status !== 'success') {
                throw new Error(`Chunker failed: ${chunkerResult.error}`);
            }
            
            console.log(`[CurriculumLoader] Chunker produced ${chunkerResult.total_chunks_returned} chunks`);
            console.log(`[CurriculumLoader] Processing time: ${chunkerResult.processing_time_ms}ms`);
            
            const chunks = chunkerResult.chunks;
            let insertedCount = 0;
            let skippedCount = 0;
            
            for (const chunk of chunks) {
                try {
                    const existingQuery = 'SELECT knowledge_id FROM knowledge_items WHERE knowledge_id = $1';
                    const existing = await pool.query(existingQuery, [chunk.knowledge_id]);
                    
                    if (existing.rows.length > 0) {
                        skippedCount++;
                        continue;
                    }
                    
                    await knowledgeQueries.insertKnowledgeItem({
                        knowledge_id: chunk.knowledge_id,
                        content: chunk.content,
                        domain_id: chunk.domain_id,
                        source_type: chunk.source_type,
                        initial_character_id: null,
                        initial_strength: 0.0,
                        complexity_score: chunk.complexity_score
                    });
                    
                    insertedCount++;
                    
                    if (insertedCount % 10 === 0) {
                        console.log(`[CurriculumLoader] Progress: ${insertedCount}/${chunks.length} chunks inserted`);
                    }
                    
                } catch (error) {
                    console.error(`[CurriculumLoader] Error inserting chunk ${chunk.knowledge_id}:`, error.message);
                }
            }
            
            console.log(`[CurriculumLoader] ✅ Load complete!`);
            console.log(`[CurriculumLoader] Inserted: ${insertedCount}`);
            console.log(`[CurriculumLoader] Skipped (duplicates): ${skippedCount}`);
            
            return {
                success: true,
                domainId: domainId,
                domainName: domainName,
                totalChunks: chunks.length,
                insertedCount: insertedCount,
                skippedCount: skippedCount,
                processingTimeMs: chunkerResult.processing_time_ms
            };
            
        } catch (error) {
            console.error('[CurriculumLoader] Load failed:', error);
            throw error;
        }
    }
}

export default CurriculumLoader;
