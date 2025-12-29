import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Negative emotion reinforcement utterances - Phase 3.2
// Second batch: frustration, upset, disappointment, stress, worry

const utterances = [
  // === FRUSTRATION (20) ===
  { utteranceText: "I'm really frustrated right now", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "This is so frustrating", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "I feel extremely frustrated", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "Everything feels frustrating", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm frustrated beyond belief", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "This situation is frustrating", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm getting very frustrated", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I feel stuck and frustrated", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "I'm deeply frustrated by this", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "This is incredibly frustrating", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.1 },
  { utteranceText: "I'm frustrated with everything", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I feel constant frustration", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm overwhelmed and frustrated", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "This keeps frustrating me", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm frustrated beyond words", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I feel pure frustration", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "This is frustrating me badly", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I'm very frustrated today", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "Frustration is overwhelming me", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm stuck feeling frustrated", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.3 },

  // === UPSET (15) ===
  { utteranceText: "I'm really upset", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "This has me very upset", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I feel extremely upset", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm deeply upset about this", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "This is upsetting me", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm so upset right now", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I feel really upset today", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "This makes me upset", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm emotionally upset", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.3 },
  { utteranceText: "I'm upset and drained", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.3 },
  { utteranceText: "This is very upsetting", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm feeling upset", padPleasure: -0.4, padArousal: 0.2, padDominance: -0.2 },
  { utteranceText: "I'm extremely upset", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "Everything feels upsetting", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.3 },
  { utteranceText: "I'm still upset", padPleasure: -0.4, padArousal: 0.2, padDominance: -0.2 },

  // === DISAPPOINTMENT (15) ===
  { utteranceText: "I'm really disappointed", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "This is disappointing", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I feel deeply disappointed", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "I'm disappointed in this", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "This feels disappointing", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm very disappointed", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "I'm disappointed again", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "This outcome is disappointing", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I feel let down", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "I'm feeling disappointed", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "That was disappointing", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm crushed and disappointed", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "I feel disappointed today", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "This is deeply disappointing", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "I'm honestly disappointed", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },

  // === STRESS (12) ===
  { utteranceText: "I'm extremely stressed", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This is stressing me out", padPleasure: -0.4, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I'm stressed beyond limits", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I feel constantly stressed", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "Everything feels stressful", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm under so much stress", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This situation is stressful", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm mentally stressed", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I feel overwhelmed and stressed", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I'm completely stressed out", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "Stress is crushing me", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I'm severely stressed", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },

  // === WORRY (15) ===
  { utteranceText: "I'm really worried", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I feel worried about this", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm constantly worried", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "This has me worried", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "I'm very worried right now", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I can't stop worrying", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I'm worried sick", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "This is worrying me", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm deeply worried", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "I feel so worried", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm worried all the time", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "This makes me worried", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm worried constantly", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "I feel nothing but worry", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "Worry is consuming me", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.4 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting Negative Emotion Reinforcement Batch 2 import...');
    console.log(`Total utterances to import: ${utterances.length}`);
    await client.query('BEGIN');

    let added = 0;
    let skipped = 0;

    for (const u of utterances) {
      // Check for duplicates
      const existing = await client.query(
        'SELECT 1 FROM ltlm_training_examples WHERE utterance_text = $1',
        [u.utteranceText]
      );

      if (existing.rows.length > 0) {
        skipped++;
        continue;
      }

      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples
        (training_example_id,
         speaker_character_id,
         utterance_text,
         dialogue_function_code,
         speech_act_code,
         narrative_function_code,
         pad_pleasure,
         pad_arousal,
         pad_dominance,
         emotion_register_id,
         source,
         is_canonical,
         difficulty,
         tags,
         category_confidence,
         notes,
         created_by)
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      `;

      const tags = ['ltlm', 'user_emotion', 'pad_training', 'negative_reinforcement'];
      const source = 'user_emotion_lexicon.phase3_reinforcement_batch2';
      const notes = 'Negative emotion reinforcement batch 2 - frustration, upset, disappointment, stress, worry';

      await client.query(insertExampleSql, [
        trainingExampleId,
        '700002',
        u.utteranceText,
        'expressive.self_disclosure',
        'expressive',
        null,
        u.padPleasure,
        u.padArousal,
        u.padDominance,
        null,
        source,
        true,
        1,
        tags,
        1.0,
        notes,
        '700002',
      ]);

      added++;
    }

    await client.query('COMMIT');
    console.log(`\nBatch 2 import committed successfully.`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped (duplicates): ${skipped}`);

    // Show updated word distribution
    const wordStats = await client.query(`
      SELECT 
        CASE 
          WHEN utterance_text ILIKE '%frustrat%' THEN 'frustrat*'
          WHEN utterance_text ILIKE '%upset%' THEN 'upset'
          WHEN utterance_text ILIKE '%disappoint%' THEN 'disappoint*'
          WHEN utterance_text ILIKE '%stress%' THEN 'stress*'
          WHEN utterance_text ILIKE '%worr%' THEN 'worry*'
          ELSE 'other'
        END as word_group,
        COUNT(*) as total,
        SUM(CASE WHEN pad_pleasure < 0 THEN 1 ELSE 0 END) as negative,
        SUM(CASE WHEN pad_pleasure >= 0 THEN 1 ELSE 0 END) as non_negative,
        ROUND(AVG(pad_pleasure)::numeric, 3) as avg_p
      FROM ltlm_training_examples
      WHERE utterance_text ILIKE '%frustrat%' 
         OR utterance_text ILIKE '%upset%'
         OR utterance_text ILIKE '%disappoint%'
         OR utterance_text ILIKE '%stress%'
         OR utterance_text ILIKE '%worr%'
      GROUP BY word_group
      ORDER BY word_group
    `);

    console.log('\nWord Group Distribution:');
    console.table(wordStats.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Batch 2 import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => {
    console.log('\nBatch 2 import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in batch import script');
    console.error(err);
    process.exitCode = 1;
  });
