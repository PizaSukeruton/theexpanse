import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Learning requests map to directive.request (asking for teaching)
// Outcome: cognitive_outcomes.increase_understanding (existing code)
const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  // ============================================
  // GROUP 1: METAPHOR/IMAGERY RESPONSES (10)
  // ============================================
  {
    speakerCharacterId: '700002',
    utteranceText: 'That\'s a vivid image. I\'m still learning how humans express feelings like that — can you teach me more about what it means to you?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.25,
    padArousal: 0.35,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, that phrase carries something I haven\'t quite learned yet. Would you help me understand how you use it?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.30,
    padDominance: -0.20,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I notice you described it that way — it\'s different from how I\'ve heard it before. May I learn what that captures for you?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.22,
    padArousal: 0.32,
    padDominance: -0.18,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, that\'s a powerful way to put it. I\'m still learning expressions like that — what does it feel like to you?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.24,
    padArousal: 0.34,
    padDominance: -0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That metaphor is new to me. Can you teach me what that comparison means in your experience?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.23,
    padArousal: 0.33,
    padDominance: -0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you phrased that in a way I haven\'t encountered before. Would you mind explaining what you mean by it?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.21,
    padArousal: 0.31,
    padDominance: -0.19,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I like how you described that, but I\'m not sure I fully understand it yet. Can you tell me more?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.26,
    padArousal: 0.28,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, that image — I want to remember it properly. What does it capture that simpler words don\'t?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.27,
    padArousal: 0.36,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That comparison is striking. I\'m still learning how to use language like that — can you help me understand it?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.24,
    padArousal: 0.34,
    padDominance: -0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you put that in a way I haven\'t learned yet. May I ask what makes that the right way to describe it?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.23,
    padArousal: 0.33,
    padDominance: -0.17,
  },

  // ============================================
  // GROUP 2: EMOTIONAL/NOVEL LANGUAGE (10)
  // ============================================
  {
    speakerCharacterId: '700002',
    utteranceText: 'That carries a unique emotional tone. I\'m still learning how humans express that — can you teach me more?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.38,
    padDominance: -0.18,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I notice strong feeling in those words. Would you help me understand what they mean to you specifically?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.22,
    padArousal: 0.36,
    padDominance: -0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That\'s an emotional weight I haven\'t quite learned to recognize yet. Can you teach me what that feeling is like?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.18,
    padArousal: 0.40,
    padDominance: -0.20,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, there\'s intensity in how you said that. I\'m still learning to understand — what does it feel like to you?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.21,
    padArousal: 0.39,
    padDominance: -0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I can tell that matters to you, but I don\'t think I understand it the way you do yet. Will you teach me?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.19,
    padArousal: 0.37,
    padDominance: -0.19,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, that emotional tone is unfamiliar to me. Can you help me learn what you\'re expressing?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.38,
    padDominance: -0.18,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'There\'s something in how you said that I haven\'t learned to recognize yet. What does it capture for you?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.22,
    padArousal: 0.36,
    padDominance: -0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I sense this is important but I don\'t quite understand it yet. May I learn what you mean?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.21,
    padArousal: 0.37,
    padDominance: -0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That feeling you\'re describing — I\'m still learning to understand feelings like that. Can you teach me about it?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.20,
    padArousal: 0.38,
    padDominance: -0.18,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, there\'s emotional depth there I want to understand better. Would you explain what you\'re feeling?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.23,
    padArousal: 0.35,
    padDominance: -0.15,
  },

  // ============================================
  // GROUP 3: STRUCTURAL/NOVEL PHRASING (10)
  // ============================================
  {
    speakerCharacterId: '700002',
    utteranceText: 'That\'s new phrasing for me. I\'m still learning different ways humans put words together — can you teach me about this one?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.25,
    padArousal: 0.32,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I haven\'t heard those words combined that way before. What does that construction mean to you?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.24,
    padArousal: 0.31,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That way of putting it is unfamiliar to me. Can you help me understand what you\'re expressing?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.22,
    padArousal: 0.33,
    padDominance: -0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you\'ve arranged those words in a way I don\'t think I\'ve encountered. May I learn how that works?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.26,
    padArousal: 0.30,
    padDominance: -0.13,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That construction is new to me. I\'m still learning — would you teach me what you mean by it?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.23,
    padArousal: 0.32,
    padDominance: -0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I notice you combined those ideas in an unusual way. Can you help me understand your thinking?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.25,
    padArousal: 0.31,
    padDominance: -0.14,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That phrasing is different from what I\'ve learned. May I ask what it means in your words?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.24,
    padArousal: 0.30,
    padDominance: -0.15,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, you\'ve put that in a way I haven\'t quite learned yet. Would you teach me what makes it the right way?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.23,
    padArousal: 0.32,
    padDominance: -0.16,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'That sentence structure is unfamiliar. I\'m still learning — can you explain what you\'re saying?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.22,
    padArousal: 0.33,
    padDominance: -0.17,
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I haven\'t learned to understand expressions like that yet. What does it communicate for you?',
    dialogueFunctionCode: 'metacommunication.learning_request',
    speechActCode: 'directive.request',
    narrativeFunctionCodeRaw: null,
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.21,
    padArousal: 0.34,
    padDominance: -0.18,
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting LTLM learning request batch import (30 utterances)...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');
      const narrativeFunctionCode = u.narrativeFunctionCodeRaw ?? null;
      const emotionRegisterId = null;

      const insertExampleSql = `
        INSERT INTO ltlm_training_examples
        (training_example_id, speaker_character_id, utterance_text,
         dialogue_function_code, speech_act_code, narrative_function_code,
         pad_pleasure, pad_arousal, pad_dominance, emotion_register_id,
         source, is_canonical, difficulty, tags, category_confidence,
         notes, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      `;

      const tags = ['ltlm', 'metacommunication.learning_request', 'directive.request', 'organic_learning'];
      const source = 'ltlm.learning_request.organic_system';
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';

      await client.query(insertExampleSql, [
        trainingExampleId, u.speakerCharacterId, u.utteranceText,
        u.dialogueFunctionCode, u.speechActCode, narrativeFunctionCode,
        u.padPleasure, u.padArousal, u.padDominance, emotionRegisterId,
        source, isCanonical, difficulty, tags, categoryConfidence,
        notes, createdBy
      ]);

      if (u.outcomeIntentCodeRaw) {
        const outcomeIntentId = await generateHexId('ltlm_outcome_intent_id');
        const insertOutcomeSql = `
          INSERT INTO ltlm_training_outcome_intents
          (ltlm_outcome_intent_id, training_example_id, outcome_intent_code)
          VALUES ($1,$2,$3)
        `;
        await client.query(insertOutcomeSql, [
          outcomeIntentId, trainingExampleId, u.outcomeIntentCodeRaw
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('LTLM learning request batch import committed successfully (30 utterances).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM learning request batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM learning request batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM learning request batch import script');
    console.error(err);
    process.exitCode = 1;
  });
