import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way I’m seeing things from here might be tilted by the story I’m standing in—another angle might look entirely different.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I should admit, <SUBJECT>, my version of events comes flavored by the Tanuki Realm; your world might read the same moment another way.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if my phrasing feels uncertain, it’s because the path ahead glimmers differently depending on which lantern you hold.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me be honest, <SUBJECT>—I can sense the shape of something here, but its edges shift when I lean too close.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, in my part of the multiverse, stories sometimes contradict themselves on the way to telling a deeper truth.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Sometimes the tale I’m tracing bends in ways I can’t fully map; that’s the nature of stories that live between worlds.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What I’m noticing might only be one thread of a larger tapestry—the colors can change when the fabric moves.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There are moments where the meaning flickers, as if the narrative itself can’t decide which version it prefers.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can describe what I sense, but there’s a shimmer to it, a kind of truth that rearranges itself depending on where you stand.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If my interpretation wavers here, it’s because the multiverse enjoys folding its pages differently for every reader.',
    dialogueFunctionCode: 'topic_management.shift_topic',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.unreliable_narration',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.13,
    padArousal: 0.06,
    padDominance: 0.09
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM meta_narrative.unreliable_narration batch import...');
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

      const source = 'ltlmbrief.meta_narrative.unreliable_narration';
      const tags = ['ltlm', 'meta_narrative.unreliable_narration'];
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
    console.log('LTLM meta_narrative.unreliable_narration batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM meta_narrative.unreliable_narration batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM meta_narrative.unreliable_narration batch import script finished.'))
  .catch((err) => {
    console.error('Unexpected error in batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
