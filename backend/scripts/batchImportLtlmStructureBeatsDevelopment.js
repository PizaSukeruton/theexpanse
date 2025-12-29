import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you’ve framed this gives us a foundation—there’s more we can unfold from here before the next shift.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What you’ve shared, <SUBJECT>, opens a middle space where the shape of the situation becomes clearer without needing to resolve it yet.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if we sit with this a moment longer, more detail starts to emerge around the edges of what you’re describing.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Your perspective creates a starting contour, <SUBJECT>; now we can gently develop the texture around it.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is the part of the story where things begin to gather substance—not conclusions, just more definition.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This feels like the point where the situation expands a little, revealing more of its structure without demanding a turn yet.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There’s room here to develop the picture, letting the scene fill in before momentum carries it forward.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What’s emerging now is the middle layer—the part that adds weight and dimension before any big shifts arrive.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This moment invites a widening of the frame, the kind of development that gives future steps something to stand on.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Here the story naturally deepens, gathering its elements before deciding which direction to move next.',
    dialogueFunctionCode: 'topic_management.summarise_discussion',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.development',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.14,
    padArousal: 0.06,
    padDominance: 0.09
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM structure_beats.development batch import...');
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

      const source = 'ltlmbrief.structure_beats.development';
      const tags = ['ltlm', 'structure_beats.development'];
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
    console.log('LTLM structure_beats.development batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM structure_beats.development batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM structure_beats.development batch import script finished.'))
  .catch((err) => {
    console.error('Unexpected error in batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
