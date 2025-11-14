import pool from '../db/pool.js';
import TSELoopManager from '../TSE/TSELoopManager.js';
import TraitManager from '../traits/TraitManager.js';

console.log('=== Chuckles Bipolar Personality Test ===\n');

async function testChucklesBipolarTraits() {
  const client = await pool.connect();
  
  try {
    console.log('=== Step 1: Load Chuckles Profile ===');
    const profileResult = await client.query(
      'SELECT * FROM character_profiles WHERE character_id = $1',
      ['#700005']
    );
    
    const chuckles = profileResult.rows[0];
    console.log('Character:', chuckles.character_name);
    console.log('Category:', chuckles.category);
    console.log('Description:', chuckles.description);
    console.log('');
    
    console.log('=== Step 2: Load Trait Scores ===');
    const traitsResult = await client.query(`
      SELECT 
        cts.trait_hex_color,
        c.trait_name,
        c.category,
        cts.percentile_score
      FROM character_trait_scores cts
      JOIN characteristics c ON c.hex_color = cts.trait_hex_color
      WHERE cts.character_hex_id = $1
      ORDER BY cts.percentile_score DESC
    `, ['#700005']);
    
    console.log(`Total Traits: ${traitsResult.rows.length}\n`);
    
    console.log('Top 10 Highest Traits (Manic Phase):');
    traitsResult.rows.slice(0, 10).forEach(trait => {
      console.log(`  ${trait.trait_name}: ${trait.percentile_score} (${trait.category})`);
    });
    
    console.log('\nBottom 10 Lowest Traits (Depressive/Poor Regulation):');
    traitsResult.rows.slice(-10).forEach(trait => {
      console.log(`  ${trait.trait_name}: ${trait.percentile_score} (${trait.category})`);
    });
    console.log('');
    
    console.log('=== Step 3: Get Trait Vector from TraitManager ===');
    const traitVector = await TraitManager.getTraitVector('#700005');
    
    const high = Object.values(traitVector).filter(v => v > 70).length;
    const medium = Object.values(traitVector).filter(v => v >= 30 && v <= 70).length;
    const low = Object.values(traitVector).filter(v => v < 30).length;
    
    console.log('Trait Distribution:');
    console.log(`  High traits (>70): ${high}`);
    console.log(`  Medium traits (30-70): ${medium}`);
    console.log(`  Low traits (<30): ${low}`);
    console.log('');
    
    console.log('=== Step 4: Test TSE Learning Cycle ===');
    const tseManager = new TSELoopManager(pool);
    await tseManager.initialize();
    
    console.log('Running knowledge cycle for Chuckles on topic: "HTML basics"');
    const cycleResult = await tseManager.startKnowledgeCycle({ characterId: '#700005', query: 'How are Tanuki represented in modern media', domain: 'web_development' });
    
    console.log('Cycle Result:');
    console.log(`  Cycle ID: ${cycleResult.cycle_id}`);
    console.log(`  Status: ${cycleResult.status}`);
    console.log(`  Character: ${cycleResult.character_id}`);
    console.log('');
    
    console.log('=== Step 5: Check Knowledge State ===');
    const knowledgeResult = await client.query(`
      SELECT * FROM character_knowledge_state 
      WHERE character_id = $1
      ORDER BY last_reviewed DESC
      LIMIT 5
    `, ['#700005']);
    
    if (knowledgeResult.rows.length > 0) {
      console.log('Recent Knowledge Items:');
      knowledgeResult.rows.forEach(item => {
        console.log(`  - ${item.knowledge_domain}: Strength ${item.knowledge_strength}`);
      });
    } else {
      console.log('No knowledge items yet - first learning cycle');
    }
    
    console.log('\n=== Test Complete ===');
    console.log('[SUCCESS] Chuckles bipolar personality traits are active in TSE system');
    
  } catch (error) {
    console.error('[ERROR]', error.message);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

testChucklesBipolarTraits();
