import { getCurrentStoryTaskForCharacter } from './backend/storytellingTaskHelper.mjs';

async function runTest() {
  console.log("Fetching Phase 2 task for Claude...");
  
  try {
    const task = await getCurrentStoryTaskForCharacter('#700002');

    if (!task) {
      console.error("ERROR: No task returned. Check database connection.");
      process.exit(1);
    }

    console.log("Task retrieved successfully");
    console.log("Lesson ID:", task.current_lesson_id);
    console.log("Lesson Name:", task.lesson_name);
    console.log("Task Name:", task.task_name);
    console.log("Task Type ID:", task.task_type_id);

  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

runTest();
