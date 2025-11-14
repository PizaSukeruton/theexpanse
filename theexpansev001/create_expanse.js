import pool from './backend/db/pool.js';
import generateHexId from './backend/utils/hexIdGenerator.js';

async function createExpanseLocation() {
  try {
    const locationId = await generateHexId('location_id');
    
    await pool.query(
      "INSERT INTO locations (location_id, name, realm) VALUES ($1, $2, $3)",
      [locationId, 'The Expanse', 'Piza Sukeruton']
    );
    
    console.log(`✅ Created The Expanse location: ${locationId}`);
    
    const result = await pool.query("SELECT location_id, name, realm FROM locations");
    console.log('All Locations:', result.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createExpanseLocation();
