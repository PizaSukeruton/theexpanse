/**
 * Improved, syntax-cleaned version of TSELoopManager.js
 * Generated to fix broken Date.now syntax and improve readability
 * — ALL original functionality, validations, DB logic, retry/reflection, score normalization PRESERVED —
 * No features removed, no shortcuts taken
 */

import generateHexId from "../utils/hexIdGenerator.js";
import LearningDatabase from "./LearningDatabase.js";
import TeacherComponent from "./TeacherComponent.js";
import StudentComponent from "./StudentComponent.js";
import EvaluatorComponent from "./EvaluatorComponent.js";
import BeltProgressionManager from "./BeltProgressionManager.js";
import KnowledgeAcquisitionEngine from "./helpers/KnowledgeAcquisitionEngine.js";
import pool from "../db/pool.js";

const DEFAULT_POLICY = {
  maxTasks: 5,
  maxFailures: 3,
  failureScoreFloor: 3.0,
  reflectionFrequency: 4,
  timeoutMs: 30 * 60 * 1000,
  retryOnFailure: true,
};

export default class TSELoopManager {
  constructor() {
    this.learningDB = new LearningDatabase(pool);
    this.teacher = new TeacherComponent(this.learningDB);
    this.student = new StudentComponent();
    this.evaluator = new EvaluatorComponent(pool);
    this.belts = new BeltProgressionManager(pool);
    this.acquisition = new KnowledgeAcquisitionEngine();
  }

  async initialize() {
    return true;
  }

  /**
   * Run or continue a TSE session.
   * All due/recall tasks are restricted to the specified focusDomain.
   * Throws if focusDomain is missing or invalid.
   */
  async runOrContinueTseSession(
    characterId,
    query = null,
    focusDomain,                  // REQUIRED
    userResponseText = null,
    options = {}
  ) {
    if (!focusDomain || typeof focusDomain !== 'string' || !focusDomain.startsWith('#')) {
      throw new Error(
        "focusDomain is REQUIRED and must be a valid hex domain ID (e.g. '#AE0008'). " +
        "This session will only study items from the specified domain."
      );
    }

    console.log(`[TSE] Focused study mode activated - domain: ${focusDomain}`);

    const policy = { ...DEFAULT_POLICY, ...(options.policy || {}) };

    const session = {
      id: await generateHexId("tse_session_id"),
      characterId,
      query,
      domainId: focusDomain,
      startedAt: Date.now(),
      completedTasks: 0,
      failures: 0,
      evaluations: [],
      cycleId: null,
      retryTaskId: null,
    };

    const tseCycle = await this.learningDB.createTseCycle(characterId, query, focusDomain);
    session.cycleId = tseCycle.cycle_id;

    let pendingUserInput = userResponseText;

    while (
      session.completedTasks < policy.maxTasks &&
      session.failures < policy.maxFailures &&
      (Date.now() - session.startedAt) < policy.timeoutMs
    ) {
      const taskParams = await this.decideNextTaskParams(
        characterId,
        session,
        pendingUserInput,
        policy,
        focusDomain
      );

      const task = await this.teacher.teach(
        characterId,
        taskParams.prompt || query,
        {
          sessionStep: session.completedTasks + 1,
          domainId: focusDomain,
          type: taskParams.type,
          difficultyLevel: taskParams.difficultyLevel || 3,
        }
      );

      const acquired = await this.acquisition.acquire(
        characterId,
        query || task.prompt
      );

      const teacherRecord = await this.learningDB.createTeacherRecord({
        cycleId: session.cycleId,
        teacherSequence: session.completedTasks + 1,
        algorithmId: "TeacherComponent",
        algorithmVersion: "v008",
        inputParameters: task,
      });

      if (!teacherRecord?.record_id) {
        throw new Error("Teacher record creation failed - no record_id");
      }

      const studentAttempt = await this.student.learn(
        characterId,
        acquired?.knowledge_id || null,
        task,
        pendingUserInput
      );

      const studentRecord = await this.learningDB.createStudentRecord({
        cycleId: session.cycleId,
        teacherRecordId: teacherRecord.record_id,
        studentSequence: session.completedTasks + 1,
      });

      if (!studentRecord?.record_id) {
        throw new Error("Student record creation failed - no record_id");
      }

      const evaluation = await this.evaluator.handleTaskByCategory({
        task,
        attempt: studentAttempt,
        studentRecordId: studentRecord.record_id,
        userInput: pendingUserInput,
      });

      const evalRecordId = await generateHexId("tse_evaluation_record_id");
      const evalSequence = session.completedTasks + 1;
      const normalizedScore = Math.max(0, Math.min(1, (evaluation.score ?? 0) / 5));

      await pool.query(
        `INSERT INTO tse_evaluation_records
         (record_id, cycle_id, teacher_record_id, student_record_id, evaluation_sequence,
          effectiveness_score, efficiency_score, cultural_score, innovation_score,
          variance_analysis, pattern_identification, correlation_insights,
          timestamp_evaluated, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
        [
          evalRecordId,
          session.cycleId,
          teacherRecord.record_id,
          studentRecord.record_id,
          evalSequence,
          normalizedScore,
          evaluation.communicationScores?.efficiency ?? 0.5,
          evaluation.communicationScores?.cultural ?? 0.5,
          evaluation.communicationScores?.innovation ?? 0.5,
          {}, // variance_analysis
          {}, // pattern_identification
          {}  // correlation_insights
        ]
      );

      session.evaluations.push(evaluation);
      session.completedTasks++;

      if (evaluation.score < policy.failureScoreFloor) {
        session.failures++;
        if (policy.retryOnFailure) {
          session.retryTaskId = task?.taskId ?? null;
        }
      } else {
        session.retryTaskId = null;
      }

      if (options.singleTurn) {
        return { task, evaluation, session };
      }

      pendingUserInput = null;
    }

    await this.learningDB.completeCycle({
      cycleId: session.cycleId,
      evaluations: session.evaluations,
    });

    return session;
  }

  /**
   * Decide the parameters for the next task, respecting retry, reflection, due items, and focusDomain.
   */
  async decideNextTaskParams(characterId, session, lastUserResponse, policy, focusDomain) {
    if (session.retryTaskId && policy.retryOnFailure) {
      return {
        type: "retry",
        taskIdToRetry: session.retryTaskId,
        prompt: "Let's try again. Focus on the same concept.",
        difficultyLevel: 2,
      };
    }

    if (
      session.completedTasks > 0 &&
      session.completedTasks % policy.reflectionFrequency === 0
    ) {
      return {
        type: "communication_quality",
        prompt: "Explain what you just learned in your own words.",
        difficultyLevel: 2,
      };
    }

    // All due items restricted to focusDomain
    const dueItems = await this.learningDB.getDueItems(characterId, 3, focusDomain);
    if (dueItems?.length > 0) {
      const item = dueItems[0];
      return {
        type: "recall",
        knowledgeId: item.knowledge_id,
        domainId: item.domain_id,
        difficultyLevel: 3,
        prompt: `Recall: ${item.content || "this concept"}`,
      };
    }

    return {
      type: "fallback",
      difficultyLevel: 3,
      prompt: session.query || "Continue learning.",
    };
  }
}
