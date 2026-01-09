import { TSE_CURRICULUM } from "./tse_curriculum.js";
import traitManager from "../traits/TraitManager.js"; 
import generateHexId from "../utils/hexIdGenerator.js";
import KnowledgeResponseEngine from "./helpers/KnowledgeResponseEngine.js";
import { getNaturalLanguageGenerator } from './helpers/NaturalLanguageGeneratorSingleton.js';

export default class TeacherComponent {
  // CHANGE 1: Accept learningDB in constructor
  constructor(learningDB) {
    this.learningDB = learningDB; 
    
    this.nodeId = Math.floor(Math.random() * 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");

    this.nlg = getNaturalLanguageGenerator();
    this.responseEngine = new KnowledgeResponseEngine();
  }

  async initialize() {
    return true;
  }

  getNodeId() {
    return this.nodeId;
  }

  async teach(characterId, query, context) {
    const baseDifficulty = await this._computeTraitDifficulty(characterId);
    const difficulty = await this._applyAdaptiveDifficulty(characterId, baseDifficulty);

    const candidates = TSE_CURRICULUM.filter((t) => t.difficulty === difficulty);
    // Fallback if no tasks match difficulty
    const selectedCandidates = candidates.length > 0 ? candidates : TSE_CURRICULUM;
    const selected = selectedCandidates[Math.floor(Math.random() * selectedCandidates.length)];

    const taskId = await generateHexId("tse_task_id");

    return {
      taskId,
      taskType: selected.taskType,
      instructions: selected.instructions,
      input: selected.input,
      expectedFormat: selected.expectedFormat,
      difficulty,
      characterId,
      metadata: {
        teacherNode: this.nodeId,
        difficulty,
        traitDifficulty: baseDifficulty,
        context
      }
    };
  }

  async generateFollowUpTask(originalTask, evaluation) {
    const taskId = await generateHexId("tse_task_id");
    const score = evaluation?.score ?? 0;

    let followType = originalTask.taskType;
    let difficulty = originalTask.difficulty;

    if (score >= 4) difficulty = Math.min(3, difficulty + 1);
    if (score <= 2) difficulty = Math.max(1, difficulty - 1);

    const candidates = TSE_CURRICULUM.filter(
      (t) => t.taskType === followType && t.difficulty === difficulty
    );

    if (candidates.length === 0) return null;

    const selected = candidates[Math.floor(Math.random() * candidates.length)];

    return {
      taskId,
      taskType: selected.taskType,
      instructions: selected.instructions,
      input: selected.input,
      expectedFormat: selected.expectedFormat,
      difficulty,
      characterId: originalTask.characterId,
      metadata: {
        teacherNode: this.nodeId,
        chainFrom: originalTask.taskId,
        difficulty
      }
    };
  }

  async _computeTraitDifficulty(characterId) {
    const traits = await traitManager.getTraitVector(characterId);
    let difficulty = 1;
    const inquisitive = traits["#00005A"] || 50;
    const overwhelmed = traits["#000012"] || 50;

    if (inquisitive > 65) difficulty++;
    if (inquisitive > 85) difficulty++;
    if (overwhelmed > 65) difficulty--;
    if (overwhelmed > 85) difficulty--;

    if (difficulty < 1) difficulty = 1;
    if (difficulty > 3) difficulty = 3;

    return difficulty;
  }

  async _applyAdaptiveDifficulty(characterId, baseDifficulty) {
    // CHANGE 2: Check if learningDB exists before using it
    if (!this.learningDB) {
        console.warn("TeacherComponent: learningDB not initialized, skipping adaptive difficulty.");
        return baseDifficulty;
    }

    try {
        const scores = await this.learningDB.getRecentScores(characterId);
        if (!scores || scores.length === 0) return baseDifficulty;

        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        let difficulty = baseDifficulty;
        if (avg >= 4) difficulty++;
        if (avg <= 2) difficulty--;
        if (difficulty < 1) difficulty = 1;
        if (difficulty > 3) difficulty = 3;
        return difficulty;
    } catch (e) {
        console.error("Adaptive difficulty error:", e);
        return baseDifficulty;
    }
  }
}
