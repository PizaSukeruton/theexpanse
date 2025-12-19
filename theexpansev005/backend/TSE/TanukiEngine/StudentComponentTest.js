import StudentComponent from "../StudentComponent.js";

async function runTests() {
  const student = new StudentComponent();
  await student.initialize();

  const characterId = "#700002";
  const knowledgeId = "#AF0001";

  console.log("========================================");
  console.log("🧪 StudentComponent Integration Tests");
  console.log("========================================\n");

  // Test 1: Normal task (no trigger)
  console.log("TEST 1: Normal Task (No Trigger)");
  console.log("Input: 'what is the cause and effect here?'");
  console.log("----------------------------------------");
  
  try {
    const result1 = await student.learn(characterId, knowledgeId, {
      taskType: "cause_effect_rewrite",
      input: "what is the cause and effect here?",
      taskId: "#820001"
    });
    console.log("attemptText:", result1.attemptText);
  } catch (err) {
    console.error("ERROR:", err.message);
  }

  console.log("\n========================================\n");

  // Test 2: Tanuki Mode trigger
  console.log("TEST 2: Tanuki Mode Trigger");
  console.log("Input: 'Tanuki Mode what is the essence of this?'");
  console.log("----------------------------------------");
  
  try {
    const result2 = await student.learn(characterId, knowledgeId, {
      taskType: "cause_effect_rewrite",
      input: "Tanuki Mode what is the essence of this?",
      taskId: "#820002"
    });
    console.log("attemptText:", result2.attemptText);
  } catch (err) {
    console.error("ERROR:", err.message);
  }

  console.log("\n========================================");
}

runTests();
