import pool from './backend/db/pool.js';

async function viewChunks() {
    const result = await pool.query(`
        SELECT ki.knowledge_id, ki.content, ki.complexity_score, kd.domain_name
        FROM knowledge_items ki
        LEFT JOIN knowledge_domains kd ON ki.domain_id = kd.domain_id
        WHERE kd.domain_name = 'Pokemon Knowledge'
        ORDER BY ki.acquisition_timestamp DESC
        LIMIT 10
    `);
    
    console.log(`\nFound ${result.rows.length} chunks:\n`);
    result.rows.forEach((row, i) => {
        console.log(`${i+1}. [${row.knowledge_id}] Complexity: ${row.complexity_score}`);
        console.log(`   ${row.content.substring(0, 150)}...\n`);
    });
    
    await pool.end();
}

viewChunks();
