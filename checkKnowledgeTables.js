import pool from './backend/db/pool.js';

async function checkTables() {
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%knowledge%'
            ORDER BY table_name;
        `);
        
        console.log('📊 Knowledge-related tables:');
        result.rows.forEach(row => console.log(`  - ${row.table_name}`));
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkTables();
