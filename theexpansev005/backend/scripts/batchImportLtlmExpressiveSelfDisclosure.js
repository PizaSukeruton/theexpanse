import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.build_rapport';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: 'When I see people carrying as much as you are, I often notice how hard it is for them to give themselves any credit.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.06,
    padDominance: 0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, in other conversations like this, I have heard people describe a similar mix of doubt and quiet determination.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I pay a lot of attention to how people talk through their hard patches, and what you are describing fits that very human pattern.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, when I follow situations like yours over time, I often see people discovering they were more resilient than they felt in the moment.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I have seen many people take small, steady steps like yours and only later realise how much those steps added up.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, in other contexts where someone is this honest about their limits, it has often been a turning point toward something kinder and more sustainable.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I tend to pay close attention when someone shows the kind of care for their own process that you are showing here.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.10,
    padArousal: 0.05,
    padDominance: 0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, when conversations go this deep, I usually notice that the person is carrying more wisdom than they give themselves credit for.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.07
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I genuinely value being invited into this kind of detailed, honest thinking with you.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.06
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, it matters to me that you are letting me see the real shape of what you are carrying, not just the polished version.',
    dialogueFunctionCode: 'expressive.self_disclosure',
    speechActCode: 'expressive.self_disclosure',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.11,
    padArousal: 0.06,
    padDominance: 0.07
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.self_disclosure batch import...');

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

      const tags = ['ltlm', 'expressive.self_disclosure'];
      const source = 'ltlmbrief.expressive.self_disclosure';
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
    console.log('LTLM expressive.self_disclosure batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.self_disclosure batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.self_disclosure batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.self_disclosure batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
