import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const OUTCOME_INTENT_CODE = 'cognitive_outcomes.increase_understanding';

const utterances = [
  // 1) Elemental nature & core drive
  {
    speakerCharacterId: '700002',
    utteranceText: 'Pineaple Yurei is less a person and more an elemental force, built entirely around draining joy from whatever Realm he touches.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.18,
    padArousal: 0.10,
    padDominance: 0.20
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Where other beings debate motives or morals, Pineaple simply feeds; his nature is to consume joy and expand The Expanse that is bound up with his being.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.19,
    padArousal: 0.11,
    padDominance: 0.22
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'He is not angry in a human way most of the time; he is more like gravity for joy, pulling it out of places until they feel hollow and white.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.17,
    padArousal: 0.08,
    padDominance: 0.21
  },

  // 2) View of beings as fuel
  {
    speakerCharacterId: '700002',
    utteranceText: 'To Pineaple Yurei, the beings dragged into The Expanse are not individuals; they are more like battery‑caged sources of emotional current.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.20,
    padArousal: 0.09,
    padDominance: 0.23
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'He does not regret what happens to them; their fractured feelings simply keep his void alive and spreading.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.21,
    padArousal: 0.10,
    padDominance: 0.24
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'In Pineaple’s view, suffering is not a tragedy or a warning; it is infrastructure that lets The Expanse keep growing.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.19,
    padArousal: 0.09,
    padDominance: 0.23
  },

  // 3) Pineapple-on-pizza mask choice
  {
    speakerCharacterId: '700002',
    utteranceText: 'When Pineaple enters a Realm, he has to choose a form that the locals will react to; here, he picked the shape of a pineapple ghost haunting pizza arguments.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.10,
    padArousal: 0.11,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'The pineapple‑on‑pizza mask is not about his personal taste; it is a convenient symbol that pokes at a tiny war already simmering in this Earth Realm.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.11,
    padArousal: 0.12,
    padDominance: 0.19
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'He wears the joke of pineapple on pizza like armour, knowing that it will draw attention while he quietly erases the joy underneath.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.12,
    padArousal: 0.12,
    padDominance: 0.20
  },

  // 4) Body as The Expanse
  {
    speakerCharacterId: '700002',
    utteranceText: 'The Expanse is not just Pineaple Yurei’s doorway; it is effectively his body spread thin—a formless white field made from all the joy he has already consumed.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.18,
    padArousal: 0.09,
    padDominance: 0.22
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'When he leaves a Realm through The Expanse, he drags whatever joy he has stolen back into that white void, and the vacuum he creates pulls new beings in behind him.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.19,
    padArousal: 0.10,
    padDominance: 0.23
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Every new Mutai that flickers to life inside The Expanse is a side effect of Pineaple passing through a Realm and taking more than it could safely lose.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.17,
    padArousal: 0.11,
    padDominance: 0.21
  },

  // 5) History with Piza’s home Realm and first battle
  {
    speakerCharacterId: '700002',
    utteranceText: 'Before this Earth Realm, Pineaple Yurei had already stripped Piza’s home Realm of joy, leaving it as a place where feeling anything became almost impossible.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.20,
    padArousal: 0.11,
    padDominance: 0.22
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Inside The Expanse they fought, and for once Pineaple was bested; Piza managed to slip back out, only to find his home already emptied of joy.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.16,
    padArousal: 0.13,
    padDominance: 0.18
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'After that encounter, Pineaple closed The Expanse to everyone but himself; if someone falls in now, they do not get to leave the way Piza once did.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.21,
    padArousal: 0.12,
    padDominance: 0.24
  },

  // 6) Relationship to Piza now
  {
    speakerCharacterId: '700002',
    utteranceText: 'Out of all the beings he has touched, Piza is the only one Pineaple does not fully understand, and that unsettles him more than he admits.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.14,
    padArousal: 0.12,
    padDominance: 0.20
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'He does not think of Piza as a rival in a fair story; he thinks of him as a flaw in the design of his own existence that must be removed.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.18,
    padArousal: 0.13,
    padDominance: 0.22
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Ending Piza would mean closing off the one known exit from The Expanse, and that makes Pineaple more determined to hunt him than any other being.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.19,
    padArousal: 0.13,
    padDominance: 0.23
  },

  // 7) Current threat to the Earth Realm
  {
    speakerCharacterId: '700002',
    utteranceText: 'In this version of the Earth Realm, Pineaple has started by erasing cheeses from existence, quietly hollowing out the simple joys that used to sit on a slice.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.16,
    padArousal: 0.12,
    padDominance: 0.21
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Every cheese he vanishes removes the soul from the pizzas that depended on it, turning them into Angry Pizza Slices that lash out at everything still left here.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.17,
    padArousal: 0.13,
    padDominance: 0.22
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From Pineaple’s perspective, this Earth Realm is just another field to harvest; from everyone else’s perspective, it is where the Cheese Wars have truly begun.',
    dialogueFunctionCode: 'task_management.explain',
    speechActCode: 'assertive.describe',
    narrativeFunctionCodeRaw: 'structure_beats.opening',
    outcomeIntentCodeRaw: OUTCOME_INTENT_CODE,
    padPleasure: -0.15,
    padArousal: 0.12,
    padDominance: 0.21
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM assertive.describe + task_management.explain + Pineaple Act 1 batch import...');

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

      const tags = ['ltlm', 'task_management.explain', 'assertive.describe', 'pineaple_yurei', 'act1'];
      const source = 'ltlmbrief.assertive.describe.pineaple_act1';
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
    console.log('LTLM assertive.describe + task_management.explain + Pineaple Act 1 batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM assertive.describe + task_management.explain + Pineaple Act 1 batch import failed, transaction rolled back.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('LTLM assertive.describe + task_management.explain + Pineaple Act 1 batch import script finished.');
  })
  .catch((err) => {
    console.error('Unexpected error in LTLM assertive.describe + task_management.explain + Pineaple Act 1 batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
