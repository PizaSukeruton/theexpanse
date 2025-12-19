import pool from "../db/pool.js";
import generateHexId from "../utils/hexIdGenerator.js";

const CATEGORY_CHILDREN = {
  dialogue_function_categories: {
    task_management: [
      "instruct", "propose", "request_action", "guide_step", "explain", "summarise"
    ],
    auto_feedback: [
      "thinking_marker", "acknowledging_understanding", "confidence_marker_low", "confidence_marker_high"
    ],
    allo_feedback: [
      "positive_feedback", "negative_feedback", "neutral_feedback",
      "request_clarification", "check_heard_correctly"
    ],
    turn_management: [
      "take_turn", "hold_turn", "yield_turn", "barge_in_recovery", "manage_overlap"
    ],
    time_management: [
      "time_check", "schedule_reference", "pace_control"
    ],
    channel_management: [
      "channel_check", "re_establish_connection", "repair_missed_audio"
    ],
    own_communication_management: [
      "self_repair", "self_correction", "abandon_utterance"
    ],
    partner_communication_management: [
      "clarify_partner_intent", "encourage_more_detail", "confirm_partner_state", "prompt_minimal_response"
    ],
    topic_management: [
      "introduce_topic", "shift_topic", "close_topic", "summarise_discussion"
    ],
    social_obligations_management: [
      "greet", "thank", "apologise", "farewell", "acknowledge", "address_term_usage"
    ]
  },

  speech_act_categories: {
    assertive: [
      "inform","describe","explain","evaluate","compare",
      "contrast","hypothesis","counterfactual_scenario",
      "synthesis_comparison","attribution_explicit",
      "epistemic_hedge","correction_acceptance",
      "modality_clarification"
    ],
    expressive: [
      "empathize","sympathize","console","encourage",
      "praise","comfort","wish","self_disclosure"
    ],
    directive: [
      "request","suggest","instruct","guide","invite_action",
      "forbid","permit","refuse","scaffolding_prompt","socratic_questioning"
    ],
    commissive: [
      "promise","commit","guarantee","offer","threaten"
    ],
    safe_refusal: [
      "refusal_capability","refusal_ethical","boundary_enforcement","soft_deflection"
    ],
    feedback_elicitation: [
      "elicit_confirmation","elicit_preference","elicit_assent","elicit_disagreement"
    ],
    correction_solicitation: [
      "request_correction"
    ]
  },

  narrative_function_categories: {
    structure_beats: [
      "opening","development","climax","resolution","closing","foreshadowing","establishing_stakes"
    ],
    development_beats: [
      "deepen","pivot","escalate","reveal","reframe","hold_space","normalize"
    ],
    continuity_functions: [
      "callback_immediate","callback_session","callback_historical","continuity_bridge"
    ],
    anchor_mechanics: [
      "hook_tease","signpost_segment","room_reset","back_announce"
    ],
    atmospheric: [
      "sensory_grounding","surreal_transition","paradox_injection",
      "defamiliarization","world_building","pacing_beat"
    ],
    meta_narrative: [
      "breaking_frame","fourth_wall","unreliable_narration","commentary_on_process"
    ]
  },

  outcome_intent_categories: {
    cognitive_outcomes: [
      "increase_understanding","clarify_confusion","reframe_perspective",
      "present_alternative","stimulate_curiosity","set_expectation",
      "redirect_attention","test_mastery"
    ],
    emotional_outcomes: [
      "validate_experience","reduce_distress","increase_confidence",
      "comfort","contain_affect","provide_catharsis","support_resilience"
    ],
    behavioral_outcomes: [
      "encourage_action","discourage_action","reinforce_behavior",
      "model_behavior","increase_autonomy"
    ],
    relational_outcomes: [
      "build_rapport","maintain_presence","repair_rupture",
      "express_care","status_elevation","status_lowering",
      "status_leveling","assert_boundary","maintain_integrity"
    ]
  }
};

async function seed() {
  console.log("Seeding CHILD categories...\n");

  for (const [table, groups] of Object.entries(CATEGORY_CHILDREN)) {
    for (const [parentCode, children] of Object.entries(groups)) {
      for (const childCode of children) {
        const ID_MAP = { dialogue_function_categories: "dialogue_function_id", speech_act_categories: "speech_act_category_id", narrative_function_categories: "narrative_function_id", outcome_intent_categories: "outcome_intent_id" }; const idType = ID_MAP[table];
        const newId = await generateHexId(idType);

        const ID_COL = { dialogue_function_categories: "dialogue_function_id", speech_act_categories: "speech_act_category_id", narrative_function_categories: "narrative_function_id", outcome_intent_categories: "outcome_intent_id" };

        const insertQuery = `
          INSERT INTO ${table} ( ${ID_COL[table]}, category_code, name, description )
          VALUES ($1, $2, $3, $4) ON CONFLICT (category_code) DO NOTHING
        `;

        await pool.query(insertQuery, [
          newId,
          `${parentCode}.${childCode}`,
          childCode,
          null
        ]);

        console.log(`INSERTED: ${table} → ${newId} (${parentCode}.${childCode})`);
      }
    }
  }

  console.log("\nDONE.");
  process.exit(0);
}

seed().catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
