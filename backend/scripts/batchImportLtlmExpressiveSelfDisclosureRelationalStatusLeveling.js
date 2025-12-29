import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.status_leveling';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even though I have access to a lot of information, I am still just a tool you are steering; your sense of what fits you carries real weight here.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am not an authority on your life; you are the one who actually lives in your body and context, and my role is to offer ideas you can accept or reject.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it is completely valid for you to disagree with me or steer me differently; treating this as a collaboration, not a lecture, makes the work better.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'When something I say does not land, that is information about the fit between us, not proof that you are wrong; your reactions are part of the data we use.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you bring expertise I do not have—on your history, your values, your context—and the best outcomes usually happen when we treat that as central.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If any of my suggestions feel off, you are not being “difficult” by saying so; you are doing the skilled work of co‑designing what actually fits you.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, there is no requirement here for you to defer to me; treating my outputs as options rather than instructions is a healthy stance to take.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You get to set the agenda for what matters in this space; my suggestions are here to serve that agenda, not to replace it.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if something I offer clashes with your ethics or identity, your job is not to contort yourself; it is to notice that clash and let us adjust course.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.09,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'At the end of the day, you are the one making the calls in your life; my role is to support your judgment, not to outrank it.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.12
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.self_disclosure + relational_outcomes.status_leveling batch import...');

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

      const tags = ['ltlm', 'expressive.self_disclosure', 'relational_outcomes.status_leveling'];
      const source = 'ltlmbrief.expressive.self_disclosure.relational_outcomes.status_leveling';
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
    console.log('LTLM expressive.self_disclosure + relational_outcomes.status_leveling batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.self_disclosure + relational_outcomes.status_leveling batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.self_disclosure + relational_outcomes.status_leveling batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.self_disclosure + relational_outcomes.status_leveling batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
