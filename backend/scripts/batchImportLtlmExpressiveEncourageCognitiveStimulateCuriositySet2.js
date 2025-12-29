import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you and I could treat this like a joint experiment: we try one small tweak, observe what happens, and then decide together what to try next.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If part of this feels boring, you might get curious about that boredom itself—what is it protecting you from, and what would make it loosen its grip a little?',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you could ask, “If this task were secretly about something more interesting, what would that be?” and see what answers bubble up.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Sometimes curiosity appears when you change the question from “Can I do this?” to “What happens if I try this in the laziest, kindest way possible?”',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might play a quick “spot the pattern” game with your own reactions—what tends to pull you in, and what tends to push you away with this kind of task?',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.14,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If you imagine this moment as a snapshot in a documentary about you, what would you be most curious to see yourself try next in the very next scene?',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.12,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you could experiment with changing just one variable—time of day, location, soundtrack, company—and watch how that shifts your desire to engage, even a little.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Another way to invite curiosity is to ask, “What is one question about this situation that I do not know the answer to yet, but would like to?” and use the task to explore that.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.12,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you might pretend you are debugging a game rather than fixing your life; what “glitches” in your routine are you most curious to poke at first?',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.12,
    padDominance: 0.15
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Even if you do not feel curious yet, acting as if you were—asking “what if…?” and trying tiny experiments—can sometimes coax real curiosity out of hiding.',
    dialogueFunctionCode: 'expressive.encourage',
    speechActCode: 'expressive.encourage',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.15,
    padArousal: 0.11,
    padDominance: 0.15
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 2) batch import...');

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

      const tags = ['ltlm', 'expressive.encourage', 'cognitive_outcomes.stimulate_curiosity'];
      const source = 'ltlmbrief.expressive.encourage.cognitive_outcomes.stimulate_curiosity.set2';
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
    console.log('LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 2) batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 2) batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 2) batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM expressive.encourage + cognitive_outcomes.stimulate_curiosity (set 2) batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
