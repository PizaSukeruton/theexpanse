import TeacherComponent from './TeacherComponent.js';
import pool from '../db/pool.js';

const learningDB = { pool };
const teacher = new TeacherComponent(learningDB);

await teacher.initialize();

console.log("[TEST] Teaching lore to Claude...");
const task = await teacher.teachLore("#70001C", "Teach me about the multiverse");

if (task) {
  console.log("\n✓ Lore Task Generated:");
  console.log("  Task ID:", task.taskId);
  console.log("  Type:", task.taskType);
  console.log("  Entity:", task.metadata.loreEntity);
  console.log("  Instructions:", task.instructions);
  console.log("  Input:", task.input);
  console.log("  Expected Format:", task.expectedFormat);
} else {
  console.log("✗ Failed to generate lore task");
}

process.exit(0);
