import LearningDatabase from "./LearningDatabase.js";
import TeacherComponent from "./TeacherComponent.js";
import StudentComponent from "./StudentComponent.js";
import EvaluatorComponent from "./EvaluatorComponent.js";
import BeltProgressionManager from "./BeltProgressionManager.js";
import KnowledgeAcquisitionEngine from "./helpers/KnowledgeAcquisitionEngine.js";
import SessionSummarizer from "./SessionSummarizer.js";
import pool from "../db/pool.js";
import generateHexId from "../utils/hexIdGenerator.js";

export default class TSELoopManager {
  constructor() {
    this.learningDB = new LearningDatabase(pool);
    // CHANGE IS HERE: Passing learningDB to the Teacher
    this.teacher = new TeacherComponent(this.learningDB);
    this.student = new StudentComponent();
    this.evaluator = new EvaluatorComponent(pool);
    this.belts = new BeltProgressionManager(pool, this.evaluator, this.learningDB);
    this.acquisition = new KnowledgeAcquisitionEngine();
  }

  async initialize() {
    try {
        await this.teacher.initialize();
        await this.student.initialize();
        await this.evaluator.initialize();
        console.log("[TSELoopManager] Sub-components initialized successfully.");
        return true;
    } catch (error) {
        console.error("[TSELoopManager] Initialization failed:", error);
        return false;
    }
  }

  // --- API ENTRY POINT ---
  async startKnowledgeCycle(characterId, query) {
    // Aliasing runTseSession to match the API call
    return this.runTseSession(characterId, query);
  }

  async runTseSession(characterId, query, taskCount = 3) {
    console.log(`[TSE Session] Starting for ${characterId}: "${query}"`);
    
    const session = {
      characterId,
      query,
      tasks: [],
      attempts: [],
      evaluations: [],
      beltBefore: null,
      beltAfter: null,
      steps: taskCount,
      summary: ""
    };

    let followUp = null;

    try {
        for (let i = 0; i < taskCount; i++) {
          // 1. Teacher creates a task (or uses follow-up)
          const teachingTask =
            followUp ||
            (await this.teacher.teach(characterId, query, { sessionStep: i + 1 }));

          // 2. Acquire context from Knowledge Engine
          const acquired = await this.acquisition.acquire(characterId, query);

          // 3. Register cycle in DB
          const cycle = await this.learningDB.createCycle(acquired);
          
          const knowledgeId =
            cycle?.knowledge?.knowledge_id || cycle?.knowledge_id || null;
        session.knowledgeIds = session.knowledgeIds || [];
        session.knowledgeIds.push(knowledgeId);

          // 4. Student attempts the task
          let studentAttempt = await this.student.learn(
            characterId,
            knowledgeId,
            teachingTask
          );

          // 5. Evaluator grades the attempt
          const evaluation = await this.evaluator.evaluateTaskAttempt({
            task: teachingTask,
            attempt: studentAttempt
          });

          if (knowledgeId && evaluation.score) {
            const grade = Math.round(evaluation.score);
            try {
              await this.evaluator.evaluateReview({
                characterId,
                knowledgeId,
                grade
              });
              console.log(`[TSE Session] Updated FSRS state for knowledge ${knowledgeId} with grade ${grade}`);
            } catch (err) {
              console.warn(`[TSE Session] FSRS update failed for ${knowledgeId}:`, err.message);
            }
          }

          // 6. Save the attempt to DB
          await this.learningDB.saveTaskAttempt({
            attemptId: studentAttempt.attemptId,
            taskId: teachingTask.taskId,
            characterId,
            knowledgeId,
            attemptText: studentAttempt.attemptText,
            score: evaluation.score,
            metadata: {
              taskType: teachingTask.taskType,
              connectors: evaluation.connectors,
              forbidden: evaluation.forbiddenPhraseUsed,
              communicationScores: evaluation.communicationScores || null
            }
          });

          // 7. Update Session State
          session.tasks.push(teachingTask);
          session.attempts.push(studentAttempt);
          session.evaluations.push(evaluation);

          // 8. Generate Follow-up for next loop
          followUp = await this.teacher.generateFollowUpTask(
            teachingTask,
            evaluation
          );

          // Early exit if score is terrible to prevent spiral
          if (evaluation.score <= 1 && i >= 1) {
              console.log("[TSE Session] Early exit due to low score.");
              break;
          }
        }

        // 9. Calculate Final Score & Belt Progression
        const evalCount = session.evaluations.length || 1;
        const avgScores = {
          score: session.evaluations.reduce((a, b) => a + (b.communicationScores?.effectiveness || b.score / 5), 0) / evalCount,
          efficiency_score: session.evaluations.reduce((a, b) => a + (b.communicationScores?.efficiency || 0.5), 0) / evalCount,
          cultural_score: session.evaluations.reduce((a, b) => a + (b.communicationScores?.cultural || 0.5), 0) / evalCount,
          innovation_score: session.evaluations.reduce((a, b) => a + (b.communicationScores?.innovation || 0.5), 0) / evalCount
        };

        await this.belts.updateProgressionAfterTSE(characterId, avgScores);
        const beltUpdate = await this.belts.getProgressionStatus(characterId);

        session.beltAfter = beltUpdate;
        session.summary = SessionSummarizer.summarize(session);

        // 10. Save Session Memory (Long-term storage)
        for (let i = 0; i < session.tasks.length; i++) {
          const task = session.tasks[i];
          const attempt = session.attempts[i];
          const evaluation = session.evaluations[i];

          // Use a generic ID type if specific one not available
          const memoryId = await generateHexId("knowledge_item_id"); 

          await this.learningDB.saveSessionMemory({
            memoryId,
            characterId: session.characterId,
            knowledgeId: session.knowledgeIds[i] || null,
            taskId: task.taskId,
            attemptId: attempt.attemptId,
            score: evaluation.score,
            difficulty: task.difficulty,
            sessionSummary: session.summary,
            metadata: task.metadata
          });
        }

        return session;

    } catch (err) {
        console.error("[TSELoopManager] Session Critical Error:", err);
        throw err;
    }
  }

  async reviewKnowledge(characterId, knowledgeId, grade) {
    const evaluation = await this.evaluator.evaluateReview({
      characterId,
      knowledgeId,
      grade
    });

    return {
      status: "ok",
      evaluation
    };
  }
}
