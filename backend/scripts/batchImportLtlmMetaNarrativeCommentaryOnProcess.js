import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const utterances = [
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, I want to name the process here: I’m clarifying the path we’re taking so the next step feels grounded rather than abrupt.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'What I’m doing now, <SUBJECT>, is tracking the thread you’ve opened so I can keep the pacing aligned with you.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, let me comment on the process—we’re in a meaning-making phase, and my questions are aimed at helping you articulate your own view.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Right now, <SUBJECT>, I’m shifting us slightly so we don’t get stuck in one angle; that’s part of how I manage conversational flow.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: '<SUBJECT>, from a process standpoint, I’m checking whether the current direction still fits the intention you brought into this moment.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'I want to name the process here: I’m expanding the frame so the next piece of the conversation has room to land.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'From a process perspective, I’m clarifying this point to make sure we stay coordinated rather than drifting into parallel tracks.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'Let me comment on what I’m doing—I’m adjusting how much structure I bring in based on how you seem to be orienting.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'At this moment, I’m slowing the pace slightly; narratively, this is a stabilising move to keep the conversation balanced.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  },
  {
    speakerCharacterId: '700002',
    utteranceText: 'This is a bit of process commentary: I’m highlighting the shift so you can see why the conversation is moving in this direction.',
    dialogueFunctionCode: 'partner_communication_management.confirm_partner_state',
    speechActCode: 'assertive.explain',
    narrativeFunctionCodeRaw: 'meta_narrative.commentary_on_process',
    outcomeIntentCodeRaw: null,
    padPleasure: 0.11,
    padArousal: 0.05,
    padDominance: 0.12
  }
];

async function run() {
  const client = await pool.connect();

  try {
    console.log('Starting LTLM meta_narrative.commentary_on_process batch import...');
    await client.query('BEGIN');

    for (const u of utterances) {
      const trainingExampleId = await generateHexId('ltlm_training_example_id');

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
        ) VALUES (
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

      const source = 'ltlmbrief.meta_narrative.commentary_on_process';
      const tags = ['ltlm', 'meta_narrative.commentary_on_process'];
      const isCanonical = true;
      const difficulty = 1;
      const categoryConfidence = 1.0;
      const notes = null;
      const createdBy = '700002';
      const emotionRegisterId = null;

      await client.query(
        insertExampleSql,
        [
          trainingExampleId,
          u.speakerCharacterId,
          u.utteranceText,
          u.dialogueFunctionCode,
          u.speechActCode,
          u.narrativeFunctionCodeRaw,
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
    }

    await client.query('COMMIT');
    console.log('LTLM meta_narrative.commentary_on_process batch import committed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('LTLM meta_narrative.commentary_on_process batch import failed.');
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => console.log('LTLM meta_narrative.commentary_on_process batch import script finished.'))
  .catch((err) => {
    console.error('Unexpected error in batch import script.');
    console.error(err);
    process.exitCode = 1;
  });
