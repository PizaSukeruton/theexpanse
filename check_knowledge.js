import pool from './backend/db/pool.js';

async function checkKnowledge() {
    try {
        const itemsResult = await pool.query('SELECT COUNT(*) as count FROM knowledge_items');
        const domainsResult = await pool.query('SELECT COUNT(*) as count FROM knowledge_domains');
        const stateResult = await pool.query('SELECT COUNT(*) as count FROM character_knowledge_state');
        
        console.log('\n=== KNOWLEDGE DATABASE STATUS ===');
        console.log(`Knowledge Items: ${itemsResult.rows[0].count}`);
        console.log(`Knowledge Domains: ${domainsResult.rows[0].count}`);
        console.log(`Character Knowledge States: ${stateResult.rows[0].count}`);
        
        if (itemsResult.rows[0].count > 0) {
            const sampleResult = await pool.query('SELECT knowledge_id, content, domain_id FROM knowledge_items LIMIT 5');
            console.log('\n=== SAMPLE KNOWLEDGE ITEMS ===');
            sampleResult.rows.forEach(row => {
                console.log(`\n[${row.knowledge_id}] Domain: ${row.domain_id}`);
                console.log(`Content: ${row.content.substring(0, 100)}...`);
            });
        }
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkKnowledge();
