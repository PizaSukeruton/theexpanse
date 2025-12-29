import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Negative emotion reinforcement utterances - Phase 3.1
// Purpose: Outweigh Claude's empathetic responses containing negative emotion words
// These ensure words like "frustrated", "upset", "worried" train as negative

const utterances = [
  // === FRUSTRATED (20 utterances) ===
  { utteranceText: "I'm really frustrated right now", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "This is so frustrating", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "I'm getting frustrated again", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "This keeps frustrating me", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm frustrated with everything", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "This situation is frustrating me", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I'm feeling pretty frustrated", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "This is just frustrating", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm super frustrated today", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "Why is everything so frustrating", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "This is driving me nuts", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I'm annoyed and frustrated", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "It's frustrating how slow this is", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm beyond frustrated now", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "This frustration is killing me", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I'm so frustrated I can't think", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "Everything's frustrating me today", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I'm sick of being frustrated", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "This is incredibly frustrating", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "I'm frustrated beyond words", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.3 },

  // === UPSET (15 utterances) ===
  { utteranceText: "I'm really upset right now", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "This makes me so upset", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "I'm feeling upset about this", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.2 },
  { utteranceText: "I'm upset and I don't know why", padPleasure: -0.4, padArousal: 0.2, padDominance: -0.2 },
  { utteranceText: "This whole thing is upsetting", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm pretty upset right now", padPleasure: -0.4, padArousal: 0.2, padDominance: -0.1 },
  { utteranceText: "I'm upset with myself", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.3 },
  { utteranceText: "This is upsetting me a lot", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm getting really upset", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I'm so upset I could cry", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.4 },
  { utteranceText: "This situation upsets me", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.2 },
  { utteranceText: "I'm upset and tired of it", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.3 },
  { utteranceText: "Everything is upsetting me", padPleasure: -0.4, padArousal: 0.2, padDominance: -0.2 },
  { utteranceText: "I'm deeply upset about this", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "This really upsets me", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },

  // === DISAPPOINTED (13 utterances) ===
  { utteranceText: "I'm disappointed in myself", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "I'm so disappointed right now", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "This is really disappointing", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I feel disappointed again", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm disappointed with this", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "This outcome disappoints me", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm feeling disappointed today", padPleasure: -0.4, padArousal: -0.2, padDominance: -0.2 },
  { utteranceText: "This is such a disappointment", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm let down and disappointed", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "This really disappointed me", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm deeply disappointed", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "I'm disappointed and hurt", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "This is so disappointing", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },

  // === STRESSED (10 utterances) ===
  { utteranceText: "I'm stressed out right now", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This is stressing me out", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I'm really stressed today", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "Everything is stressing me", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I'm stressed beyond belief", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This stress is killing me", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I'm feeling stressed again", padPleasure: -0.4, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "Work is stressing me out", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I'm under so much stress", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This is too stressful", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },

  // === WORRIED (9 utterances) ===
  { utteranceText: "I'm worried about this", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm so worried right now", padPleasure: -0.4, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I can't stop worrying", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm worried something bad will happen", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I'm really worried about it", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "This is making me worry", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm worried all the time", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I keep worrying about this", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm feeling worried again", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.3 },

  // === ANXIOUS (9 utterances) ===
  { utteranceText: "I'm anxious about tomorrow", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "My anxiety is bad today", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I'm feeling anxious right now", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This makes me anxious", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I'm so anxious I can't sleep", padPleasure: -0.6, padArousal: 0.7, padDominance: -0.5 },
  { utteranceText: "My anxiety is through the roof", padPleasure: -0.6, padArousal: 0.7, padDominance: -0.5 },
  { utteranceText: "I'm anxious and restless", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This situation is making me anxious", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I'm getting anxious again", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },

  // === ANGRY (10 utterances) ===
  { utteranceText: "I'm really angry right now", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "This makes me so angry", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I'm angry and I hate this", padPleasure: -0.7, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I'm furious about this", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.3 },
  { utteranceText: "This is making me angry", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.1 },
  { utteranceText: "I'm so mad right now", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I'm angry at everything", padPleasure: -0.6, padArousal: 0.6, padDominance: 0.2 },
  { utteranceText: "This anger is overwhelming", padPleasure: -0.7, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I'm seething with anger", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.3 },
  { utteranceText: "I'm boiling mad", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.2 },

  // === ANNOYED (10 utterances) ===
  { utteranceText: "This is so annoying", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm annoyed right now", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "This annoys me so much", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "Everything is annoying me", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm getting annoyed again", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "This is really annoying", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm annoyed and tired", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "This annoys the hell out of me", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "I'm so annoyed I can't focus", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "This is annoying as hell", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.1 },

  // === SAD (9 utterances) ===
  { utteranceText: "I'm just feeling sad today", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.2 },
  { utteranceText: "I feel really sad right now", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "This makes me sad", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm sad and lonely", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.4 },
  { utteranceText: "Everything feels sad", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.2 },
  { utteranceText: "I'm feeling sad again", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.2 },
  { utteranceText: "This is making me sad", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I feel so sad inside", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.3 },
  { utteranceText: "I'm sad about everything", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },

  // === OTHER NEGATIVE (19 utterances) ===
  { utteranceText: "I'm feeling hopeless today", padPleasure: -0.6, padArousal: -0.4, padDominance: -0.5 },
  { utteranceText: "This is hopeless", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.5 },
  { utteranceText: "I feel completely defeated", padPleasure: -0.7, padArousal: -0.3, padDominance: -0.6 },
  { utteranceText: "I'm overwhelmed and exhausted", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.5 },
  { utteranceText: "I feel miserable right now", padPleasure: -0.7, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "This is making me bitter", padPleasure: -0.5, padArousal: 0.1, padDominance: -0.2 },
  { utteranceText: "I'm resentful about this", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.1 },
  { utteranceText: "I dread doing this", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "I'm feeling drained", padPleasure: -0.5, padArousal: -0.3, padDominance: -0.4 },
  { utteranceText: "I feel so empty", padPleasure: -0.6, padArousal: -0.4, padDominance: -0.5 },
  { utteranceText: "I'm completely burned out", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.5 },
  { utteranceText: "This is crushing me", padPleasure: -0.7, padArousal: -0.1, padDominance: -0.5 },
  { utteranceText: "I feel totally numb", padPleasure: -0.6, padArousal: -0.4, padDominance: -0.5 },
  { utteranceText: "I'm losing hope", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.5 },
  { utteranceText: "This is unbearable", padPleasure: -0.7, padArousal: 0.3, padDominance: -0.6 },
  { utteranceText: "I feel trapped", padPleasure: -0.6, padArousal: 0.2, padDominance: -0.6 },
  { utteranceText: "I'm at my breaking point", padPleasure: -0.7, padArousal: 0.4, padDominance: -0.5 },
  { utteranceText: "I can't take this anymore", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.5 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting Negative Emotion Reinforcement batch import...');
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
      const source = 'user_emotion_lexicon.phase3_reinforcement';
      const notes = 'Negative emotion reinforcement to outweigh Claude empathetic response contamination';

      await client.query(insertExampleSql, [
        trainingExampleId,
        '700002',                        // speaker_character_id (Claude)
        u.utteranceText,
        'expressive.self_disclosure',    // dialogue_function_code
        'expressive',                    // speech_act_code
        null,                            // narrative_function_code
        u.padPleasure,
        u.padArousal,
        u.padDominance,
        null,                            // emotion_register_id
        source,
        true,                            // is_canonical
        1,                               // difficulty
        tags,
        1.0,                             // category_confidence
        notes,
        '700002',                        // created_by
      ]);

      added++;
    }

    await client.query('COMMIT');
    console.log(`\nNegative Emotion Reinforcement batch import committed successfully.`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped (duplicates): ${skipped}`);

    // Validation: Show distribution by target word
    const wordStats = await client.query(`
      SELECT 
        CASE 
          WHEN utterance_text ILIKE '%frustrat%' THEN 'frustrat*'
          WHEN utterance_text ILIKE '%upset%' THEN 'upset'
          WHEN utterance_text ILIKE '%disappoint%' THEN 'disappoint*'
          WHEN utterance_text ILIKE '%stress%' THEN 'stress*'
          WHEN utterance_text ILIKE '%worr%' THEN 'worry*'
          WHEN utterance_text ILIKE '%anxious%' OR utterance_text ILIKE '%anxiety%' THEN 'anxious'
          WHEN utterance_text ILIKE '%angry%' OR utterance_text ILIKE '%anger%' THEN 'angry'
          WHEN utterance_text ILIKE '%annoy%' THEN 'annoy*'
          WHEN utterance_text ILIKE '%sad%' THEN 'sad'
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
         OR utterance_text ILIKE '%anxious%'
         OR utterance_text ILIKE '%anxiety%'
         OR utterance_text ILIKE '%angry%'
         OR utterance_text ILIKE '%anger%'
         OR utterance_text ILIKE '%annoy%'
         OR utterance_text ILIKE '%sad%'
      GROUP BY word_group
      ORDER BY word_group
    `);

    console.log('\nWord Group Distribution (negative vs non-negative):');
    console.table(wordStats.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Negative Emotion Reinforcement batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => {
    console.log('\nNegative Emotion Reinforcement batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in batch import script');
    console.error(err);
    process.exitCode = 1;
  });
