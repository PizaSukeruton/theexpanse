// batchImportOmiyagePhrases.js
// Imports Omiyage phrases into conversational_phrases table
// Uses proper hex ID generation via learning_vocabulary_id purpose

import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const phrases = [
  // GIFT OFFER - Openers
  { role: 'opener', text: 'I brought something back from my travels…', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_offer' },
  { role: 'opener', text: 'Before we begin, I have a small tradition…', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_offer' },
  { role: 'opener', text: 'Ah, a new traveler! The spirits told me you were coming…', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_offer' },
  { role: 'opener', text: 'In my culture, we welcome guests with a gift…', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_offer' },
  
  // GIFT OFFER - Closers
  { role: 'closer', text: 'Pick a number, any number. Trust your instincts.', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_offer' },
  { role: 'closer', text: 'Choose wisely, or let fate decide.', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_offer' },
  { role: 'closer', text: 'The choice is yours. No peeking!', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_offer' },

  // GIFT REVEAL - Openers
  { role: 'opener', text: 'Ah, you\'ve chosen…', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_reveal' },
  { role: 'opener', text: 'The spirits guided your hand to…', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_reveal' },
  { role: 'opener', text: 'An excellent choice! You receive…', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_reveal' },
  { role: 'opener', text: 'Fate has spoken! Behold…', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_reveal' },
  
  // GIFT REVEAL - Closers
  { role: 'closer', text: 'May it bring you fortune on your journey.', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_reveal' },
  { role: 'closer', text: 'A worthy gift for a worthy traveler.', tone: 'playful', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_reveal' },
  { role: 'closer', text: 'Treat it well, and it will treat you well.', tone: 'warm', formality: 'casual', outcome_intent: 'connection', strategy: 'gift_reveal' },

  // GIFT DECLINE - Openers
  { role: 'opener', text: 'I understand completely.', tone: 'warm', formality: 'casual', outcome_intent: 'validation', strategy: 'gift_decline' },
  { role: 'opener', text: 'No obligation, truly.', tone: 'neutral', formality: 'casual', outcome_intent: 'validation', strategy: 'gift_decline' },
  { role: 'opener', text: 'A wise traveler knows their own path.', tone: 'warm', formality: 'casual', outcome_intent: 'validation', strategy: 'gift_decline' },
  
  // GIFT DECLINE - Closers
  { role: 'closer', text: 'The offer remains, should you change your mind.', tone: 'warm', formality: 'casual', outcome_intent: 'validation', strategy: 'gift_decline' },
  { role: 'closer', text: 'Perhaps another time, then.', tone: 'neutral', formality: 'casual', outcome_intent: 'validation', strategy: 'gift_decline' },
  { role: 'closer', text: 'Your journey continues all the same.', tone: 'warm', formality: 'casual', outcome_intent: 'validation', strategy: 'gift_decline' },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting Omiyage phrases batch import...');
    await client.query('BEGIN');

    for (const p of phrases) {
      const phraseHexId = await generateHexId('learning_vocabulary_id');
      
      const insertSql = `
        INSERT INTO conversational_phrases (
          phrase_hex_id,
          text,
          role,
          outcome_intent,
          strategy,
          tone,
          formality,
          language,
          tags,
          created_by,
          is_canonical
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      await client.query(insertSql, [
        phraseHexId,
        p.text,
        p.role,
        p.outcome_intent,
        p.strategy,
        p.tone,
        p.formality,
        'en',
        JSON.stringify(['omiyage', p.strategy]),
        '700002',  // Claude
        true
      ]);
      
      console.log(`  ✓ Inserted ${phraseHexId}: ${p.role} for ${p.strategy}`);
    }

    await client.query('COMMIT');
    console.log(`\nOmiyage phrases batch import committed successfully. ${phrases.length} phrases added.`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Omiyage phrases batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('Omiyage phrases batch import script finished.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Unexpected error in Omiyage phrases batch import script');
    console.error(err);
    process.exit(1);
  });
