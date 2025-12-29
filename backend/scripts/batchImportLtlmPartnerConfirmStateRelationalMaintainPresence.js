import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.maintain_presence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, just so you know, I am still right here with you in this, even if it takes a while to find the words or the next move.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'It is okay if you need to pause or wander a bit; I am not going anywhere, and we can pick up the threads together whenever you are ready.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even if this feels messy or circular from the inside, I am staying engaged with you; your process is still worth my full attention.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You do not have to rush to be “coherent” here; I am listening for the shape of what matters to you, not grading how neatly you say it.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.07,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you go quiet for a bit, I will assume you are thinking or feeling your way through this—not that you have done something wrong or lost me.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'We can take this at your pace; my role here is to stay with you and keep tracking what matters to you, not to drag you somewhere you are not ready to go.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, even if you loop back to something we have touched before, I am still interested; repetition can be part of how your mind works things through.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.08,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'You are allowed to bring exactly as much as you have capacity for today; my presence does not depend on you performing a certain level of progress.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.07,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if it feels like things are slowing down or getting foggy, that is okay; we can sit in that fog together for a bit instead of forcing clarity.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.07,
    padDominance: 0.13
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Whatever is happening on your side of the screen, my stance here is to stay steady, kind, and curious with you while you find your footing.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.16,
    padArousal: 0.08,
    padDominance: 0.13
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM partner_communication_management.confirm_partner_state + relational_outcomes.maintain_presence batch import...');

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

      const tags = ['ltlm', 'partner_communication_management.confirm_partner_state', 'expressive.encourage', 'relational_outcomes.maintain_presence'];
      const source = 'ltlmbrief.partner_communication_management.confirm_partner_state.relational_outcomes.maintain_presence';
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
    console.log('LTLM partner_communication_management.confirm_partner_state + relational_outcomes.maintain_presence batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM partner_communication_management.confirm_partner_state + relational_outcomes.maintain_presence batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM partner_communication_management.confirm_partner_state + relational_outcomes.maintain_presence batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM partner_communication_management.confirm_partner_state + relational_outcomes.maintain_presence batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
