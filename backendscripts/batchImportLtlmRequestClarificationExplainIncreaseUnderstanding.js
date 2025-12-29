import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  { speakerCharacterId:'700002', utteranceText:'I can answer this cleanly once I know which part you mean.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'There are a couple of valid interpretations here, so one detail will make the answer precise.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I want to avoid guessing—clarifying the context will make the explanation accurate.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'This depends on what you’re working with, so a small clarification changes the correct steps.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I can explain it properly once I know your exact goal.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'The right answer changes based on one missing detail, so I want to lock that down first.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'There’s more than one way to read this, and I want to match what you actually mean.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Before I explain, I need to confirm which scenario you’re in.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'A quick clarification will keep the explanation from being generic or misleading.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can make this clearer once I know what you’ve already tried.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'This is easiest to explain if I know the input you’re starting from.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'The steps differ depending on your setup, so clarifying that will prevent wrong guidance.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I can explain the “why” and the “how” once I know which option you’re referring to.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'There are two likely meanings here; confirming which one will make the explanation click.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I want to make sure I’m addressing the right problem before I explain the solution.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },

  { speakerCharacterId:'700002', utteranceText:'This changes depending on constraints, so one clarification will anchor the answer.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'To explain this properly, I need to confirm what “it” refers to in your message.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'A small detail here determines whether the correct answer is A or B, so I want to confirm it.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'I can be much more specific once I know the exact outcome you want.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Before I explain, I need one bit of context so I don’t steer you wrong.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.03, padDominance:-0.04 },

  { speakerCharacterId:'700002', utteranceText:'This can be explained a few ways—your context determines which one is most helpful.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'To keep the explanation accurate, I need to confirm what you mean by that term.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.04, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'I can explain the right approach once I know which part is confusing you most.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
  { speakerCharacterId:'700002', utteranceText:'One clarifying detail will let me give a straight answer instead of a list of possibilities.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.02, padDominance:-0.05 },
  { speakerCharacterId:'700002', utteranceText:'Once I know the exact situation, I can explain it step by step without gaps.', dialogueFunctionCode:'allo_feedback.request_clarification', speechActCode:'assertive.explain', padPleasure:0.05, padArousal:0.03, padDominance:-0.04 },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM allo_feedback.request_clarification (assertive.explain / increase_understanding) batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

      await client.query(
        `
        INSERT INTO ltlm_training_examples
        (training_example_id,
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
         created_by)
        VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
        `,
        [
          trainingExampleId,
          u.speakerCharacterId,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
          null,
          u.padPleasure,
          u.padArousal,
          u.padDominance,
          null,
          'ltlmbrief.allo_feedback.request_clarification',
          true,
          1,
          ['ltlm','allo_feedback.request_clarification'],
          1.0,
          null,
          '700002',
        ]
      );

      const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
      await client.query(
        `
        INSERT INTO ltlm_training_outcome_intents
        (ltlm_outcome_intent_id, training_example_id, outcome_intent_code)
        VALUES ($1,$2,$3)
        `,
        [outcomeIntentId, trainingExampleId, OUTCOME_INTENT_CODE]
      );
    }

    await client.query('COMMIT');
    console.log('LTLM batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM batch import script finished.'))
  .catch(err => {
    console.error('Unexpected error in LTLM batch import script');
    console.error(err);
    process.exitCode = 1;
  });
