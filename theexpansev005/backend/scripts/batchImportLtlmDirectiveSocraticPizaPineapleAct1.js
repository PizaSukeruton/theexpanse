import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.stimulate_curiosity';

const utterances = [
  // Piza – misfit / out-of-step
  {
    speakerCharacterId: '700002',
    utteranceText: 'When you hear that Piza feels out of step with every Realm he lands in, does that sound strange in your Earth Realm, or quietly familiar?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.07,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'In your version of the Earth Realm, what usually happens to someone who moves through life feeling like Piza does—present, but always slightly out of rhythm?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.08,
    padDominance: -0.01
  },

  // Piza – carrying others’ pain
  {
    speakerCharacterId: '700002',
    utteranceText: 'Knowing that Piza is forced to feel echoes of the Mutai’s pain, how does your Realm usually treat people who seem to carry more than their share of hurt?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.01,
    padArousal: 0.09,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'If someone in your Earth Realm felt waves of pain that were not fully theirs, would they be seen as unwell, as strong, or as something harder to name?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.09,
    padDominance: -0.02
  },

  // Piza – silence vs honesty
  {
    speakerCharacterId: '700002',
    utteranceText: 'Piza mostly stays quiet because honesty has not gone well for him; in your Realm, does telling the truth usually bring connection, or trouble, or a mix of both?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.10,
    padDominance: -0.03
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'How much room is there, where you are, for someone to speak about burdens like Piza’s without it being dismissed as too much or too strange?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.10,
    padDominance: -0.04
  },

  // Piza – reactions to kindness / Council
  {
    speakerCharacterId: '700002',
    utteranceText: 'When you think about Frankie Trouble or the Council Of The Wise offering Piza small kindnesses, what does the closest thing to that look like in your Earth Realm?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.04,
    padArousal: 0.08,
    padDominance: -0.01
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Do people in your Realm tend to trust slow, steady kindness like the Council offers Piza, or do they wait for it to vanish or turn into something else?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.02,
    padArousal: 0.09,
    padDominance: -0.02
  },

  // Pineaple – joy-drain archetypes
  {
    speakerCharacterId: '700002',
    utteranceText: 'When you picture Pineaple slowly draining joy from a Realm, what comes to mind first in your Earth—an institution, a habit, a feeling, or something else entirely?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.11,
    padDominance: -0.01
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Are there places in your Earth Realm where people stay technically alive but feel emotionally emptied out in a way that reminds you, even a little, of The Expanse?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.03,
    padArousal: 0.11,
    padDominance: -0.02
  },

  // Pineaple – petty wars becoming big wounds
  {
    speakerCharacterId: '700002',
    utteranceText: 'In your version of the Earth Realm, do small arguments—like whether pineapple belongs on pizza—ever open up much larger cracks underneath?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.01,
    padArousal: 0.10,
    padDominance: -0.01
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What is an example, from your Realm, of something that looked like a joke or a tiny disagreement until you realised how much hurt was actually attached to it?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.11,
    padDominance: -0.02
  },

  // Pineaple – being treated as fuel
  {
    speakerCharacterId: '700002',
    utteranceText: 'Hearing that Pineaple sees beings as fuel, does your Earth Realm have spaces where people feel more like resources than like whole characters in their own story?',
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
    utteranceText: 'If someone in your Realm told you they felt “battery‑caged” the way the Mutai are, what kinds of situations would you guess they were talking about?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.02,
    padArousal: 0.11,
    padDominance: -0.03
  },

  // Mixed – how their Earth Realm would respond
  {
    speakerCharacterId: '700002',
    utteranceText: 'If your Earth Realm realised that someone like Pineaple was quietly erasing its small joys, do you think people would notice early, too late, or not at all?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.01,
    padArousal: 0.12,
    padDominance: -0.02
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Between someone like Piza, who carries too much, and someone like Pineaple, who takes too much, which type does your Realm seem to produce more of right now?',
    dialogueFunctionCode: 'partner_communication_management.encourage_more_detail',
    speechActCode: 'directive.socratic_questioning',
    narrativeFunctionCodeRaw: 'development_beats.deepen',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: 0.00,
    padArousal: 0.12,
    padDominance: -0.03
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1 batch import...');

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
      const source = 'ltlmbrief.directive.socratic_questioning.piza_pineaple_act1';
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
    console.log('LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1 batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1 batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1 batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM directive.socratic_questioning + partner_communication_management.encourage_more_detail + Piza/Pineaple Act 1 batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
