// © 2025 Piza Sukeruton Multiverse Project
// backend/db/pool.js — PostgreSQL Pool Connector

require('dotenv').config({ path: __dirname + '/../.env' });
console.log('📦 Loaded DATABASE_URL from .env:', process.env.DATABASE_URL);

import pkg from 'pg';
const { Pool  } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ✅ Connection sanity check
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database();');
    console.log('✅ Connected to PostgreSQL database:', result.rows[0].current_database);
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
})();

export default pool;

