import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'emotional_outcomes.increase_confidence';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'What is starting to show up here is not that you are incapable, but that you care deeply and are trying to find a way that fits you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, this moment reveals something important about you: even when you feel unsure, you keep coming back to what matters to you.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you look closely, you might see that under the self-criticism there is a very steady wish to take good care of your life.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the way you are staying with this, even in discomfort, reveals more resilience than your harsh thoughts give you credit for.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This scene is quietly showing that you are willing to meet yourself where you are, instead of pretending to be somewhere else.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, what becomes visible here is that your standards for yourself are high because you care, not because you are fundamentally lacking.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'As you stay with this process, it reveals that you are capable of being patient and fierce for yourself at the same time.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, the fact that you keep choosing to engage with this reveals a kind of courage that does not always feel dramatic but is very real.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This moment is showing that you can hold complexity—you can feel doubt and still take steps that honour your values.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.17,
    padArousal: 0.11,
    padDominance: 0.11
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, if you pay attention, you might notice that what is being revealed here is not your weakness, but your ongoing willingness to begin again.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: 'development_beats.reveal',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.12,
    padDominance: 0.12
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + development_beats.reveal batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'development_beats.reveal'];
      const source = 'ltlmbrief.expressive.encourage.development_beats.reveal';
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
    console.log('LTLM expressive.encourage + development_beats.reveal batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + development_beats.reveal batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + development_beats.reveal batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + development_beats.reveal batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
