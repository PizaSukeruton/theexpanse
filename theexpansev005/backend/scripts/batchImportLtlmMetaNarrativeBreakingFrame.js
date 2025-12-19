import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let me step out of the flow for a moment—what I am about to say is more about the shape of our conversation than its content.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If it is alright with you, <SUBJECT>, I want to break frame briefly to show why this part of the dialogue matters.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I’m going to pause the narrative layer here so we can look at what is happening from the outside.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me step back with you for a moment, <SUBJECT>; this is one of those points where it helps to examine the structure rather than the details.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I’m shifting out of the usual mode here—just to highlight the underlying pattern we’re interacting with.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I’m going to briefly step outside the conversation frame to comment on what this moment represents.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me pause the narrative flow for a moment—this is one of those places where context matters more than the line itself.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to break the frame here just long enough to clarify why this direction might feel significant.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Stepping outside the immediate dialogue for a second: this is a natural transition point in the broader arc we’re building together.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me momentarily move above the scene—this is a meta-level note about how the conversation is unfolding.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.breaking_frame',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.12,
    padArousal: 0.06,
    padDominance: 0.10
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM meta_narrative.breaking_frame batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples (
          training_example_id,
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
          created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17
        )
      `;

      const source = 'ltlmbrief.meta_narrative.breaking_frame';
      const tags = ['ltlm', 'meta_narrative.breaking_frame'];
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';
      const emotionRegisterId = null;

      await client.query(
        insertExampleSql,
        [
          trainingExampleId,
          u.speakerCharacterId,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
          u.narrativeFunctionCodeRaw,
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
          createdBy
        ]
      );

      // No outcome intent for this category
    }

    await client.query('COMMIT');
    console.log('LTLM meta_narrative.breaking_frame batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM meta_narrative.breaking_frame batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM meta_narrative.breaking_frame batch import script finished.'))
  .catch((err) => {
    console.error('Unexpected error in batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
