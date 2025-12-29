import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Negative emotion reinforcement utterances - Phase 3.3
// Third batch from external AI

const utterances = [
  // === FRUSTRATION (20) ===
  { utteranceText: "I am so frustrated right now", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "This situation is incredibly frustrating", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I feel completely frustrated by this", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "It is frustrating when nothing works", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "My frustration is building up", padPleasure: -0.5, padArousal: 0.5, padDominance: 0.0 },
  { utteranceText: "I'm getting really frustrated", padPleasure: -0.4, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "This delay is so frustrating", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I am frustrated beyond belief", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.1 },
  { utteranceText: "Just feeling extremely frustrated today", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "The lack of progress is frustrating", padPleasure: -0.4, padArousal: 0.2, padDominance: -0.2 },
  { utteranceText: "I'm frustrated with myself", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "Everything is just frustrating me", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "This is a frustrating experience", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I can't hide my frustration", padPleasure: -0.5, padArousal: 0.4, padDominance: 0.0 },
  { utteranceText: "So frustrated I could scream", padPleasure: -0.6, padArousal: 0.6, padDominance: 0.1 },
  { utteranceText: "Dealing with this is frustrating", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm frustrated and tired", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.4 },
  { utteranceText: "Why is this so frustrating", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "It's frustrating being ignored", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "My frustration level is high", padPleasure: -0.5, padArousal: 0.5, padDominance: 0.0 },

  // === UPSET (15) ===
  { utteranceText: "I am very upset about this", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "This whole thing is upsetting", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I feel really upset right now", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "It upsets me to see this", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.2 },
  { utteranceText: "I'm upset and I can't sleep", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "Just feeling deeply upset", padPleasure: -0.6, padArousal: 0.2, padDominance: -0.4 },
  { utteranceText: "This news has me upset", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I'm visibly upset", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.1 },
  { utteranceText: "I am too upset to talk", padPleasure: -0.7, padArousal: 0.3, padDominance: -0.4 },
  { utteranceText: "Being this upset is draining", padPleasure: -0.6, padArousal: 0.2, padDominance: -0.4 },
  { utteranceText: "I'm upset with how this went", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "It's upsetting to be treated this way", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I'm profoundly upset", padPleasure: -0.7, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "This is an upsetting situation", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I just feel upset", padPleasure: -0.4, padArousal: 0.2, padDominance: -0.2 },

  // === DISAPPOINTMENT (15) ===
  { utteranceText: "I am so disappointed", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "This is a huge disappointment", padPleasure: -0.6, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "I feel let down and disappointed", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "I'm disappointed in the outcome", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "It is disappointing to hear that", padPleasure: -0.4, padArousal: -0.1, padDominance: -0.1 },
  { utteranceText: "I feel disappointed in myself", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "What a disappointing day", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.2 },
  { utteranceText: "I'm deeply disappointed", padPleasure: -0.7, padArousal: -0.3, padDominance: -0.4 },
  { utteranceText: "The disappointment is crushing", padPleasure: -0.7, padArousal: -0.2, padDominance: -0.5 },
  { utteranceText: "I was hoping for more, I'm disappointed", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "Such a disappointing result", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I can't hide my disappointment", padPleasure: -0.5, padArousal: -0.1, padDominance: -0.3 },
  { utteranceText: "Really disappointing behavior", padPleasure: -0.5, padArousal: 0.1, padDominance: 0.0 },
  { utteranceText: "I am disappointed with everything", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "This was extremely disappointing", padPleasure: -0.6, padArousal: -0.1, padDominance: -0.3 },

  // === STRESS (12) ===
  { utteranceText: "I am so stressed out", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.3 },
  { utteranceText: "This is incredibly stressful", padPleasure: -0.6, padArousal: 0.7, padDominance: -0.4 },
  { utteranceText: "My stress levels are peaking", padPleasure: -0.6, padArousal: 0.8, padDominance: -0.3 },
  { utteranceText: "I'm feeling very stressed", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "The stress is overwhelming me", padPleasure: -0.7, padArousal: 0.7, padDominance: -0.5 },
  { utteranceText: "I'm stressed about the deadline", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.3 },
  { utteranceText: "Just so much stress right now", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I can't handle this stress", padPleasure: -0.7, padArousal: 0.7, padDominance: -0.5 },
  { utteranceText: "This situation is stressing me", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "I'm completely stressed", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "Stress is eating me alive", padPleasure: -0.7, padArousal: 0.7, padDominance: -0.5 },
  { utteranceText: "I need a break from this stress", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },

  // === WORRY (15) ===
  { utteranceText: "I am worried sick", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "This has me really worried", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "I'm worried about the future", padPleasure: -0.5, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "I can't stop worrying", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "I'm constantly worried lately", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "It worries me deeply", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.3 },
  { utteranceText: "I feel worried and uneasy", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "The uncertainty has me worried", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I'm just so worried", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.3 },
  { utteranceText: "Feeling worried is exhausting", padPleasure: -0.5, padArousal: 0.2, padDominance: -0.4 },
  { utteranceText: "I am extremely worried", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "This news worries me", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.2 },
  { utteranceText: "I'm worried I made a mistake", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "Trying not to be worried", padPleasure: -0.3, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm worried for my family", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.3 },

  // === ANXIOUS (12) ===
  { utteranceText: "I have so much anxiety", padPleasure: -0.6, padArousal: 0.6, padDominance: -0.4 },
  { utteranceText: "My anxiety is through the roof", padPleasure: -0.7, padArousal: 0.8, padDominance: -0.5 },
  { utteranceText: "I feel very anxious today", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.3 },
  { utteranceText: "This is causing me anxiety", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.2 },
  { utteranceText: "I'm anxious about the results", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.3 },
  { utteranceText: "Anxiety is paralyzing me", padPleasure: -0.7, padArousal: 0.7, padDominance: -0.6 },
  { utteranceText: "I'm feeling an anxious pit", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "The anxiety won't go away", padPleasure: -0.6, padArousal: 0.5, padDominance: -0.5 },
  { utteranceText: "I'm getting really anxious", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.3 },
  { utteranceText: "Social situations make me anxious", padPleasure: -0.5, padArousal: 0.5, padDominance: -0.4 },
  { utteranceText: "I'm suffering from anxiety", padPleasure: -0.6, padArousal: 0.4, padDominance: -0.5 },
  { utteranceText: "I feel anxious and jittery", padPleasure: -0.5, padArousal: 0.7, padDominance: -0.2 },

  // === ANGRY (15) ===
  { utteranceText: "I am absolutely furious", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.3 },
  { utteranceText: "I'm so angry right now", padPleasure: -0.6, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "This makes me so angry", padPleasure: -0.6, padArousal: 0.6, padDominance: 0.1 },
  { utteranceText: "I'm seething with anger", padPleasure: -0.8, padArousal: 0.7, padDominance: 0.2 },
  { utteranceText: "I feel a lot of anger", padPleasure: -0.6, padArousal: 0.5, padDominance: 0.1 },
  { utteranceText: "It makes me angry to think about", padPleasure: -0.6, padArousal: 0.6, padDominance: 0.2 },
  { utteranceText: "I'm shaking with anger", padPleasure: -0.7, padArousal: 0.9, padDominance: 0.1 },
  { utteranceText: "My anger is boiling over", padPleasure: -0.7, padArousal: 0.8, padDominance: 0.2 },
  { utteranceText: "I am angry at the injustice", padPleasure: -0.6, padArousal: 0.6, padDominance: 0.2 },
  { utteranceText: "I'm genuinely angry", padPleasure: -0.5, padArousal: 0.5, padDominance: 0.1 },
  { utteranceText: "I can't control my anger", padPleasure: -0.7, padArousal: 0.8, padDominance: -0.1 },
  { utteranceText: "I'm angry and hurt", padPleasure: -0.6, padArousal: 0.5, padDominance: 0.0 },
  { utteranceText: "Just blinding anger right now", padPleasure: -0.8, padArousal: 0.9, padDominance: 0.3 },
  { utteranceText: "I'm getting angry", padPleasure: -0.5, padArousal: 0.5, padDominance: 0.1 },
  { utteranceText: "This anger consumes me", padPleasure: -0.7, padArousal: 0.6, padDominance: 0.1 },

  // === ANNOYED (10) ===
  { utteranceText: "This is so annoying", padPleasure: -0.4, padArousal: 0.3, padDominance: 0.0 },
  { utteranceText: "I'm getting really annoyed", padPleasure: -0.4, padArousal: 0.4, padDominance: 0.0 },
  { utteranceText: "It annoys me to no end", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.1 },
  { utteranceText: "I feel annoyed by this", padPleasure: -0.3, padArousal: 0.2, padDominance: 0.0 },
  { utteranceText: "Everything is annoying today", padPleasure: -0.4, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "Stop being so annoying", padPleasure: -0.4, padArousal: 0.5, padDominance: 0.2 },
  { utteranceText: "I'm annoyed with the service", padPleasure: -0.4, padArousal: 0.3, padDominance: 0.1 },
  { utteranceText: "This noise is annoying", padPleasure: -0.3, padArousal: 0.3, padDominance: -0.1 },
  { utteranceText: "I'm visibly annoyed", padPleasure: -0.4, padArousal: 0.4, padDominance: 0.0 },
  { utteranceText: "Just feeling mild annoyance", padPleasure: -0.2, padArousal: 0.1, padDominance: 0.0 },

  // === SAD (10) ===
  { utteranceText: "I feel so sad", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.4 },
  { utteranceText: "I'm overcome with sadness", padPleasure: -0.7, padArousal: -0.2, padDominance: -0.5 },
  { utteranceText: "This is a sad day", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "I'm feeling really sad", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.3 },
  { utteranceText: "The sadness won't lift", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.5 },
  { utteranceText: "I am deeply sad", padPleasure: -0.7, padArousal: -0.3, padDominance: -0.4 },
  { utteranceText: "I have a heavy sadness", padPleasure: -0.6, padArousal: -0.4, padDominance: -0.4 },
  { utteranceText: "I'm sad and lonely", padPleasure: -0.6, padArousal: -0.3, padDominance: -0.5 },
  { utteranceText: "Just a bit sad today", padPleasure: -0.3, padArousal: -0.1, padDominance: -0.2 },
  { utteranceText: "I can't shake this sadness", padPleasure: -0.5, padArousal: -0.2, padDominance: -0.4 },

  // === OTHER NEGATIVE (26) ===
  { utteranceText: "I feel completely helpless", padPleasure: -0.7, padArousal: -0.1, padDominance: -0.5 },
  { utteranceText: "I am utterly exhausted", padPleasure: -0.4, padArousal: -0.4, padDominance: -0.4 },
  { utteranceText: "I feel trapped here", padPleasure: -0.6, padArousal: 0.3, padDominance: -0.5 },
  { utteranceText: "This is miserable", padPleasure: -0.7, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "I feel so bitter", padPleasure: -0.5, padArousal: 0.2, padDominance: 0.1 },
  { utteranceText: "I am resentful of them", padPleasure: -0.5, padArousal: 0.3, padDominance: 0.1 },
  { utteranceText: "I'm dreading tomorrow", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.4 },
  { utteranceText: "I feel totally defeated", padPleasure: -0.7, padArousal: -0.3, padDominance: -0.5 },
  { utteranceText: "Everything is hopeless", padPleasure: -0.8, padArousal: -0.4, padDominance: -0.6 },
  { utteranceText: "I am overwhelmed", padPleasure: -0.5, padArousal: 0.6, padDominance: -0.5 },
  { utteranceText: "I feel ashamed", padPleasure: -0.6, padArousal: 0.1, padDominance: -0.5 },
  { utteranceText: "I am absolutely terrified", padPleasure: -0.8, padArousal: 0.8, padDominance: -0.6 },
  { utteranceText: "I feel so lonely", padPleasure: -0.6, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "I'm paralyzed by fear", padPleasure: -0.7, padArousal: 0.7, padDominance: -0.6 },
  { utteranceText: "I feel so guilty", padPleasure: -0.6, padArousal: 0.2, padDominance: -0.4 },
  { utteranceText: "I am in despair", padPleasure: -0.8, padArousal: -0.2, padDominance: -0.6 },
  { utteranceText: "I feel rejected", padPleasure: -0.6, padArousal: -0.1, padDominance: -0.5 },
  { utteranceText: "I am absolutely drained", padPleasure: -0.5, padArousal: -0.5, padDominance: -0.4 },
  { utteranceText: "I feel worthless", padPleasure: -0.8, padArousal: -0.3, padDominance: -0.6 },
  { utteranceText: "I'm feeling panic", padPleasure: -0.6, padArousal: 0.8, padDominance: -0.5 },
  { utteranceText: "I feel so insecure", padPleasure: -0.5, padArousal: 0.1, padDominance: -0.5 },
  { utteranceText: "I am grieving", padPleasure: -0.7, padArousal: -0.2, padDominance: -0.4 },
  { utteranceText: "I feel disgusting", padPleasure: -0.6, padArousal: 0.2, padDominance: -0.3 },
  { utteranceText: "I am so jealous", padPleasure: -0.5, padArousal: 0.4, padDominance: -0.2 },
  { utteranceText: "I feel completely numb", padPleasure: -0.4, padArousal: -0.5, padDominance: -0.4 },
  { utteranceText: "I'm losing my mind", padPleasure: -0.6, padArousal: 0.7, padDominance: -0.5 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting Negative Emotion Reinforcement Batch 3 import...');
    console.log(`Total utterances to import: ${utterances.length}`);
    await client.query('BEGIN');

    let added = 0;
    let skipped = 0;

    for (const u of utterances) {
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
      const source = 'user_emotion_lexicon.phase3_reinforcement_batch3';
      const notes = 'Negative emotion reinforcement batch 3 - full coverage';

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
    console.log(`\nBatch 3 import committed successfully.`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped (duplicates): ${skipped}`);

    // Show full word distribution
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

    console.log('\nWord Group Distribution:');
    console.table(wordStats.rows);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Batch 3 import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

run()
  .then(() => {
    console.log('\nBatch 3 import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in batch import script');
    console.error(err);
    process.exitCode = 1;
  });
