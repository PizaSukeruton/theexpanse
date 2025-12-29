import pool from "../db/pool.js";
import generateHexId from "../utils/hexIdGenerator.js";

export default class LoreCurriculumBuilder {
  async buildLoreTask(characterId, knowledgeId, entityName) {
    const taskId = await generateHexId("tse_task_id");
    
    const taskTypes = [
      {
        type: "lore_character_question",
        instructions: "Answer a question about " + entityName + " from the Piza Sukeruton Multiverse.",
        input: "Who is " + entityName + "?",
        expectedFormat: "A 1-2 sentence answer about their role or significance."
      },
      {
        type: "lore_relationship_map",
        instructions: "Explain how " + entityName + " relates to other characters.",
        input: "Describe " + entityName + "'s relationships in the multiverse.",
        expectedFormat: "List 2-3 key relationships with brief explanations."
      },
      {
        type: "lore_category_identify",
        instructions: "Identify what type of character " + entityName + " is.",
        input: "What category does " + entityName + " belong to? (Protagonist, Antagonist, Tanuki, Council Of The Wise, Angry Slice Of Pizza, B-Roll Chaos, Knowledge Entity, or Machines)",
        expectedFormat: "The category name with one sentence explanation."
      },
      {
        type: "lore_narrative_placement",
        instructions: "Place " + entityName + " in the context of the multiverse conflict.",
        input: "How does " + entityName + " fit into the conflict between Piza Sukeruton and Pineaple Yurei?",
        expectedFormat: "1-2 sentences connecting them to the main narrative."
      }
    ];

    const chosen = taskTypes[Math.floor(Math.random() * taskTypes.length)];

    await pool.query(`
      INSERT INTO tse_task_attempts (task_id, character_id, knowledge_id, task_type, instructions, input, expected_format, difficulty, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT DO NOTHING
    `, [
      taskId,
      characterId,
      knowledgeId,
      chosen.type,
      chosen.instructions,
      chosen.input,
      chosen.expectedFormat,
      1,
      "active"
    ]);

    return { taskId, ...chosen };
  }

  async generateLoreCurriculum(characterId, count = 3) {
    try {
      const loreItems = await pool.query(`
        SELECT knowledge_id, entity_name 
        FROM lore_knowledge_graph 
        ORDER BY RANDOM() 
        LIMIT $1
      `, [count]);

      const tasks = [];
      for (const item of loreItems.rows) {
        const task = await this.buildLoreTask(characterId, item.knowledge_id, item.entity_name);
        tasks.push(task);
      }

      console.log("[LoreCurriculumBuilder] Generated " + tasks.length + " lore tasks");
      return tasks;
    } catch (e) {
      console.error("[LoreCurriculumBuilder] Error:", e.message);
      return [];
    }
  }
}
