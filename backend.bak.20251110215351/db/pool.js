import dotenv from "dotenv";
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

// Check if database URL indicates local or production
const isProduction = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render.com');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

// Connection sanity check
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
