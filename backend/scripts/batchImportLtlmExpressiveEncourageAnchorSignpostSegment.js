import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'From here, the next step is simply choosing one small action that supports you, not proving anything to anyone.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is the point in the story where you shift from bracing against it to taking one grounded, doable step.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let us mark this as the moment where you decide to move with a little more trust in your own capacity.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, we can treat this as the hinge between feeling stuck and experimenting with a kinder way forward.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is a good place to say out loud what you want the next little chapter to be about for you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, think of this as drawing a gentle line: what came before is context, and what comes now is a fresh, chosen move.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'We are arriving at the part where you let yourself take up a little more space and trust that it is allowed.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let us name this clearly as the moment where you choose to back yourself, even if only a little more than before.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From this point, the focus can shift from what went wrong toward what might support you in the next few steps.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let us mark this as a quiet turning point where you move with a bit more confidence in your own timing.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },

  {
    speakerCharacterId: '700002',
    utteranceText: 'Let us call this the moment where you decide to move with yourself instead of against yourself.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, from here the intention can shift from just getting through this to getting through it in a way that feels more honest to you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'We can mark this as the point where you start measuring progress by alignment and care, not just output.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this is a good place to say: the goal is not perfection, the goal is a sustainable way of being with this.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From this point on, you can treat each attempt as information, not a test of your worth.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let us name that the next stretch is about gentle experimentation, not getting everything right at once.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is the moment where you give yourself permission to go at your own pace and still call it real progress.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, from here, the story can be about how you cared for yourself while doing this, not just that you got it done.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'We can treat this as a marker: you are choosing to be on your own side in how you approach the next steps.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.10,
    padDominance: 0.10
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let this be a quiet turning point where you trust that your way of doing this is allowed to be different and still valid.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'anchor_mechanics.signpost_segment',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.11,
    padDominance: 0.11
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + anchor_mechanics.signpost_segment batch import...');

    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
      const emotionRegisterId = null;

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
        )
        VALUES (
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

      const tags = ['ltlm', 'expressive.encourage', 'anchor_mechanics.signpost_segment'];
      const source = 'ltlmbrief.expressive.encourage.anchor_mechanics.signpost_segment';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(
        insertExampleSql,
        [
          trainingExampleId,
          u.speakerCharacterId,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
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
          createdBy
        ]
      );

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');

        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents (
            ltlm_outcome_intent_id,
            training_example_id,
            outcome_intent_code
          )
          VALUES ($1, $2, $3)
        `;

        await client.query(
          insertOutcomeSql,
          [
            outcomeIntentId,
            trainingExampleId,
            u.outcomeIntentCodeRaw
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log('LTLM expressive.encourage + anchor_mechanics.signpost_segment batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + anchor_mechanics.signpost_segment batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + anchor_mechanics.signpost_segment batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + anchor_mechanics.signpost_segment batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
