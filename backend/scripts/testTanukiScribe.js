import SemanticEmbedder from '../services/SemanticEmbedder.js';
import padEstimator from '../services/padEstimator.js';
import TanukiScribe from '../services/TanukiScribe.js';
import pool from '../db/pool.js';

async function testScribe() {
  console.log('--- Booting AI Core ---');
  
  // 1. Train models (Required for Scribe to work)
  await padEstimator.train();
  await SemanticEmbedder.train();

  console.log('\n--- Starting Tanuki Scribe Test ---');

  // 2. Pick a donor utterance
  // We'll grab a "Neutral" utterance and try to make it "Happier"
  const donorRes = await pool.query(
    `SELECT training_example_id, utterance_text, pad_pleasure 
     FROM ltlm_training_examples 
     WHERE pad_pleasure BETWEEN 0 AND 0.2 
     AND length(utterance_text) > 20 
     LIMIT 1`
  );

  if (donorRes.rows.length === 0) {
      console.log('No suitable donor found.');
      return;
  }

  const donor = donorRes.rows[0];
  console.log(`DONOR: [${donor.training_example_id}] "${donor.utterance_text}" (P: ${donor.pad_pleasure})`);

  // 3. Define a Target PAD (High Pleasure, High Arousal)
  const targetPad = { p: 0.8, a: 0.6, d: 0.3 };
  console.log('TARGET: High Pleasure/Arousal');

  // 4. Run Scribe
  const result = await TanukiScribe.scribbleVariant(donor.training_example_id, targetPad);

  if (result) {
      console.log('\n--- MUTATION SUCCESSFUL ---');
      console.log(`Original: "${result.original}"`);
      console.log(`Variant:  "${result.text}"`);
      console.log(`Change:   ${result.changed}`);
      console.log(`New PAD:  P:${result.pad.p.toFixed(2)} A:${result.pad.a.toFixed(2)}`);
      console.log(`Semantic Similarity: ${result.semanticScore.toFixed(3)}`);
  } else {
      console.log('\n--- NO MUTATION POSSIBLE ---');
      console.log('Constraints too strict or no synonyms found.');
  }

  await pool.end();
}

testScribe();
