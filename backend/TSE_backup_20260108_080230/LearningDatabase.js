// LearningDatabase.js – Phase 108 fixes & focused domain support
// - Pure ESM, snake_case columns
// - getDueItems now accepts optional focusDomain (domain_id filter)
// - createTseCycle supports domain_id (column added to tse_cycles)
// - Defensive returns + error logging in key methods
// - RETURNING record_id in teacher/student record creation
// - No hardcoded domains — filtering is dynamic/optional

import { ensureConcept } from "./helpers/ensureConcept.js";
import generateHexId from "../utils/hexIdGenerator.js";
import pool from "../db/pool.js";
import { embedText } from "./helpers/semanticUtils.js";
import traitManager from "../traits/TraitManager.js";

export default class LearningDatabase {
  constructor(dbPool = pool) {
    this.pool = dbPool;
  }

  /**
   * Save a task attempt (teacher → student)
   * @returns attempt_id
   */
  async saveTaskAttempt({
    characterId,
    knowledgeId = null,
    taskId = null,
    attemptText = null,
    taskType = "unknown",
    taskPhase = "practice",
    score = null,
  }) {
    const attemptId = await generateHexId("tse_attempt_id");

    await this.pool.query(
      `INSERT INTO tse_task_attempts (
        attempt_id,
        character_id,
        knowledge_id,
        task_id,
        attempt_text,
        task_type,
        task_phase,
        score,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        attemptId,
        characterId,
        knowledgeId,
        taskId,
        attemptText,
        taskType,
        taskPhase,
        score,
      ]
    );

    return attemptId;
  }

  /**
   * Fetch due FSRS items for a character
   * Optional focusDomain: restrict to items in that domain only
   */
  async getDueItems(characterId, limit = 5, focusDomain = null) {
    try {
      let query = `
        SELECT
          cks.knowledge_id,
          ki.content,
          ki.domain_id,
          cks.next_review_timestamp,
          cks.difficulty,
          cks.stability,
          cks.current_retrievability
        FROM character_knowledge_state cks
        JOIN knowledge_items ki ON cks.knowledge_id = ki.knowledge_id
        WHERE cks.character_id = $1
          AND (cks.next_review_timestamp IS NULL OR cks.next_review_timestamp <= NOW())
      `;
      const params = [characterId];

      if (focusDomain) {
        query += ` AND ki.domain_id = $${params.length + 1}`;
        params.push(focusDomain);
      }

      query += `
        ORDER BY 
          cks.next_review_timestamp ASC NULLS FIRST,
          ki.complexity_score ASC
        LIMIT $${params.length + 1}
      `;
      params.push(limit);

      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (err) {
      console.error("[LearningDatabase] getDueItems failed:", err.message);
      throw err;
    }
  }

  /**
   * Create a new TSE cycle record
   * domainId is optional (nullable in tse_cycles)
   */
  async createTseCycle(characterId, query = null, domainId = null) {
    const cycleId = await generateHexId("tse_cycle_id");

    const sql = `
      INSERT INTO tse_cycles (
        cycle_id,
        character_id,
        user_message,
        domain_id,
        status,
        cycle_type,
        created_at
      ) VALUES ($1, $2, $3, $4, 'running', 'standard', NOW())
      RETURNING cycle_id, character_id, created_at
    `;

    const result = await this.pool.query(sql, [
      cycleId,
      characterId,
      query,
      domainId
    ]);

    return result.rows[0];
  }

  /**
   * Create teacher record (returns record_id)
   */
  async createTeacherRecord({
    cycleId,
    teacherSequence = 1,
    algorithmId = "TeacherComponent",
    algorithmVersion = "v008",
    inputParameters = {},
  }) {
    const recordId = await generateHexId("tse_teacher_record_id");

    const sql = `
      INSERT INTO tse_teacher_records (
        record_id,
        cycle_id,
        teacher_sequence,
        algorithm_id,
        algorithm_version,
        input_parameters,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING record_id
    `;

    const result = await this.pool.query(sql, [
      recordId,
      cycleId,
      teacherSequence,
      algorithmId,
      algorithmVersion,
      inputParameters
    ]);

    if (result.rows.length === 0) {
      throw new Error("Failed to insert teacher record");
    }

    return { record_id: result.rows[0].record_id };
  }

  /**
   * Create student record (returns record_id)
   */
  async createStudentRecord({
    cycleId,
    teacherRecordId,
    studentSequence = 1,
  }) {
    const recordId = await generateHexId("tse_student_record_id");

    const sql = `
      INSERT INTO tse_student_records (
        record_id,
        cycle_id,
        teacher_record_id,
        student_sequence,
        created_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING record_id
    `;

    const result = await this.pool.query(sql, [
      recordId,
      cycleId,
      teacherRecordId,
      studentSequence
    ]);

    if (result.rows.length === 0) {
      throw new Error("Failed to insert student record");
    }

    return { record_id: result.rows[0].record_id };
  }

  /**
   * Complete a cycle with aggregated metrics
   */
  async completeCycle({ cycleId, evaluations = [] }) {
    if (!cycleId) return null;

    const count = evaluations.length;
    let effectiveness = 0;
    let optimization = 0.5;

    if (count > 0) {
      const sumScores = evaluations.reduce((a, b) => a + (b.score ?? 0), 0);
      effectiveness = sumScores / count / 5; // normalize 0–5 → 0–1

      const sumComm = evaluations.reduce(
        (a, b) => a + (b.communicationScores?.efficiency ?? 0.5),
        0
      );
      optimization = sumComm / count;
    }

    const result = await this.pool.query(
      `UPDATE tse_cycles
       SET
         status = 'completed',
         completed_at = NOW(),
         learning_effectiveness = $1,
         optimization_score = $2,
         updated_at = NOW()
       WHERE cycle_id = $3
       RETURNING cycle_id, status, learning_effectiveness`,
      [effectiveness, optimization, cycleId]
    );

    return result.rows[0] ?? null;
  }

  // Placeholder for other methods (add your existing ones here as needed)
  async getMasterySummary(characterId) {
    // Implement or keep your existing version
    return [];
  }

  async computeComplexity(characterId, query) {
    // Implement or keep your existing version
    return 0.5;
  }

  async detectDomain(query) {
    // Implement or keep your existing version
    // No hardcoded domain — return null or throw if not implemented
    console.warn("[LearningDatabase] detectDomain called but not fully implemented");
    return null;
  }
}
