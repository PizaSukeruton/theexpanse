import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// User emotion training examples - PAD values based on ANEW research
// These train the padEstimator to recognize negative emotions
// Speaker is still Claude (700002) - these represent what Claude might hear/respond to

const utterances = [
  // === NEGATIVE EMOTIONS (Low Pleasure) ===
  // Sadness (Low P, Low A, Low D)
  { utteranceText: "I feel so sad right now", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.4 },
  { utteranceText: "I'm really depressed about this", padPleasure: -0.7, padArousal: -0.4, padDominance: -0.5 },
  { utteranceText: "This makes me feel terrible", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "I'm so unhappy", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "I feel down today", padPleasure: -0.5, padArousal: -0.3, padDominance: -0.3 },
  { utteranceText: "Everything feels hopeless", padPleasure: -0.7, padArousal: -0.4, padDominance: -0.6 },
  { utteranceText: "I'm feeling really low", padPleasure: -0.5, padArousal: -0.3, padDominance: -0.4 },
  { utteranceText: "This is making me miserable", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "I feel empty inside", padPleasure: -0.6, padArousal: -0.5, padDominance: -0.5 },
  { utteranceText: "I'm heartbroken", padPleasure: -0.7, padArousal: -0.2, padDominance: -0.5 },
  
  // Anger (Low P, High A, Variable D)
  { utteranceText: "I'm so angry right now", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.3 },
  { utteranceText: "This is infuriating", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.2 },
  { utteranceText: "I'm furious about this", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.3 },
  { utteranceText: "This makes me so mad", padPleasure: -0.6, padArousal: 0.6, padDominance: 0.2 },
  { utteranceText: "I'm really pissed off", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I hate this so much", padPleasure: -0.7, padArousal: 0.6, padDominance: 0.1 },
  { utteranceText: "This is absolutely outrageous", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I can't believe how unfair this is", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.1 },
  { utteranceText: "I'm seething with rage", padPleasure: -0.8, padArousal: 0.9, padDominance: 0.3 },
  { utteranceText: "This makes my blood boil", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.2 },

  // Frustration (Low P, Medium A, Low D)
  { utteranceText: "This is so frustrating", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I'm really frustrated with this", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "Why won't this work", padPleasure: -0.4, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I keep trying but nothing helps", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.4 },
  { utteranceText: "This is driving me crazy", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "I'm at my wit's end", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "Nothing is going right", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.4 },
  { utteranceText: "I feel stuck and helpless", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.5 },
  { utteranceText: "This is annoying me", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "I'm getting really irritated", padPleasure: -0.4, padArousal: 0.5, padDominance: -0.1 },

  // Fear/Anxiety (Low P, High A, Low D)
  { utteranceText: "I'm scared", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.5 },
  { utteranceText: "I'm really anxious about this", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This is terrifying", padPleasure: -0.6, padArousal: 0.8, padDominance: -0.6 },
  { utteranceText: "I'm worried something bad will happen", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I feel panicked", padPleasure: -0.6, padArousal: 0.8, padDominance: -0.5 },
  { utteranceText: "I'm dreading this", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I can't stop worrying", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I feel overwhelmed with fear", padPleasure: -0.6, padArousal: 0.7, padDominance: -0.6 },
  { utteranceText: "This is making me nervous", padPleasure: -0.4, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "I'm frightened", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.5 },

  // Disappointment (Low P, Low A, Low D)
  { utteranceText: "I'm so disappointed", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "This is really disappointing", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I expected better", padPleasure: -0.4, padArousal: 0.1, padDominance: -0.1 },
  { utteranceText: "I feel let down", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "This didn't turn out how I hoped", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I'm disheartened", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "That was a letdown", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I feel defeated", padPleasure: -0.5, padArousal: -0.3, padDominance: -0.5 },
  { utteranceText: "I'm crushed", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.5 },
  { utteranceText: "This is underwhelming", padPleasure: -0.3, padArousal: -0.2, padDominance: -0.1 },

  // === POSITIVE EMOTIONS (High Pleasure) ===
  // Joy/Happiness (High P, Medium-High A, Medium D)
  { utteranceText: "I'm so happy right now", padPleasure: 0.7, padArousal: 0.5, padDominance: 0.3 },
  { utteranceText: "This is wonderful", padPleasure: 0.7, padArousal: 0.4, padDominance: 0.3 },
  { utteranceText: "I feel amazing", padPleasure: 0.8, padArousal: 0.6, padDominance: 0.4 },
  { utteranceText: "I'm thrilled about this", padPleasure: 0.7, padArousal: 0.6, padDominance: 0.3 },
  { utteranceText: "This makes me so joyful", padPleasure: 0.7, padArousal: 0.5, padDominance: 0.3 },
  { utteranceText: "I'm overjoyed", padPleasure: 0.8, padArousal: 0.7, padDominance: 0.3 },
  { utteranceText: "I feel blessed", padPleasure: 0.6, padArousal: 0.3, padDominance: 0.2 },
  { utteranceText: "This is the best day ever", padPleasure: 0.8, padArousal: 0.7, padDominance: 0.4 },
  { utteranceText: "I'm on cloud nine", padPleasure: 0.8, padArousal: 0.6, padDominance: 0.4 },
  { utteranceText: "I feel fantastic", padPleasure: 0.8, padArousal: 0.6, padDominance: 0.4 },

  // Excitement (High P, High A, Medium D)
  { utteranceText: "I'm so excited", padPleasure: 0.7, padArousal: 0.8, padDominance: 0.3 },
  { utteranceText: "This is amazing", padPleasure: 0.7, padArousal: 0.6, padDominance: 0.3 },
  { utteranceText: "I can't wait", padPleasure: 0.6, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I'm pumped up", padPleasure: 0.6, padArousal: 0.8, padDominance: 0.4 },
  { utteranceText: "This is exhilarating", padPleasure: 0.7, padArousal: 0.8, padDominance: 0.3 },
  { utteranceText: "I'm buzzing with excitement", padPleasure: 0.7, padArousal: 0.8, padDominance: 0.3 },
  { utteranceText: "I'm stoked about this", padPleasure: 0.6, padArousal: 0.7, padDominance: 0.3 },
  { utteranceText: "This is incredible", padPleasure: 0.7, padArousal: 0.7, padDominance: 0.3 },
  { utteranceText: "I'm fired up", padPleasure: 0.6, padArousal: 0.8, padDominance: 0.4 },
  { utteranceText: "I'm ecstatic", padPleasure: 0.8, padArousal: 0.8, padDominance: 0.4 },

  // Gratitude (High P, Low A, Low D)
  { utteranceText: "I'm so grateful", padPleasure: 0.6, padArousal: 0.2, padDominance: 0.0 },
  { utteranceText: "Thank you so much", padPleasure: 0.6, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I really appreciate this", padPleasure: 0.5, padArousal: 0.2, padDominance: 0.0 },
  { utteranceText: "This means so much to me", padPleasure: 0.6, padArousal: 0.3, padDominance: 0.0 },
  { utteranceText: "I'm thankful for your help", padPleasure: 0.5, padArousal: 0.2, padDominance: -0.1 },
  { utteranceText: "I feel blessed to have this", padPleasure: 0.6, padArousal: 0.2, padDominance: 0.0 },
  { utteranceText: "I can't thank you enough", padPleasure: 0.6, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "You've been so helpful", padPleasure: 0.5, padArousal: 0.2, padDominance: 0.0 },
  { utteranceText: "I'm deeply appreciative", padPleasure: 0.6, padArousal: 0.2, padDominance: 0.0 },
  { utteranceText: "This is such a gift", padPleasure: 0.6, padArousal: 0.3, padDominance: 0.0 },

  // Calm/Peace (Medium P, Low A, Medium D)
  { utteranceText: "I feel calm", padPleasure: 0.4, padArousal: -0.4, padDominance: 0.2 },
  { utteranceText: "I'm at peace", padPleasure: 0.5, padArousal: -0.5, padDominance: 0.3 },
  { utteranceText: "I feel relaxed", padPleasure: 0.5, padArousal: -0.5, padDominance: 0.2 },
  { utteranceText: "I'm feeling serene", padPleasure: 0.5, padArousal: -0.5, padDominance: 0.3 },
  { utteranceText: "Everything feels okay", padPleasure: 0.3, padArousal: -0.3, padDominance: 0.2 },
  { utteranceText: "I'm content", padPleasure: 0.4, padArousal: -0.3, padDominance: 0.2 },
  { utteranceText: "I feel centered", padPleasure: 0.4, padArousal: -0.4, padDominance: 0.3 },
  { utteranceText: "I'm feeling tranquil", padPleasure: 0.5, padArousal: -0.5, padDominance: 0.3 },
  { utteranceText: "I feel grounded", padPleasure: 0.4, padArousal: -0.4, padDominance: 0.3 },
  { utteranceText: "I'm comfortable with this", padPleasure: 0.4, padArousal: -0.3, padDominance: 0.2 },

  // Confidence (Medium P, Medium A, High D)
  { utteranceText: "I feel confident about this", padPleasure: 0.5, padArousal: 0.3, padDominance: 0.6 },
  { utteranceText: "I can do this", padPleasure: 0.5, padArousal: 0.4, padDominance: 0.6 },
  { utteranceText: "I'm ready for this", padPleasure: 0.5, padArousal: 0.4, padDominance: 0.5 },
  { utteranceText: "I believe in myself", padPleasure: 0.5, padArousal: 0.3, padDominance: 0.6 },
  { utteranceText: "I've got this handled", padPleasure: 0.5, padArousal: 0.3, padDominance: 0.6 },
  { utteranceText: "I'm feeling strong", padPleasure: 0.5, padArousal: 0.4, padDominance: 0.6 },
  { utteranceText: "I know what I'm doing", padPleasure: 0.5, padArousal: 0.3, padDominance: 0.7 },
  { utteranceText: "I'm capable of this", padPleasure: 0.5, padArousal: 0.3, padDominance: 0.6 },
  { utteranceText: "I feel empowered", padPleasure: 0.6, padArousal: 0.4, padDominance: 0.6 },
  { utteranceText: "I'm in control", padPleasure: 0.4, padArousal: 0.2, padDominance: 0.7 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting User Emotion Training Data batch import...');
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
      const narrativeFunctionCode = null;
      const emotionRegisterId = null;

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

      // Determine sentiment tag
      const sentimentTag = u.padPleasure < -0.3 ? 'negative_emotion' : 
                          u.padPleasure > 0.3 ? 'positive_emotion' : 'neutral_emotion';
      
      const tags = ['ltlm', 'user_emotion', 'pad_training', sentimentTag];
      const source = 'user_emotion_lexicon.phase3';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = 'ANEW-based PAD values for user emotion detection training';
      const createdBy = '700002';

      await client.query(insertExampleSql, [
        trainingExampleId,
        '700002',                        // speaker_character_id (Claude)
        u.utteranceText,
        'expressive.self_disclosure',    // dialogue_function_code
        'expressive',                    // speech_act_code
        narrativeFunctionCode,
        u.padPleasure,
        u.padArousal,
        u.padDominance,
        emotionRegisterId,
        source,
        isCanonical,
        difficulty,
        tags,
        categoryConfidence,
        notes,
        createdBy,
      ]);

      added++;
    }

    await client.query('COMMIT');
    console.log(`User Emotion Training Data batch import committed successfully.`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped (duplicates): ${skipped}`);

    // Validation: Show new distribution
    const stats = await client.query(`
      SELECT 
        CASE 
          WHEN pad_pleasure < -0.3 THEN 'negative'
          WHEN pad_pleasure > 0.3 THEN 'positive'
          ELSE 'neutral'
        END as sentiment,
        COUNT(*) as count,
        ROUND(AVG(pad_pleasure)::numeric, 3) as avg_p,
        ROUND(AVG(pad_arousal)::numeric, 3) as avg_a,
        ROUND(AVG(pad_dominance)::numeric, 3) as avg_d
      FROM ltlm_training_examples
      WHERE pad_pleasure IS NOT NULL
      GROUP BY sentiment
      ORDER BY avg_p
    `);

    console.log('\nNew PAD Distribution:');
    console.table(stats.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('User Emotion batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => {
    console.log('User Emotion Training Data batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in User Emotion batch import script');
    console.error(err);
    process.exitCode = 1;
  });
