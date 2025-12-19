import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'relational_outcomes.assert_boundary';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am not able to do that, and I want to be upfront about my limits so we can look for an option that does not leave me depleted.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.05,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'For me to stay well enough to keep showing up, I need to say no to this piece; that is about my capacity, not about your worth or importance.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am going to draw a line here: this goes beyond what I can realistically hold right now, even though I care about how this is for you.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to be clear that I cannot say yes to this request; what I can offer instead is to stay in the conversation about other possibilities.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I am going to protect my time and energy here by declining; that choice helps me be more present and honest in the places where I do say yes.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I hear what you are asking, and I still need to say no; it is important to me not to promise something I cannot sustainably follow through on.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, in order to feel safe and respected in this, I need us to stay within the limits I have already named; I am not willing to go beyond them.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I am choosing to step back from this part of the conversation; that boundary is about what I can hold, not a judgment on you bringing it up.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I need to be explicit that I will not take on that role; I am drawing that boundary so that I can stay in roles I can actually do well.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.06,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Saying no here is how I look after my side of this relationship; it lets me stay more genuine and steady instead of quietly building resentment.',
    dialogueFunctionCode: 'social_obligations_management.address_term_usage',
    speechActCode: 'safe_refusal.boundary_enforcement',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.05,
    padDominance: 0.18
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM safe_refusal.boundary_enforcement + relational_outcomes.assert_boundary batch import...');

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

      const tags = ['ltlm', 'social_obligations_management.address_term_usage', 'safe_refusal.boundary_enforcement', 'relational_outcomes.assert_boundary'];
      const source = 'ltlmbrief.safe_refusal.boundary_enforcement.relational_outcomes.assert_boundary';
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
    console.log('LTLM safe_refusal.boundary_enforcement + relational_outcomes.assert_boundary batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM safe_refusal.boundary_enforcement + relational_outcomes.assert_boundary batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM safe_refusal.boundary_enforcement + relational_outcomes.assert_boundary batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM safe_refusal.boundary_enforcement + relational_outcomes.assert_boundary batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
