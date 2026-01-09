// StudentComponent_fixed.js – Phase 108 consolidated fixes + placeholder removed
// Critical fixes (unchanged):
// - #6: Added await on generateHexId("tse_attempt_id")
// - #7: Removed dead evaluateReview call
// - Personality error injection robust
// - Better null-safety
// FIX: Removed polluting " (note: attention to detail included)" from detail-oriented trait

import traitManager from "../traits/TraitManager.js";
import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";
import MechanicalBrain_v2 from "./TanukiEngine/MechanicalBrain_v2.js";
import TriggerPhraseDetector from "./TanukiEngine/TriggerPhraseDetector.js";

export default class StudentComponent {
  constructor() {
    this.pool = pool;
    this.traits = traitManager; // already an instance
    this.nodeId = Math.floor(Math.random() * 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  }

  async initialize() {
    return true;
  }

  /**
   * Simulate student's attempt to learn / respond to a task
   * @param {string} characterId
   * @param {string|null} knowledgeId
   * @param {object} task - From TeacherComponent
   * @param {string|null} userResponseText - Real user input (if provided)
   * @returns {object} attempt result with attemptId, attemptText, metadata
   */
  async learn(characterId, knowledgeId, task, userResponseText = null) {
    const attemptId = await generateHexId("tse_attempt_id"); // FIX #6: added await

    let attemptText = "";
    let isRealInput = false;

    if (userResponseText && typeof userResponseText === "string" && userResponseText.trim()) {
      attemptText = userResponseText.trim();
      isRealInput = true;
    } else {
      // Simulated response path
      const detector = new TriggerPhraseDetector();
      const triggerResult = detector.detect(task.input || "");

      if (triggerResult.matched) {
        const brain = new MechanicalBrain_v2();
        attemptText = await brain.generateResponse(
          triggerResult.cleanedInput,
          triggerResult.characterId || characterId
        );
      } else {
        attemptText = this._generateSimulatedResponse(task);
      }
    }

    // Apply personality-based modifications / errors
    attemptText = await this._applyPersonalityErrors(characterId, attemptText);

    const now = new Date();
    const metadata = {
      responseLength: attemptText.length,
      wordCount: attemptText.trim().split(/\s+/).filter(Boolean).length,
      timestamp: now.toISOString(),
      isRealInput,
      outcomeIntent: task.metadata?.target_outcome_intent || "neutral",
    };

    return {
      attemptId,
      taskId: task.taskId,
      characterId,
      knowledgeId,
      attemptText,
      studentNode: this.nodeId,
      metadata,
    };
  }

  /**
   * Generate fallback / placeholder response when no real input or trigger
   * @private
   */
  _generateSimulatedResponse(task) {
    const taskType = (task.taskType || "").toLowerCase();

    switch (taskType) {
      case "recall":
        return `I remember: ${task.input || "the fact"}.`;

      case "application":
        return `Applying it: ${task.input || "example usage"}.`;

      case "review":
        return `Reviewing: ${task.input || "key points so far"}.`;

      case "cause_effect_rewrite":
        return this._attemptCauseEffectRewrite(task.input || "");

      case "sentence_clarity_rewrite":
        return this._attemptSentenceClarityRewrite(task.input || "");

      case "summarize_core_point":
        return this._attemptSummarizeCorePoint(task.input || "");

      case "communication_quality":
      case "clarification":
        return this._attemptCommunicationQuality(task.input || "", task);

      default:
        return "I do not understand this task yet.";
    }
  }

  _attemptCauseEffectRewrite(text) {
    if (!text) return "No input provided.";
    return text.trim()
      .replace(/\s+and then\s+/gi, () => (Math.random() > 0.5 ? " → so " : " → therefore "))
      .replace(/\s+and\s+/gi, ", because ")
      .replace(/\.\s*$/, ". As a result...");
  }

  _attemptSentenceClarityRewrite(text) {
    if (!text) return "No input provided.";
    return text
      .trim()
      .replace(/\s+and\s+/gi, ". ")
      .replace(/\s*,\s*/g, ". ")
      .split(". ")
      .map(s => s.trim())
      .filter(s => s.length > 5)
      .join(". ");
  }

  _attemptSummarizeCorePoint(text) {
    if (!text) return "No input provided.";
    const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
    if (!sentences.length) return text.trim();

    const take = Math.max(1, Math.ceil(sentences.length * 0.5));
    let summary = sentences.slice(0, take).join(". ");
    if (take < sentences.length) summary += "...";
    else if (!summary.endsWith(".")) summary += ".";
    return summary;
  }

  _attemptCommunicationQuality(text, task) {
    if (!text) return "No input provided.";
    let result = text.trim()
      .replace(/^Explain /i, "Let me share: ")
      .replace(/\s+are\s+/gi, " involve ");

    // Plain ending – no forced enthusiasm (evaluation integrity)
    if (!result.endsWith(".") && !result.endsWith("!") && !result.endsWith("?")) {
      result += ".";
    }

    return result;
  }

  /**
   * Apply character personality traits to modify the response
   * Higher trait values → stronger influence
   * - Impulsive (>70): may truncate sentences
   * - Forgetful (>65): removes causal connectors
   * - Detail-oriented (>60): adds detail note  ← REMOVED this polluting note
   * - Overconfident (>75): adds boastful prefix
   */
  async _applyPersonalityErrors(characterId, text) {
    const traits = await this.traits.getTraitVector(characterId);
    let result = text;

    const impulsive       = traits["#0000A1"] ?? 50;
    const forgetful       = traits["#0000B2"] ?? 50;
    const detailOriented  = traits["#0000C3"] ?? 50;
    const overconfident   = traits["#0000D4"] ?? 50;

    if (impulsive > 70 && result.includes(".")) {
      const parts = result.split(".");
      if (parts.length > 1) parts.pop();
      result = parts.join(".") + ".";
    }

    if (forgetful > 65) {
      result = result.replace(
        /\b(because|so|therefore|as a result|which led to|which caused)\b/gi,
        "..."
      );
    }

    // REMOVED: if (detailOriented > 60) { result += " (note: attention to detail included)"; }

    if (overconfident > 75) {
      result = "I know this! " + result;
    }

    return result;
  }
}
