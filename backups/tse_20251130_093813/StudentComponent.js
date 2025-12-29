// backend/TSE/StudentComponent.js

import TraitManager from "../traits/TraitManager.js";
import pool from "../db/pool.js";

export default class StudentComponent {
  constructor() {
    this.pool = pool;
    this.traits = new TraitManager();
    this.nodeId = Math.floor(Math.random() * 256).toString(16).toUpperCase();
  }

  async initialize() {
    console.log("[TSE-Student2] Initialized with node ID:", this.nodeId);
    return true;
  }

  /**
   * Main learning entry point (stub for now — full FSRS later)
   */
  async learn(characterId, knowledgeId, grade) {
    console.log(`[StudentComponent] Learning event for ${characterId} → ${knowledgeId} (grade ${grade})`);
    // Student just forwards data to Evaluator
    return true;
  }
}
