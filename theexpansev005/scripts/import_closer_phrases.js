import fs from 'fs';
import path from 'path';
import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const closerPhrases = [
  {
    text: "So that's the essence of it.",
    role: "closer",
    outcome_intent: "clarity",
    strategy: "info",
    tone: "neutral",
    formality: "casual",
    language: "en-AU",
    created_by: "EXT_HELPER_01",
    is_canonical: true
  },
  {
    text: "That covers the main points.",
    role: "closer",
    outcome_intent: "clarity",
    strategy: "info",
    tone: "neutral",
    formality: "casual",
    language: "en-AU",
    created_by: "EXT_HELPER_01",
    is_canonical: true
  },
  {
    text: "Now you have the core idea.",
    role: "closer",
    outcome_intent: "clarity",
    strategy: "info",
    tone: "neutral",
    formality: "casual",
    language: "en-AU",
    created_by: "EXT_HELPER_01",
    is_canonical: true
  },
  {
    text: "That's the fundamental concept.",
    role: "closer",
    outcome_intent: "clarity",
    strategy: "info",
    tone: "neutral",
    formality: "casual",
    language: "en-AU",
    created_by: "EXT_HELPER_01",
    is_canonical: true
  },
  {
    text: "There's the complete picture.",
    role: "closer",
    outcome_intent: "clarity",
    strategy: "info",
    tone: "neutral",
    formality: "casual",
    language: "en-AU",
    created_by: "EXT_HELPER_01",
    is_canonical: true
  }
];

async function importClosers() {
  const client = await pool.connect();
  let totalImported = 0;
  
  try {
    await client.query('BEGIN');
    
    console.log(`[Import] Importing ${closerPhrases.length} closer phrases...`);
    
    for (const phrase of closerPhrases) {
      const hexId = await generateHexId('learning_vocabulary_id');
      
      const insertQuery = `
        INSERT INTO conversational_phrases 
        (phrase_hex_id, text, role, outcome_intent, strategy, tone, formality, language, created_by, is_canonical)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      const values = [
        hexId,
        phrase.text,
        phrase.role,
        phrase.outcome_intent,
        phrase.strategy,
        phrase.tone,
        phrase.formality,
        phrase.language,
        phrase.created_by,
        phrase.is_canonical
      ];
      
      await client.query(insertQuery, values);
      totalImported++;
    }
    
    await client.query('COMMIT');
    console.log(`[Import] Success! Imported ${totalImported} closer phrases.`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[Import] Error: ${err.message}`);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

importClosers().catch(console.error);
