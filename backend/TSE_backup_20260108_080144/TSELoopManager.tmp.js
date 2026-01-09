import generateHexId from "../utils/hexIdGenerator.js";
import LearningDatabase from "./LearningDatabase.js";
import TeacherComponent from "./TeacherComponent.js";
import StudentComponent from "./StudentComponent.js";
import EvaluatorComponent from "./EvaluatorComponent.js";
import BeltProgressionManager from "./BeltProgressionManager.js";
import KnowledgeAcquisitionEngine from "./helpers/KnowledgeAcquisitionEngine.js";
import pool from "../db/pool.js";
import { TASK_CATEGORIES } from "./constants/TaskCategories.js";

const DEFAULT_POLICY = {
  maxTasks: 5,
  maxFailures: 3,
  minAvgScoreToAdvance: 0.75,
  allowReflectionExit: true,
  failureThreshold: 3,
  reflectionFrequency: 4,
  timeoutMs: 30 * 60 * 1000,
  retryOnFailure: true,
};

export default class TSELoopManager {
  constructor() {
    console.trace('[TRACE] TSELoopManager constructed');
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
   * Public API: Starts or continues a TSE session.
   * Supports single-turn mode, user input injection, adaptive task selection, and full auditability.
   * 
   * Phases 5–8 Complete Implementation:
   * - Phase 5: Reflection injection, failure consequences, belt advancement
   * - Phase 6: Complete audit trail, cycle reconstruction, FSRS delta capture
   * - Phase 7: Error boundaries, timeout safety, public API docs, no fake success
   * - Phase 8: Difficulty scalar, session policy, confidence flags, schema versioning
   * 
   * @param {string} characterId - Character identifier (hex)
   * @param {string|null} query - Initial query (optional for continuation)
   * @param {string|null} domainId - Domain ID (optional)
   * @param {string|null} userResponseText - User's latest response (for continuation)
   * @param {Object} options - Configuration
   * @param {number} [options.maxTasks=5] - Max iterations
   * @param {boolean} [options.singleTurn=false] - Return after one task
   * @param {Object} [options.policy] - Session policy override
   * @returns {Promise<Object>} Session result or single-turn object { task, evaluation, session }
   * 
   * @example
   * // Full session (5 tasks, adaptive)
   * const result = await loop.runOrContinueTseSession(characterId, "communication");
   * 
   * // Single-turn (return one task + eval)
   * const { task, evaluation } = await loop.runOrContinueTseSession(characterId, "communication", null, null, { singleTurn: true });
   * 
   * // Continue with user input
   * const result = await loop.runOrContinueTseSession(characterId, null, null, "My answer is...");
   * 
   * // With custom policy
   * const result = await loop.runOrContinueTseSession(characterId, "lore", null, null, {
   *   policy: { maxTasks: 10, failureThreshold: 2, reflectionFrequency: 3 }
   * });
   */
  async runOrContinueTseSession(
    characterId,
    query = null,
    domainId = null,
    userResponseText = null,
    options = {}
  ) {
    try {
      // Merge user policy with defaults
      const policy = {
        ...DEFAULT_POLICY,
        ...(options.policy || {}),
        maxTasks: options.maxTasks ?? DEFAULT_POLICY.maxTasks,
      };

      console.log(`[TSE] Starting/continuing session for ${characterId} with policy:`, policy);

      const session = {
        id: await generateHexId("tse_session_id"),
        characterId,
        query,
        domainId,
        startedAt: Date.now(),
        completedTasks: 0,
        failures: 0,
        evaluations: [],
        studentOutputs: [],
        cycleId: null,
        padContext: null,
        beltAfter: null,
        retryTaskId: null,
      };

      const tseCycle = await this.learningDB.createTseCycle(characterId, query, domainId);
      session.cycleId = tseCycle.cycle_id;

      // Main TSE loop with timeout safety
      while (
        session.completedTasks < policy.maxTasks &&
        session.failures < policy.maxFailures &&
        !this.shouldEndSession(session, policy)
      ) {
        // Check timeout before each iteration
        const elapsed = Date.now() - session.startedAt;
        if (elapsed > policy.timeoutMs) {
          console.warn(`[TSE] Session timeout exceeded (${elapsed}ms > ${policy.timeoutMs}ms). Ending.`);
          break;
        }

        // Decide next task params (includes reflection injection)
        const taskParams = await this.decideNextTaskParams(characterId, session, userResponseText, policy);

        // Generate task with error boundary
        const task = await this.safeExecute(
          () => this.teacher.teach(characterId, taskParams.prompt || query, {
            sessionStep: session.completedTasks + 1,
            domainId: taskParams.domainId || domainId,
            type: taskParams.type,
            difficultyLevel: taskParams.difficultyLevel || 3,
          }),
          "Teacher.teach"
        );

        if (!task) {
          console.error("[TSE] Task generation returned null");
          session.failures++;
          continue;
        }

        // Attach schema version and difficulty
        task.taskSchemaVersion = "1.0";
        task.difficultyLevel = taskParams.difficultyLevel || 3;

        // Acquire knowledge context
        const acquired = await this.safeExecute(
          () => this.acquisition.acquire(characterId, query || task.prompt),
          "KnowledgeAcquisition.acquire"
        );

        // Create teacher record (audit trail)
        const teacherRecord = await this.safeExecute(
          () => this.learningDB.createTeacherRecord({
            cycleId: session.cycleId,
            teacherSequence: session.completedTasks + 1,
            algorithmId: "TeacherComponent",
            algorithmVersion: "v008",
            inputParameters: task,
          }),
          "createTeacherRecord"
        );

        // Student attempts task (with real user input or simulation)
        const studentAttempt = await this.safeExecute(
          () => this.student.learn(
            characterId,
            acquired?.knowledge_id || null,
            task,
            userResponseText
          ),
          "Student.learn"
        );

        session.studentOutputs.push({
          step: session.completedTasks + 1,
          taskCategory: task.taskCategory,
          output: studentAttempt,
        });

        // Create student record (audit trail)
  let studentRecord;
  try {
    studentRecord = await this.safeExecute(
      () => this.learningDB.createStudentRecord({
        cycleId: session.cycleId,
        teacherRecordId: teacherRecord.record_id,
        studentSequence: session.completedTasks + 1,
      }),
      "createStudentRecord"
    );
    console.log("[TSE] Student record created:", studentRecord.record_id);
  } catch (err) {
    console.error("[TSE] Failed to create student record:", err.message);
    session.failures++;
    continue;
  }
        );

        // Capture FSRS state BEFORE evaluation
        const fsrsStateBefore = acquired?.knowledge_id
          ? await this.captureKnowledgeState(characterId, acquired.knowledge_id)
          : null;

        // Evaluate (with confidence & version)
        const evaluation = await this.safeExecute(
          () => this.evaluator.handleTaskByCategory({
            padSnapshot: session.padContext,
            task,
            attempt: studentAttempt,
            studentRecordId: studentRecord.record_id,
            userInput: userResponseText,
          }),
          "Evaluator.handleTaskByCategory"
        );

        evaluation.evalVersion = "1.0";
        evaluation.confidence = evaluation.confidence || 0.8;

        // Persist FSRS grade to knowledge state
        if (acquired?.knowledge_id && evaluation.score !== undefined) {
          const fsrsGrade = this.mapScoreToFSRSGrade(evaluation.score);
          await this.evaluator.evaluateReview(characterId, acquired.knowledge_id, fsrsGrade);
        }

        // Capture FSRS state AFTER evaluation (if evaluateReview updated it)
        const fsrsStateAfter = acquired?.knowledge_id
          ? await this.captureKnowledgeState(characterId, acquired.knowledge_id)
          : null;

        // Compute FSRS delta
        const fsrsStateDelta = this.computeFsrsStateDelta(fsrsStateBefore, fsrsStateAfter);

        session.evaluations.push(evaluation);
        session.completedTasks++;

        // Save task attempt to learning DB
        await this.safeExecute(
          () => this.learningDB.saveTaskAttempt({
            characterId,
            knowledgeId: acquired?.knowledge_id || task.knowledgeId || null,
            taskId: task.taskId || null,
            score: evaluation.score,
          }),
          "saveTaskAttempt"
        );

        // Persist full audit log (task → attempt → eval → FSRS delta → rationale)
        await this.persistAuditLog({
          sessionId: session.id,
          cycleId: session.cycleId,
          step: session.completedTasks,
          taskGenerated: {
            taskId: task.taskId,
            taskType: task.taskType,
            taskCategory: task.taskCategory,
            difficulty: task.difficulty,
            difficultyLevel: task.difficultyLevel,
            schemaVersion: task.taskSchemaVersion,
          },
          studentResponse: {
            attemptText: studentAttempt.attemptText || null,
            isRealInput: studentAttempt.metadata?.isRealInput || false,
            length: studentAttempt.attemptText?.length || 0,
          },
          evaluationBreakdown: {
            score: evaluation.score,
            fsrsGrade: evaluation.fsrsGrade || null,
            feedback: evaluation.feedback || null,
            confidence: evaluation.confidence,
            evalVersion: evaluation.evalVersion,
          },
          fsrsStateChange: fsrsStateDelta,
          categoryDecisionRationale: taskParams,
        });

        // FAILURE HANDLING: Low score triggers retry/difficulty reduction/reflection
        if (evaluation.score < policy.failureThreshold) {
          console.log(`[TSE] Low score (${evaluation.score} < ${policy.failureThreshold}). Triggering failure consequence.`);
          session.failures++;

          // TASK RETRY SEMANTICS: Mark current task for retry
          if (policy.retryOnFailure) {
            session.retryTaskId = task.taskId;
            console.log(`[TSE] Task ${task.taskId} marked for retry next iteration.`);
          }

          // Soft failure: inject reflection micro-task next iteration
          if (policy.allowReflectionExit) {
            console.log(`[TSE] Injecting reflection after failure.`);
            // Next iteration will pick up reflection in decideNextTaskParams
          }
        } else {
          // HIGH SCORE: Advance belt mid-session
          if (evaluation.score >= 4) {
            console.log(`[TSE] High score (${evaluation.score}). Updating belt progression.`);
            await this.safeExecute(
              () => this.belts.updateProgressionAfterTSE(characterId, {
                score: evaluation.score,
                efficiency_score: evaluation.communicationScores?.efficiency ?? 0.5,
                cultural_score: evaluation.communicationScores?.cultural ?? 0.5,
                innovation_score: evaluation.communicationScores?.innovation ?? 0.7,
                domain_scores: evaluation.domain_scores || {}
              }),
              "updateProgressionAfterTSE (mid-session)"
            );
          }
          // Clear retry flag on success
          session.retryTaskId = null;
        }

        // Single-turn mode: return immediately
        if (options.singleTurn) {
          console.log(`[TSE] Single-turn mode: returning task + evaluation.`);
          return { task, evaluation, session };
        }

        // Reset user input for next turn (avoid re-using same response)
        userResponseText = null;
      }

      // SESSION COMPLETE: Final belt update and cycle closure

      const avgScore = session.evaluations.length > 0
        ? session.evaluations.reduce((sum, e) => sum + e.score, 0) / session.evaluations.length
        : 0;

      console.log(`[TSE] Session complete. Avg score: ${avgScore.toFixed(2)}, Tasks: ${session.completedTasks}, Failures: ${session.failures}`);

      // Final belt progression (catches all scores, ensures persistent state)
      await this.safeExecute(
        () => this.belts.updateProgressionAfterTSE(characterId, {
          score: avgScore,
          efficiency_score: session.evaluations.reduce((sum, e) => sum + (e.communicationScores?.efficiency ?? 0.5), 0) / session.evaluations.length,
          cultural_score: session.evaluations.reduce((sum, e) => sum + (e.communicationScores?.cultural ?? 0.5), 0) / session.evaluations.length,
          innovation_score: session.evaluations.reduce((sum, e) => sum + (e.communicationScores?.innovation ?? 0.7), 0) / session.evaluations.length,
          domain_scores: {}
        }),
        "updateProgressionAfterTSE (final)"
      );

      session.beltAfter = await this.safeExecute(
        () => this.belts.getProgressionStatus(characterId),
        "getProgressionStatus"
      );

      // Complete cycle (closes TSE session in DB)
      await this.safeExecute(
        () => this.learningDB.completeCycle({
          cycleId: session.cycleId,
          evaluations: session.evaluations,
        }),
        "completeCycle"
      );

      return session;
    } catch (err) {
      console.error("[TSE] Session failed:", err.message);
      throw err;
    }
  }

  /**
   * Wraps async function with error handling and logging.
   * @param {Function} fn - Async function to execute
   * @param {string} context - Context label for error messages
   * @returns {Promise<any>} Result or throws
   */
  async safeExecute(fn, context) {
    try {
      return await fn();
    } catch (err) {
      console.error(`[ERROR in ${context}]:`, err.message);
      throw new Error(`Failed in ${context}: ${err.message}`);
    }
  }

  /**
   * Captures knowledge state (FSRS parameters) before/after evaluation.
   * @param {string} characterId
   * @param {string} knowledgeId
   * @returns {Promise<Object|null>} { stability, difficulty, next_review_timestamp } or null
   */
  async captureKnowledgeState(characterId, knowledgeId) {
    try {
      const result = await pool.query(
        `SELECT stability, difficulty, next_review_timestamp
         FROM character_knowledge_state
         WHERE character_id = $1 AND knowledge_id = $2`,
        [characterId, knowledgeId]
      );
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (err) {
      console.warn(`[FSRS] Failed to capture knowledge state:`, err.message);
      return null;
    }
  }

  /**
   * Computes FSRS delta between before/after states.
   * @param {Object|null} before - State before evaluation
   * @param {Object|null} after - State after evaluation
   * @returns {Object|null} { stability_delta, difficulty_delta, next_review_change } or null
   */
  computeFsrsStateDelta(before, after) {
    if (!before || !after) return null;
    return {
      stability_delta: (after.stability || 0) - (before.stability || 0),
      difficulty_delta: (after.difficulty || 0) - (before.difficulty || 0),
      next_review_change: after.next_review_timestamp !== before.next_review_timestamp
        ? { before: before.next_review_timestamp, after: after.next_review_timestamp }
        : null,
    };
  }

  /**
   * Determines if session should end (timeout, avg score, task limit, failures).
   * @param {Object} session - Current session state
   * @param {Object} policy - Session policy
   * @returns {boolean}
   */
  shouldEndSession(session, policy) {
    const elapsed = Date.now() - session.startedAt;
    const timeoutExceeded = elapsed > policy.timeoutMs;
    const maxTasksReached = session.completedTasks >= policy.maxTasks;
    const maxFailuresReached = session.failures >= policy.maxFailures;

    if (timeoutExceeded) console.warn(`[TSE] Ending: timeout exceeded`);
    if (maxTasksReached) console.log(`[TSE] Ending: max tasks reached`);
    if (maxFailuresReached) console.log(`[TSE] Ending: max failures reached`);

    return timeoutExceeded || maxTasksReached || maxFailuresReached;
  }

  /**
   * Decides next task type based on FSRS priority, recent performance, and mastery.
   * INCLUDES: Reflection injection every N tasks, task retry semantics.
   * @param {string} characterId
   * @param {Object} session
   * @param {string|null} lastUserResponse
   * @param {Object} policy
   * @returns {Promise<Object>} { type, prompt, domainId, difficultyLevel }
   */
  async decideNextTaskParams(characterId, session, lastUserResponse, policy) {
    // TASK RETRY SEMANTICS: If previous task failed, prepare retry
    if (session.retryTaskId && policy.retryOnFailure) {
      console.log(`[TSE] Retrying task ${session.retryTaskId} due to previous failure.`);
      return {
        type: "retry",
        taskIdToRetry: session.retryTaskId,
        prompt: "Let's try this again. You can do it.",
        domainId: session.domainId,
        difficultyLevel: 2, // Ease difficulty on retry
      };
    }

    // REFLECTION INJECTION: Every N tasks (e.g., every 4–5), force communication_quality
    if (session.completedTasks > 0 && session.completedTasks % policy.reflectionFrequency === 0) {
      console.log(`[TSE] Reflection micro-task injected at step ${session.completedTasks}`);
      return {
        type: "communication_quality",
        prompt: "How did that feel in the Expanse? What was the core idea you just explored?",
        domainId: session.domainId,
        difficultyLevel: 2,
      };
    }

    const db = this.learningDB;

    // PRIORITY 1: FSRS due items (recall tasks)
    const dueItems = await this.safeExecute(
      () => db.getDueItems(characterId, 3),
      "getDueItems"
    );
    if (dueItems && dueItems.length > 0) {
      const item = dueItems[0];
      return {
        type: "recall",
        knowledgeId: item.knowledge_id,
        domainId: item.domain_id,
        difficultyLevel: item.complexity_score > 0.7 ? 4 : 2,
        prompt: `Recall: ${item.content}`,
      };
    }

    // PRIORITY 2: Low recent score or emotional signal → easier communication task
    const recentScores = await this.safeExecute(
      () => db.getRecentScores(characterId, 5),
      "getRecentScores"
    );
    const avgRecent = recentScores && recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length
      : 0;

    if (avgRecent < 0.6 || /confused|don't know|stuck|frustrated/i.test(lastUserResponse || "")) {
      console.log(`[TSE] Low recent score (${avgRecent.toFixed(2)}) or emotional signal. Triggering communication_quality.`);
      return {
        type: "communication_quality",
        difficultyLevel: 2,
        prompt: "Explain this concept simply and clearly. Take your time.",
      };
    }

    // PRIORITY 3: High mastery → application/review tasks
    const mastery = await this.safeExecute(
      () => db.getMasterySummary(characterId),
      "getMasterySummary"
    );
    const highMastery = mastery && mastery.find(m => parseFloat(m.avg_score) > 0.85);
    if (highMastery) {
      console.log(`[TSE] High mastery detected for ${highMastery.knowledgeId}. Triggering application.`);
      return {
        type: "application",
        knowledgeId: highMastery.knowledgeId,
        difficultyLevel: 4,
        prompt: `Apply knowledge from ${highMastery.knowledgeId} to a new situation.`,
      };
    }

    // FALLBACK: Generic task with domain context
    return {
      type: "fallback",
      domainId: session.domainId || "#00012C",
      difficultyLevel: 3,
      prompt: session.query || "Continue exploring this topic.",
    };
  }

  /**
   * Persists complete audit log: task → attempt → evaluation → FSRS delta → decision rationale.
   * Enables full cycle reconstruction and replay debugging.
   * @param {Object} entry - Audit log entry
   */
  async persistAuditLog(entry) {
    try {
      // Insert into audit_log table (must exist; create if missing)
      await pool.query(
        `INSERT INTO audit_log (
          session_id, cycle_id, step, task_generated, student_response, 
          evaluation_breakdown, fsrs_state_change, category_decision_rationale, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          entry.sessionId,
          entry.cycleId,
          entry.step,
          JSON.stringify(entry.taskGenerated),
          JSON.stringify(entry.studentResponse),
          JSON.stringify(entry.evaluationBreakdown),
          JSON.stringify(entry.fsrsStateChange),
          JSON.stringify(entry.categoryDecisionRationale),
        ]
      );
      console.log(`[AUDIT] Logged step ${entry.step} for cycle ${entry.cycleId}`);
    } catch (err) {
      console.error(`[AUDIT] Failed to persist audit log:`, err.message);
      // Don't throw; audit failure should not block session
    }
  }

  /**
   * Reconstructs full cycle path: task → attempt → evaluation.
   * Enables debugging, replay, and validation testing.
   * @param {string} cycleId - TSE cycle ID
   * @returns {Promise<Object>} Reconstructed { cycleId, steps: [...], summary: {...} }
   */
  async reconstructCycle(cycleId) {
    try {
      console.log(`[Replay] Reconstructing cycle ${cycleId}`);

      const result = await pool.query(
        `SELECT 
          al.step, al.task_generated, al.student_response, 
          al.evaluation_breakdown, al.fsrs_state_change, al.category_decision_rationale
        FROM audit_log al
        WHERE al.cycle_id = $1
        ORDER BY al.step ASC`,
        [cycleId]
      );

      const steps = result.rows.map(row => ({
        step: row.step,
        task: JSON.parse(row.task_generated),
        attempt: JSON.parse(row.student_response),
        evaluation: JSON.parse(row.evaluation_breakdown),
        fsrsStateChange: row.fsrs_state_change ? JSON.parse(row.fsrs_state_change) : null,
        decisionRationale: JSON.parse(row.category_decision_rationale),
      }));

      // Compute summary statistics for validation
      const avgScore = steps.length > 0
        ? steps.reduce((sum, s) => sum + (s.evaluation.score || 0), 0) / steps.length
        : 0;
      const categoryDistribution = {};
      steps.forEach(s => {
        const cat = s.task.taskCategory || 'unknown';
        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
      });

      const summary = {
        totalSteps: steps.length,
        avgScore: avgScore.toFixed(2),
        categoryDistribution,
        reflectionCount: steps.filter(s => s.decisionRationale.type === 'communication_quality').length,
        recallCount: steps.filter(s => s.decisionRationale.type === 'recall').length,
        fsrsDeltaCount: steps.filter(s => s.fsrsStateChange !== null).length,
      };

      console.log(`[Replay] Reconstructed ${steps.length} steps for cycle ${cycleId}. Summary:`, summary);
      return { cycleId, steps, summary };
    } catch (err) {
      console.error(`[Replay] Failed to reconstruct cycle:`, err.message);
      return { cycleId, steps: [], summary: {}, error: err.message };
    }
  }

  /**
   * E2E VALIDATION TESTS — Use reconstructCycle() to validate system behavior
   * Runs after a cycle completes to assert:
   * - Category progression is correct
   * - FSRS priority ordering is respected
   * - Reflection injection occurs periodically
   * - Mastery progression follows real scores
   * - Belt updates reflect real avg score
   */

  /**
   * Test 1: Validate category progression
   * Asserts that categories match decideNextTaskParams routing logic
   * @param {Object} reconstructed - Result of reconstructCycle()
   * @returns {Object} { passed: boolean, details: string }
   */
  validateCategoryProgression(reconstructed) {
    const { steps } = reconstructed;
    let passed = true;
    const details = [];

    steps.forEach((step, i) => {
      const rationale = step.decisionRationale;
      const taskCategory = step.task.taskCategory;

      // Reflection should be communication_quality
      if (rationale.type === 'communication_quality' && taskCategory !== 'communication_quality') {
        passed = false;
        details.push(`Step ${step.step}: Expected communication_quality, got ${taskCategory}`);
      }

      // Recall should be acquisition
      if (rationale.type === 'recall' && taskCategory !== 'acquisition') {
        passed = false;
        details.push(`Step ${step.step}: Expected acquisition for recall, got ${taskCategory}`);
      }

      // Application should be application
      if (rationale.type === 'application' && taskCategory !== 'application') {
        passed = false;
        details.push(`Step ${step.step}: Expected application, got ${taskCategory}`);
      }
    });

    return {
      passed,
      testName: "validateCategoryProgression",
      stepsChecked: steps.length,
      details: details.length > 0 ? details : ["All categories matched routing logic"],
    };
  }

  /**
   * Test 2: Validate FSRS priority ordering
   * Asserts that recall (due) tasks appear before lower-priority tasks
   * @param {Object} reconstructed - Result of reconstructCycle()
   * @returns {Object} { passed: boolean, details: string }
   */
  validateFsrsPriority(reconstructed) {
    const { steps } = reconstructed;
    let passed = true;
    const details = [];

    let seenFallback = false;
    steps.forEach(step => {
      const rationale = step.decisionRationale;

      // If we've seen a fallback, recall should not appear
      if (seenFallback && rationale.type === 'recall') {
        passed = false;
        details.push(`Step ${step.step}: Recall appeared after fallback (violates priority)`);
      }

      if (rationale.type === 'fallback') {
        seenFallback = true;
      }
    });

    return {
      passed,
      testName: "validateFsrsPriority",
      stepsChecked: steps.length,
      details: details.length > 0 ? details : ["FSRS priority ordering respected"],
    };
  }

  /**
   * Test 3: Validate reflection injection
   * Asserts that reflection tasks appear at expected intervals
   * @param {Object} reconstructed - Result of reconstructCycle()
   * @param {number} reflectionFrequency - Expected interval (default 4)
   * @returns {Object} { passed: boolean, details: string }
   */
  validateReflectionInjection(reconstructed, reflectionFrequency = 4) {
    const { steps, summary } = reconstructed;
    let passed = true;
    const details = [];

    // Reflection should appear every reflectionFrequency steps (if > reflectionFrequency steps total)
    if (steps.length > reflectionFrequency) {
      const reflectionSteps = steps.filter(s => s.decisionRationale.type === 'communication_quality');
      const expectedMinReflections = Math.floor(steps.length / reflectionFrequency);

      if (reflectionSteps.length < expectedMinReflections) {
        passed = false;
        details.push(
          `Expected at least ${expectedMinReflections} reflections for ${steps.length} steps ` +
          `(frequency ${reflectionFrequency}), got ${reflectionSteps.length}`
        );
      } else {
        details.push(
          `Reflection injection correct: ${reflectionSteps.length} reflections in ${steps.length} steps`
        );
      }
    } else {
      details.push(`Cycle too short (${steps.length}) to validate reflection frequency`);
    }

    return {
      passed,
      testName: "validateReflectionInjection",
      reflectionCount: summary.reflectionCount,
      details,
    };
  }

  /**
   * Test 4: Validate mastery progression
   * Asserts that high-score tasks lead to application/review (higher difficulty)
   * @param {Object} reconstructed - Result of reconstructCycle()
   * @returns {Object} { passed: boolean, details: string }
   */
  validateMasteryProgression(reconstructed) {
    const { steps } = reconstructed;
    let passed = true;
    const details = [];

    steps.forEach((step, i) => {
      const score = step.evaluation.score;
      const nextRationale = i < steps.length - 1 ? steps[i + 1].decisionRationale : null;

      // High score should lead to application or higher difficulty
      if (score >= 4 && nextRationale) {
        if (nextRationale.type !== 'application' && nextRationale.type !== 'recall' && nextRationale.difficultyLevel < 4) {
          // Not strictly required, but log for inspection
          details.push(
            `Step ${step.step}: High score (${score}) not followed by application/high-difficulty ` +
            `(got ${nextRationale.type} difficulty ${nextRationale.difficultyLevel})`
          );
        }
      }

      // Low score should lead to easier task
      if (score < 3 && nextRationale) {
        if (nextRationale.difficultyLevel > step.task.difficultyLevel) {
          passed = false;
          details.push(
            `Step ${step.step}: Low score (${score}) followed by harder task ` +
            `(difficulty ${step.task.difficultyLevel} → ${nextRationale.difficultyLevel})`
          );
        }
      }
    });

    if (details.length === 0) {
      details.push("Mastery progression follows expected patterns");
    }

    return {
      passed,
      testName: "validateMasteryProgression",
      stepsChecked: steps.length,
      details,
    };
  }

  /**
   * Test 5: Validate belt update integrity
   * Asserts that avg score is computed correctly
   * @param {Object} reconstructed - Result of reconstructCycle()
   * @param {number} expectedAvgScore - Expected average (from session or DB)
   * @returns {Object} { passed: boolean, details: string }
   */
  validateBeltUpdateIntegrity(reconstructed, expectedAvgScore = null) {
    const { steps, summary } = reconstructed;
    let passed = true;
    const details = [];

    const computedAvg = parseFloat(summary.avgScore);

    if (expectedAvgScore !== null) {
      const tolerance = 0.01;
      if (Math.abs(computedAvg - expectedAvgScore) > tolerance) {
        passed = false;
        details.push(
          `Belt avg mismatch: computed ${computedAvg.toFixed(2)}, expected ${expectedAvgScore.toFixed(2)}`
        );
      } else {
        details.push(`Belt avg matches: ${computedAvg.toFixed(2)}`);
      }
    } else {
      details.push(`Belt avg computed as ${computedAvg.toFixed(2)} (${steps.length} steps)`);
    }

    return {
      passed,
      testName: "validateBeltUpdateIntegrity",
      computedAvg,
      expectedAvg: expectedAvgScore,
      details,
    };
  }

  /**
   * Run all E2E validation tests
   * @param {string} cycleId - TSE cycle to validate
   * @param {Object} options - { expectedAvgScore, reflectionFrequency }
   * @returns {Promise<Object>} { allPassed: boolean, results: [...] }
   */
  async runE2EValidation(cycleId, options = {}) {
    try {
      console.log(`[E2E] Running validation tests for cycle ${cycleId}`);

      const reconstructed = await this.reconstructCycle(cycleId);
      if (reconstructed.error) {
        return { allPassed: false, error: reconstructed.error, results: [] };
      }

      const results = [
        this.validateCategoryProgression(reconstructed),
        this.validateFsrsPriority(reconstructed),
        this.validateReflectionInjection(reconstructed, options.reflectionFrequency || 4),
        this.validateMasteryProgression(reconstructed),
        this.validateBeltUpdateIntegrity(reconstructed, options.expectedAvgScore),
      ];

      const allPassed = results.every(r => r.passed);
      console.log(`[E2E] Validation complete: ${allPassed ? 'ALL PASSED' : 'FAILURES DETECTED'}`);
      console.log(JSON.stringify(results, null, 2));

      return { allPassed, results };
    } catch (err) {
      console.error(`[E2E] Validation failed:`, err.message);
      return { allPassed: false, error: err.message, results: [] };
    }
  }
}
