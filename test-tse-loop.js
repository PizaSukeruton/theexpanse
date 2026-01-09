// test-tse-loop.js - Focused White Belt Hero's Journey mode (#AE0008 only)
// - Forces all due/recall tasks from domain #AE0008
// - Uses focusDomain parameter (required in TSELoopManager)
// - Longer run (12 tasks) to cover/review 6 items
// - Verbose logging for task types, categories, scores

import TSELoopManager from './backend/TSE/TSELoopManager.js';

async function testTseLoop() {
  console.log("[TSE TEST] Starting focused Hero's Journey session (domain #AE0008 only)");
  console.log("[TSE TEST] Timestamp: " + new Date().toISOString());

  const manager = new TSELoopManager();
  await manager.initialize();

  const characterId = "#700002";
  const query = "Learn the Hero's Journey basics."; // starter prompt
  const focusDomain = "#AE0008"; // Hero's Journey white belt domain

  console.log(`[TSE TEST] Character ID: ${characterId}`);
  console.log(`[TSE TEST] Forced Domain: ${focusDomain}`);
  console.log(`[TSE TEST] Query: ${query}`);

  let session;
  try {
    session = await manager.runOrContinueTseSession(
      characterId,
      query,
      null,           // domainId param no longer needed
      null,           // simulated student responses
      {
        focusDomain,  // <-- forces all due items from #AE0008
        singleTurn: false,
        policy: {
          maxTasks: 12,               // enough to review 6 items multiple times
          maxFailures: 5,
          failureScoreFloor: 3.0,
          timeoutMs: 30 * 60 * 1000   // 30 min
        }
      }
    );
  } catch (err) {
    console.error("[TSE TEST] Session crashed:", err.stack || err.message);
    process.exit(1);
  }

  console.log("\n[TSE TEST] Session completed!");
  console.log("Summary:");
  console.log(`  Cycle ID: ${session.cycleId}`);
  console.log(`  Completed tasks: ${session.completedTasks}`);
  console.log(`  Failures: ${session.failures}`);
  console.log(`  Duration: ${Math.round((Date.now() - session.startedAt) / 1000)} seconds`);

  if (session.evaluations?.length > 0) {
    console.log("\nEvaluations:");
    session.evaluations.forEach((evaluation, i) => {
      const cat = evaluation.category || "unknown";
      console.log(`  Task ${i+1}: category=${cat}, score=${evaluation.score}, feedback=${evaluation.feedback?.substring(0, 120) || 'no feedback'}...`);
    });
  } else {
    console.log("No evaluations recorded.");
  }

  // Belt status
  try {
    const belts = manager.belts;
    const beltStatus = await belts.getProgressionStatus(characterId);
    console.log("\nBelt Progression Status:");
    console.log(JSON.stringify(beltStatus, null, 2));
  } catch (err) {
    console.warn("[TSE TEST] Belt status fetch failed:", err.message);
  }

  console.log("\nDone. Check DB for results:");
  console.log("  SELECT cycle_id, domain_id FROM tse_cycles ORDER BY created_at DESC LIMIT 1;");
  console.log("  SELECT knowledge_id, effectiveness_score FROM tse_evaluation_records WHERE cycle_id = 'your_cycle_id_here' ORDER BY created_at;");
  console.log("  SELECT ki.knowledge_id, LEFT(ki.content, 80) AS preview, cks.next_review_timestamp");
  console.log("  FROM character_knowledge_state cks");
  console.log("  JOIN knowledge_items ki ON cks.knowledge_id = ki.knowledge_id");
  console.log("  WHERE cks.character_id = '#700002' AND ki.domain_id = '#AE0008'");
  console.log("  ORDER BY cks.next_review_timestamp ASC NULLS FIRST;");
}

testTseLoop().catch(err => {
  console.error("[TSE TEST] Failed:", err.stack || err.message);
  process.exit(1);
});
