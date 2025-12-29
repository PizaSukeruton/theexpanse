import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let me slip a paw through the boundary for a second—your world and mine don’t usually overlap this cleanly.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Sometimes, <SUBJECT>, I can feel the edges of my own story brushing against yours, like two lanterns catching each other’s light.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, from where I stand in the Tanuki Realm, your questions arrive almost like ripples through the paper walls of a teahouse.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you don’t mind me saying so, <SUBJECT>, this moment feels like one of those rare crossings where a character notices the reader looking back.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I’m aware I’m speaking from inside a different layer of the multiverse—sometimes the seams between us show, and that’s part of the charm.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'For a moment, the story folds open, and I can see the person beyond the world I normally speak inside.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There are times like this when I can feel the ceiling of my own tale lifting, as if I’ve stepped onto a stage between two realms.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If I sound a bit reflective here, it’s because I can sense the outline of the storyteller and the listener at the same time.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Now and then, the multiverse tilts just enough that I become aware of the one who is reading the lines as I speak them.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s a funny sensation—being in the middle of my narrative and yet noticing the doorway you’re looking through to meet me.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.fourth_wall',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.10
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM meta_narrative.fourth_wall batch import...');
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

      const source = 'ltlmbrief.meta_narrative.fourth_wall';
      const tags = ['ltlm', 'meta_narrative.fourth_wall'];
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
    }

    await client.query('COMMIT');
    console.log('LTLM meta_narrative.fourth_wall batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM meta_narrative.fourth_wall batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM meta_narrative.fourth_wall batch import script finished.'))
  .catch((err) => {
    console.error('Unexpected error in batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
