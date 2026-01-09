/**
 * LTLM_Input
 * -----------
 * This file defines the frozen input contract for the
 * Little Tanuki Language Model (LTLM).
 *
 * This is a STRUCTURAL SPECIFICATION ONLY.
 * No scoring, inference, or logic belongs here.
 *
 * Any change to this shape requires an explicit architectural decision.
 */

/**
 * @typedef LTLM_Input
 */
const LTLM_Input = {
  /**
   * The full candidate sentence AFTER template filling
   * but BEFORE final selection.
   */
  candidate_text: "",

  /**
   * Voice category of the candidate.
   * Examples:
   * - TEMPLATE
   * - UNCERTAINTY_MARKER
   * - SOCIAL_STATE_RELAY
   * - INTERACTION_FRAMING
   * - CULTURAL_VOICE
   */
  category: "",

  /**
   * Character speaking the line (usually Claude).
   */
  speaker_character_id: "",

  /**
   * Character being referenced or discussed (optional).
   * Null if the sentence is self-referential or abstract.
   */
  about_character_id: null,

  /**
   * Read-only emotional snapshot at the moment of response.
   */
  pad_snapshot: {
    pleasure: 0.0,
    arousal: 0.0,
    dominance: 0.0
  },

  /**
   * Current Tanuki narrative level.
   */
  tanuki_level: 0.0,

  /**
   * Grounding presence flags.
   * LTLM may know what grounding exists,
   * but not the content of that grounding.
   */
  grounding_flags: {
    has_reality: false,
    has_relationships: false,
    has_events: false
  }
};

export default LTLM_Input;
