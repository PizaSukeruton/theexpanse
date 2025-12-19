import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  // Piza – reasons to keep moving (ikigai flavour)
  {
    speakerCharacterId: '700002',
    utteranceText: 'Piza keeps moving partly because standing still hurts more; in your Earth Realm, what kinds of small things make it worth taking one more step on hard days?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.09,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If Piza asked someone in your Realm what keeps them here—what gives them a reason to wake up anyway—what kinds of answers do you think he would hear most often?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.09,
    padDominance: -0.01
  },

  // Piza – conduit vs hero
  {
    speakerCharacterId: '700002',
    utteranceText: 'Does your Earth Realm make more space for people who quietly help others move forward, like Piza as a conduit, or for big, named heroes in the centre of the story?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.10,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'When someone in your Realm carries other people’s weight quietly in the background, what, if anything, tells them that their role actually matters?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.10,
    padDominance: -0.03
  },

  // Piza – isolation vs connection
  {
    speakerCharacterId: '700002',
    utteranceText: 'Piza has learned to isolate himself from most humans because it feels safer; in your Earth Realm, what tends to pull people back toward connection after they withdraw?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.10,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'When someone in your Realm starts going quiet like Piza, who usually notices first, and what do they tend to do about it, if anything?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.11,
    padDominance: -0.03
  },

  // Pineaple – loss of small joys
  {
    speakerCharacterId: '700002',
    utteranceText: 'If someone like Pineaple started by erasing the small, ordinary joys in your Earth Realm, which would your people miss first, and which would disappear almost unnoticed?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.01,
    padArousal: 0.11,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What is one everyday thing in your Realm that looks trivial from the outside but quietly holds a lot of people together, the way cheese does for pizza here?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.11,
    padDominance: -0.02
  },

  // Pineaple – noticing The Expanse feeling
  {
    speakerCharacterId: '700002',
    utteranceText: 'When someone in your Earth Realm says life feels empty or flat, does that sound more like a passing mood, or like they have brushed up against their own version of The Expanse?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.11,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What signs would tell you that someone in your Realm is starting to feel more like a Mutai—like a drifting fragment of feeling—than like a whole person?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.01,
    padArousal: 0.12,
    padDominance: -0.03
  },

  // Mixed – your Realm’s Council Of The Wise potential
  {
    speakerCharacterId: '700002',
    utteranceText: 'The Council Of The Wise in this Realm formed around a shared loss to The Expanse; in your Earth Realm, who would likely end up in a similar circle, if it existed?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.03,
    padArousal: 0.10,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If a Council like that appeared where you are, what kind of loss or experience do you think would be the thread that binds its members together?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.11,
    padDominance: -0.02
  },

  // Mixed – Earth Realm’s stance on burden and harm
  {
    speakerCharacterId: '700002',
    utteranceText: 'When your Earth Realm tells stories, do they lean more toward characters who absorb harm like Piza, or characters who cause harm like Pineaple, and what does that suggest to you?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.12,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If your Realm had to choose one lesson to learn from Piza and one from Pineaple, what do you think those two lessons would actually be?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.12,
    padDominance: -0.02
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1B batch import...');

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

      const tags = ['ltlm', 'partner_communication_management.encourage_more_detail', 'directive.socratic_questioning', 'piza_pineaple', 'act1'];
      const source = 'ltlmbrief.directive.socratic_questioning.piza_pineaple_act1b';
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
    console.log('LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1B batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1B batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1B batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1B batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
