import pool from './backend/db/pool.js';

async function checkDomains() {
    try {
        const result = await pool.query('SELECT * FROM knowledge_domains');
        
        console.log('\n=== KNOWLEDGE DOMAINS ===');
        result.rows.forEach(domain => {
            console.log(`\n[${domain.domain_id}] ${domain.domain_name}`);
            console.log(`Description: ${domain.domain_description || 'N/A'}`);
        });
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkDomains();
