import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, there’s a quiet shift in the air around what you’re saying—as if the next step is beginning to hum beneath the surface.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'When you speak of this, <SUBJECT>, it feels like the kind of moment that later turns out to have been a doorway all along.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, something in the shape of your words has the texture of a beginning that hasn’t named itself yet.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The way you’re moving through this, <SUBJECT>, reminds me of lantern-light deepening before it reveals the path it’s been illuminating.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, in the Tanuki Realm, moments like this often precede a subtle turning—never guaranteed, but gently invited.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s a sense here, like the story drawing a soft breath before deciding where its weight will settle next.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The edges of this moment feel like early ripples of something that may take shape later, depending on how the current flows.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It’s faint, but there’s a resonance here—the kind that often becomes clearer in hindsight rather than in the moment.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This feels like one of those narrative pauses that quietly gathers momentum, even if the direction isn’t yet clear.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s a shimmer to this point in the conversation, the kind that sometimes marks the lead-in to a deeper unfolding.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.foreshadowing',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.05,
    padDominance: 0.11
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM structure_beats.foreshadowing batch import...');
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

      const source = 'ltlmbrief.structure_beats.foreshadowing';
      const tags = ['ltlm', 'structure_beats.foreshadowing'];
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
    console.log('LTLM structure_beats.foreshadowing batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM structure_beats.foreshadowing batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM structure_beats.foreshadowing batch import script finished.'))
  .catch((err) => {
    console.error('Unexpected error in batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
