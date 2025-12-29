import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function fixDialogueFunctionIds() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Add missing parent categories
    const expressiveParentId = await generateHexId('dialogue_function_id');
    await client.query(
      `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'expressive', 'Expressive', 'Emotional and expressive dialogue functions', true, NOW())`,
      [expressiveParentId]
    );
    console.log(`Added expressive parent: ${expressiveParentId}`);
    
    const metacomParentId = await generateHexId('dialogue_function_id');
    await client.query(
      `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'metacommunication', 'Metacommunication', 'Learning and meta-conversation functions', true, NOW())`,
      [metacomParentId]
    );
    console.log(`Added metacommunication parent: ${metacomParentId}`);
    
    // 2. Fix the 8 expressive child functions with text IDs
    const expressiveFunctions = [
      'expressive.comfort',
      'expressive.console',
      'expressive.empathize',
      'expressive.encourage',
      'expressive.praise',
      'expressive.self_disclosure',
      'expressive.sympathize',
      'expressive.wish'
    ];
    
    for (const code of expressiveFunctions) {
      const newId = await generateHexId('dialogue_function_id');
      await client.query(
        `UPDATE dialogue_function_categories 
         SET dialogue_function_id = $1 
         WHERE category_code = $2`,
        [newId, code]
      );
      console.log(`Fixed ${code}: ${newId}`);
    }
    
    // 3. Fix metacommunication.learning_request (wrong hex range #DF0100)
    const learningRequestId = await generateHexId('dialogue_function_id');
    await client.query(
      `UPDATE dialogue_function_categories 
       SET dialogue_function_id = $1 
       WHERE category_code = 'metacommunication.learning_request'`,
      [learningRequestId]
    );
    console.log(`Fixed metacommunication.learning_request: ${learningRequestId}`);
    
    await client.query('COMMIT');
    console.log('All fixes committed successfully');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error fixing dialogue function IDs:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

fixDialogueFunctionIds();
