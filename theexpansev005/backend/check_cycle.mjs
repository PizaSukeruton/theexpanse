import pool from './backend/db/pool.js';

const result = await pool.query('SELECT cycleid FROM tsecycles WHERE cycleid = $1', ['#800008']);
console.log('Cycle #800008 exists:', result.rows.length > 0);

if (result.rows.length > 0) {
    console.log('Cycle data:', result.rows[0]);
}

await pool.end();
