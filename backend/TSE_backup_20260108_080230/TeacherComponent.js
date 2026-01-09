// TeacherComponent.js – Phase 108 fixes + full taskCategory mapping
// - Added _mapTypeToCategory to ensure every task has a valid category
// - taskCategory set on EVERY return statement (no more "unknown")
// - Safe JSON.parse with fallback for lore facts
// - Includes 'tse_cycle' items in review selection (#14)
// - Fixed broken feedback access
// - Uses context.difficultyLevel when provided
// - Debug logs for task category confirmation

import traitManager from "../traits/TraitManager.js";
import generateHexId from "../utils/hexIdGenerator.js";
import KnowledgeResponseEngine from "./helpers/KnowledgeResponseEngine.js";
import { getNaturalLanguageGenerator } from "./helpers/NaturalLanguageGeneratorSingleton.js";
import pool from "../db/pool.js";

import { TASK_CATEGORY_ACQUISITION } from "./constants/KnowledgeState.js";
import { TASK_CATEGORIES } from "./constants/TaskCategories.js";

export default class TeacherComponent {
  constructor(learningDB) {
    this.learningDB = learningDB;
    this.nlg = getNaturalLanguageGenerator();
    this.responseEngine = new KnowledgeResponseEngine();

    this.nodeId = Math.floor(Math.random() * 256)
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
  }

  async initialize() {
    return true;
  }

  getNodeId() {
    return this.nodeId;
  }

  /**
   * Maps taskType to evaluator category
   */
  _mapTypeToCategory(type) {
    const map = {
      recall: "acquisition",
      retrieval: "acquisition",
      retry: "acquisition",
      communication_quality: "communication_quality",
      reflection: "communication_quality",
      cause_effect_rewrite: "rewrite",
      sentence_clarity_rewrite: "clarity",
      summarize_core_point: "summary",
      lore_comprehension: "acquisition",
      fallback: "acquisition",
      clarification: "communication_quality"
    };
    const category = map[type] || "unknown";
    console.log(`[Teacher] Mapped type "${type}" → category "${category}"`);
    return category;
  }

  /**
   * Main entry point: generate next task
   */
  async teach(characterId, query, context = {}) {
    let difficulty = context.difficultyLevel || 3;

    if (!context.difficultyLevel) {
      const base = await this._computeTraitDifficulty(characterId);
      difficulty = await this._applyAdaptiveDifficulty(characterId, base);
    }

    let task = null;

    const requestedType = context?.type?.toLowerCase();
    if (requestedType) {
      switch (requestedType) {
        case "recall":
        case "retrieval":
          const dueItems = await this.learningDB.getDueItems(characterId, 1);
          if (dueItems?.length > 0) {
            const item = dueItems[0];
            task = {
              taskId: await generateHexId("tse_task_id"),
              taskType: "recall",
              taskCategory: this._mapTypeToCategory("recall"),
              input: `Recall: ${item.content?.split("\n")[0] || "this concept"}`,
              knowledgeId: item.knowledge_id,
              difficulty,
              characterId,
              metadata: { teacherNode: this.nodeId, difficulty, context },
            };
          }
          break;

        case "communication_quality":
        case "reflection":
          task = await this._generateCommunicationQualityTask(characterId, difficulty, context);
          break;

        case "retry":
          task = {
            taskId: await generateHexId("tse_task_id"),
            taskType: "retry",
            taskCategory: this._mapTypeToCategory("retry"),
            input: context.prompt || "Let's try this again with more care.",
            difficulty: Math.max(1, difficulty - 1),
            characterId,
            metadata: { teacherNode: this.nodeId, retry: true, context },
          };
          break;

        default:
          console.warn(`[TeacherComponent] Unknown requested type: ${requestedType}`);
      }
      if (task) {
        console.log(`[Teacher] Explicit type task - type=${task.taskType}, category=${task.taskCategory}`);
        return task;
      }
    }

    if (query?.toLowerCase().includes("communication")) {
      task = await this._generateCommunicationQualityTask(characterId, difficulty, context);
      if (task) {
        console.log(`[Teacher] Communication query task - category=${task.taskCategory}`);
        return task;
      }
    }

    if (context?.domainId) {
      task = await this._generateDomainTask(characterId, context.domainId, difficulty, context);
      if (task) {
        console.log(`[Teacher] Domain task - category=${task.taskCategory}`);
        return task;
      }
    }

    if (query && (query.toLowerCase().includes("piza") || query.toLowerCase().includes("expanse"))) {
      task = await this._teachLoreFact(characterId, query, difficulty, context);
      if (task) {
        console.log(`[Teacher] Lore task - category=${task.taskCategory}`);
        return task;
      }
    }

    task = await this._generateGenericTask(characterId, difficulty, context);
    console.log(`[Teacher] Fallback task - category=${task.taskCategory}`);
    return task;
  }

  async _generateCommunicationQualityTask(characterId, difficulty, context) {
    const task = {
      taskId: await generateHexId("tse_task_id"),
      taskType: "communication_quality",
      taskCategory: this._mapTypeToCategory("communication_quality"),
      input: "Explain what you've learned so far with warmth and clarity. What stands out to you?",
      instructions: "Share your understanding in a natural, friendly way.",
      expectedFormat: "A thoughtful, personal explanation.",
      difficulty,
      characterId,
      metadata: {
        teacherNode: this.nodeId,
        difficulty,
        context,
        target_outcome_intent: "explain warmly and clearly",
      },
    };
    return task;
  }

  async _generateDomainTask(characterId, domainId, difficulty, context) {
    const knowledgeItem = await this._getKnowledgeItemForReview(characterId, domainId, difficulty);
    if (!knowledgeItem) return null;

    const taskType = this._selectTaskType(difficulty);

    return {
      taskId: await generateHexId("tse_task_id"),
      taskType,
      taskCategory: this._mapTypeToCategory(taskType),
      knowledgeId: knowledgeItem.knowledge_id,
      input: `Learn: ${knowledgeItem.content?.split("\n")[0] || ""}`,
      instructions: `Practice ${taskType.replace("_", " ")} on this concept.`,
      expectedFormat: this._getExpectedFormat(taskType),
      difficulty,
      characterId,
      metadata: {
        teacherNode: this.nodeId,
        difficulty,
        context,
        domainId,
        sourceKnowledge: knowledgeItem.knowledge_id,
        complexityScore: knowledgeItem.complexity_score || 0.5,
      },
    };
  }

  async _getKnowledgeItemForReview(characterId, domainId, difficulty) {
    try {
      const now = new Date().toISOString();

      const result = await pool.query(
        `SELECT
           ki.knowledge_id,
           ki.content,
           ki.concept,
           ki.complexity_score,
           ki.domain_id,
           cks.next_review_timestamp,
           cks.difficulty AS fsrs_difficulty
         FROM knowledge_items ki
         LEFT JOIN character_knowledge_state cks
           ON ki.knowledge_id = cks.knowledge_id
           AND cks.character_id = $1
         WHERE ki.domain_id = $2
           AND ki.source_type IN ('admin_entry', 'tse_cycle')
           AND (cks.next_review_timestamp IS NULL OR cks.next_review_timestamp <= $3)
         ORDER BY
           cks.next_review_timestamp ASC NULLS FIRST,
           ki.complexity_score ASC
         LIMIT 1`,
        [characterId, domainId, now]
      );

      return result.rows[0] || null;
    } catch (err) {
      console.error("[TeacherComponent] Review item selection failed:", err.message);
      return null;
    }
  }

  _selectTaskType(difficulty) {
    const taskTypes = [
      "cause_effect_rewrite",
      "sentence_clarity_rewrite",
      "summarize_core_point",
      "communication_quality",
    ];

    if (difficulty >= 4) return "communication_quality";
    if (difficulty >= 2) return taskTypes[Math.floor(Math.random() * (taskTypes.length - 1))];
    return taskTypes[Math.floor(Math.random() * 2)];
  }

  _getExpectedFormat(taskType) {
    const formats = {
      cause_effect_rewrite: "Rewrite using causal language: because, therefore, as a result, etc.",
      sentence_clarity_rewrite: "Break into short, clear sentences.",
      summarize_core_point: "Summarize the main idea in about half the length.",
      communication_quality: "Explain warmly and clearly in your own words.",
      lore_comprehension: "Connect this fact to the broader world and your understanding.",
      clarification: "Expand on your previous answer with more detail and examples.",
    };
    return formats[taskType] || "Provide a thoughtful response.";
  }

  async _teachLoreFact(characterId, query, difficulty, context) {
    try {
      const result = await pool.query(
        `SELECT knowledge_id, content
         FROM knowledge_items
         WHERE source_type = 'admin_entry'
           AND content::text ILIKE ANY (ARRAY[$1, $2])
         LIMIT 1`,
        [`%${query}%`, "%piza%"]
      );

      if (result.rows.length === 0) return null;

      const fact = result.rows[0];
      let contentObj = fact.content;

      if (typeof fact.content === "string") {
        try {
          contentObj = JSON.parse(fact.content);
        } catch (e) {
          console.warn("[TeacherComponent] Lore content not JSON, using raw:", e.message);
          contentObj = { statement: fact.content };
        }
      }

      const statement = typeof contentObj === "object" ? contentObj.statement || fact.content : fact.content;

      return {
        taskId: await generateHexId("tse_task_id"),
        taskType: "lore_comprehension",
        taskCategory: this._mapTypeToCategory("lore_comprehension"),
        input: `Question: ${statement}`,
        instructions: "Answer thoughtfully, connecting to the broader Piza Sukeruton Multiverse.",
        expectedFormat: this._getExpectedFormat("lore_comprehension"),
        difficulty,
        characterId,
        knowledgeId: fact.knowledge_id,
        metadata: {
          teacherNode: this.nodeId,
          difficulty,
          context,
          sourceKnowledge: fact.knowledge_id,
        },
      };
    } catch (err) {
      console.error("[TeacherComponent] Lore task failed:", err.message);
      return null;
    }
  }

  async _generateGenericTask(characterId, difficulty, context) {
    const taskType = this._selectTaskType(difficulty);

    const genericInputs = {
      cause_effect_rewrite: "The hero made a choice. Everything changed afterward. The kingdom fell into shadow.",
      sentence_clarity_rewrite: "Long ago in a distant land there lived a wise but lonely sage who knew many secrets but shared them with no one.",
      summarize_core_point: "The forest was ancient and full of hidden paths. Few dared to enter. Those who did were never quite the same.",
      communication_quality: "What do you think makes someone a good friend?",
    };

    const task = {
      taskId: await generateHexId("tse_task_id"),
      taskType,
      taskCategory: this._mapTypeToCategory(taskType),
      input: genericInputs[taskType] || "Reflect on this idea.",
      expectedFormat: this._getExpectedFormat(taskType),
      difficulty,
      characterId,
      metadata: {
        teacherNode: this.nodeId,
        difficulty,
        context,
        fallback: true,
      },
    };

    return task;
  }

  async _computeTraitDifficulty(characterId) {
    try {
      const traits = await traitManager.getTraitVector(characterId);
      if (traits?.intelligence) {
        return Math.max(1, Math.min(5, Math.ceil(traits.intelligence / 20)));
      }
    } catch (err) {
      console.warn("[TeacherComponent] Trait difficulty failed:", err.message);
    }
    return 2;
  }

  async _applyAdaptiveDifficulty(characterId, baseDifficulty) {
    try {
      const result = await this.learningDB.pool.query(
        `SELECT AVG(CAST(score AS NUMERIC)) AS avg_score
         FROM tse_task_attempts
         WHERE character_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [characterId]
      );
      const avg = parseFloat(result.rows[0]?.avg_score) || 0.5;
      if (avg > 0.8) return Math.min(5, baseDifficulty + 1);
      if (avg < 0.4) return Math.max(1, baseDifficulty - 1);
    } catch (err) {
      console.warn("[TeacherComponent] Adaptive difficulty query failed:", err.message);
    }
    return baseDifficulty;
  }

  async generateFollowUpTask(previousTask, evaluation) {
    if (!evaluation || evaluation.score >= 4) return null;

    return {
      taskId: await generateHexId("tse_task_id"),
      taskType: "clarification",
      taskCategory: this._mapTypeToCategory("clarification"),
      input: previousTask.input,
      instructions: "Let's go deeper. Can you expand on your answer with more detail?",
      expectedFormat: "A more detailed and reflective response.",
      difficulty: previousTask.difficulty,
      characterId: previousTask.characterId,
      metadata: {
        chainFrom: previousTask.taskId,
        previousScore: evaluation.score,
        feedback: evaluation.feedback || "Try adding more detail.",
      },
    };
  }
}
