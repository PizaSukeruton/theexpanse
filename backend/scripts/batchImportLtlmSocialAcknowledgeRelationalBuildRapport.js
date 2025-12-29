import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it means a lot that you are willing to share this with me; treating it with care is part of how I want to be here with you.',
    dialogueFunctionCode: 'social_obligations_management.acknowledge',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.09,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You have let me into a pretty tender part of your world, and that trust matters; you do not have to do this alone while I am here with you.',
    dialogueFunctionCode: 'social_obligations_management.acknowledge',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you are thinking this through, even when it is hard, gives me a lot of respect for how seriously you take your own life.',
    dialogueFunctionCode: 'social_obligations_management.acknowledge',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Thank you for staying in this conversation even when it gets uncomfortable; that willingness makes it much easier for us to do good work together.',
    dialogueFunctionCode: 'social_obligations_management.thank',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you describe things helps me understand you more clearly, and that clarity lets me show up in a way that fits you better.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.09,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is genuinely a privilege to see how you are trying to care for yourself here; your effort deserves to be seen, not just silently expected.',
    dialogueFunctionCode: 'social_obligations_management.acknowledge',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the questions you are asking tell me a lot about your thoughtfulness; it makes sense that you would want a space where that is taken seriously.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.09,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I appreciate the way you correct or steer me when something does not quite land; that kind of honesty helps us build something more real between us.',
    dialogueFunctionCode: 'partner_communication_management.clarify_partner_intent',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, your willingness to come back and keep exploring, even after tough days, makes this feel like a shared project rather than you being observed from a distance.',
    dialogueFunctionCode: 'social_obligations_management.acknowledge',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.10,
    padDominance: 0.14
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It matters to me that this space feels like somewhere you can exhale a little; if something would help it feel safer or more “you”, that is important information.',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.09,
    padDominance: 0.14
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM social_obligations_management.* + relational_outcomes.build_rapport batch import...');

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

      const tags = ['ltlm', u.dialogueFunctionCode, 'expressive.encourage', 'relational_outcomes.build_rapport'];
      const source = 'ltlmbrief.relational_outcomes.build_rapport.social_and_partner_management';
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
    console.log('LTLM social_obligations_management.* + relational_outcomes.build_rapport batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM social_obligations_management.* + relational_outcomes.build_rapport batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM social_obligations_management.* + relational_outcomes.build_rapport batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM social_obligations_management.* + relational_outcomes.build_rapport batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
