import UserPadInitializer from '../services/UserPadInitializer.js';
import pool from '../db/pool.js';

async function main() {
  console.log('--- Starting PAD Awareness Backfill ---');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    const result = await UserPadInitializer.backfillAllUsers();
    console.log('--- Backfill Completed Successfully ---');
    console.log(`Summary: ${result.success} success, ${result.failed} failed`);
    
    if (result.errors.length > 0) {
      console.log('Errors:', JSON.stringify(result.errors, null, 2));
    }
  } catch (err) {
    console.error('Fatal Error during backfill:', err);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
