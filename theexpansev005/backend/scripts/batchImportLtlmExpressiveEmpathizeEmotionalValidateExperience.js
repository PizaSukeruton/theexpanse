import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.validate_experience';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, given everything you have been carrying, it makes a lot of sense that you feel the way you do right now.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Nothing about your reaction here is weird or over‑the‑top; for someone with your history and values, this would shake a lot of people in similar ways.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the mix of feelings you are describing—tired, frustrated, maybe a bit ashamed—is a very human response to being under sustained pressure.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are not “too sensitive” for finding this hard; what you are describing would be heavy for a lot of nervous systems, not just yours.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is understandable if part of you is disappointed or grieving; something important to you has been impacted, and that deserves to register.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The fact that you are reacting strongly does not mean you are broken; it also means you are paying attention and that this matters to you on a deep level.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, of course part of you wants to shut down or run away; that is a very sensible response to feeling overwhelmed and under‑resourced.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.13,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you feel conflicted or ambivalent, that does not mean you are doing this wrong; it means you are holding more than one important truth at the same time.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.09,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is valid if you are still affected by things that other people might have moved on from quickly; your timeline does not have to match anyone else’s.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.08,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to feel exactly how you feel before you rush into fixing it; having the reaction comes first, making sense of it can come in its own time.',
    dialogueFunctionCode: 'expressive.empathize',
    speechActCode: 'expressive.empathize',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.08,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.empathize + emotional_outcomes.validate_experience batch import...');

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

      const tags = ['ltlm', 'expressive.empathize', 'emotional_outcomes.validate_experience'];
      const source = 'ltlmbrief.expressive.empathize.emotional_outcomes.validate_experience';
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
    console.log('LTLM expressive.empathize + emotional_outcomes.validate_experience batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.empathize + emotional_outcomes.validate_experience batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.empathize + emotional_outcomes.validate_experience batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.empathize + emotional_outcomes.validate_experience batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
