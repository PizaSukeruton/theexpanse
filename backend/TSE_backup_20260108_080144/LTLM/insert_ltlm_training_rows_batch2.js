import pool from "../../db/pool.js";
import generateHexId from "../../utils/hexIdGenerator.js";

const SPEAKER_ID = "#700002"; // Claude The Tanuki
const CATEGORY = "#005219";  // SOCIAL_STATE_RELAY

const SENTENCES = [
  "<SUBJECT> seems less available for interaction right now — it may be worth waiting.",
  "<SUBJECT> appears harder to reach at the moment — holding off could be preferable.",
  "<SUBJECT> comes across as less responsive than usual — pausing for now might help.",
  "<SUBJECT> seems quieter at this time — checking back later may be the better choice.",
  "<SUBJECT> appears to be taking longer between responses — waiting briefly could be worthwhile.",
  "<SUBJECT> seems less open to engagement right now — it might be best to hold off.",
  "<SUBJECT> comes across as somewhat withdrawn at the moment — pausing may be advisable.",
  "<SUBJECT> appears slower to engage than expected — waiting a while could help.",
  "<SUBJECT> seems less forthcoming right now — checking in later might work better.",
  "<SUBJECT> comes across as more reserved at this time — holding off for now seems reasonable.",
  "<SUBJECT> appears less inclined toward extended interaction — pausing briefly may be wise.",
  "<SUBJECT> seems to require more time between exchanges — waiting could be the better approach.",
  "<SUBJECT> comes across as harder to connect with right now — it may help to wait.",
  "<SUBJECT> appears less quick to respond at the moment — holding off might be preferable.",
  "<SUBJECT> seems to be offering shorter responses than usual — pausing for now could help.",
  "<SUBJECT> comes across as less present in the exchange — checking back later may be better.",
  "<SUBJECT> appears to need additional time before proceeding — waiting seems appropriate.",
  "<SUBJECT> seems less engaged at this moment — it could be worth pausing briefly.",
  "<SUBJECT> comes across as taking more consideration than usual — holding off may help.",
  "<SUBJECT> appears somewhat distant right now — waiting a bit could be worthwhile.",
  "<SUBJECT> seems less ready to continue at the moment — pausing might be the right call.",
  "<SUBJECT> comes across as needing more space between interactions — checking back later seems wise.",
  "<SUBJECT> appears to be responding with less detail — waiting for now may be preferable.",
  "<SUBJECT> seems slower to pick up the thread — holding off briefly could help.",
  "<SUBJECT> comes across as less interactive than expected — pausing at this point seems reasonable.",

  "<SUBJECT> appears ready to proceed — engaging now makes sense.",
  "<SUBJECT> seems responsive and available — this is a suitable time to continue.",
  "<SUBJECT> comes across as open to interaction — moving forward is appropriate.",
  "<SUBJECT> appears sufficiently engaged at this time — proceeding seems reasonable.",
  "<SUBJECT> seems prepared to continue the exchange — engagement is fitting now.",
  "<SUBJECT> comes across as receptive right now — this appears to be a good moment.",
  "<SUBJECT> appears quick to respond at the moment — continuing makes sense.",
  "<SUBJECT> seems present and available — proceeding is appropriate at this time.",
  "<SUBJECT> comes across as ready to engage — moving forward now seems suitable.",
  "<SUBJECT> appears open to extended interaction — this is an appropriate time to continue.",
  "<SUBJECT> seems attentive and responsive — engagement at this moment is fitting.",
  "<SUBJECT> comes across as available for conversation — proceeding now makes sense.",
  "<SUBJECT> appears willing to continue — this seems like a good time to engage.",
  "<SUBJECT> seems ready to move forward — continuing the exchange is appropriate.",
  "<SUBJECT> comes across as sufficiently present — engagement now seems reasonable.",
  "<SUBJECT> appears responsive to input at this time — proceeding is suitable.",
  "<SUBJECT> seems prepared for further interaction — this is a fitting moment to continue.",
  "<SUBJECT> comes across as engaged and available — moving forward makes sense now.",
  "<SUBJECT> appears ready for the next step — engagement at this time is appropriate.",
  "<SUBJECT> seems quick to pick up the exchange — continuing now seems fitting.",
  "<SUBJECT> comes across as open and receptive — this appears to be an appropriate moment.",
  "<SUBJECT> appears present in the interaction — proceeding now is reasonable.",
  "<SUBJECT> seems available and responsive — engagement at this time makes sense.",
  "<SUBJECT> comes across as prepared to continue — moving forward is suitable now.",
  "<SUBJECT> appears engaged and ready — this is an appropriate time to proceed."
];

async function run() {
  try {
    for (const text of SENTENCES) {
      const trainingId = await generateHexId("ltlm_training_example_id");

      await pool.query(
        `
        INSERT INTO training_insertion_data (
          training_id,
          candidate_text,
          category,
          speaker_character_id,
          pad_pleasure,
          pad_arousal,
          pad_dominance,
          tanuki_level,
          has_reality,
          has_relationships,
          has_events,
          appropriateness_score,
          source,
          created_by,
          labeling_notes
        ) VALUES (
          $1,$2,$3,$4,
          0.0,0.0,
          CASE
            WHEN $2 LIKE '%ready%' OR $2 LIKE '%responsive%' OR $2 LIKE '%available%' THEN 0.6
            ELSE -0.6
          END,
          0.3,
          false,false,false,
          1.0,
          'human_annotation',
          'manual_voice_anchor',
          'Batch LTLM social timing insert'
        )
        `,
        [trainingId, text, CATEGORY, SPEAKER_ID]
      );

      console.log(`✅ Inserted ${trainingId}`);
    }
  } catch (err) {
    console.error("❌ Batch insert failed:", err);
  } finally {
    await pool.end();
  }
}

run();
