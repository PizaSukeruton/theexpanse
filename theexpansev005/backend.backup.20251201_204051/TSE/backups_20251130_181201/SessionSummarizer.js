export default class SessionSummarizer {
  static summarize(session) {
    const taskCount = session.tasks.length;
    const avgScore =
      session.evaluations.reduce((a, b) => a + b.score, 0) / (taskCount || 1);

    // FIXED: Using correct property names from BeltProgressionManager
    const beltInfo = session.beltAfter
      ? `Updated belt level: ${session.beltAfter.newBelt} (XP: ${session.beltAfter.xpGained})`
      : "Belt info unavailable";

    const taskSummary = session.tasks
      .map((t, i) => {
        const score = session.evaluations[i]?.score || 0;
        return `Task ${i + 1}: ${t.taskType} – Score ${score}/5`;
      })
      .join("\n");

    let insight = "";
    if (avgScore >= 4) insight = "Strengths: Strong grasp of concepts";
    else if (avgScore >= 2.5) insight = "Strengths: Partial task understanding\nNeeds Improvement: Inconsistent clarity";
    else insight = "Needs Improvement: Struggles with core task structure";

    return `Session complete. ${taskCount} tasks attempted.
Average performance score: ${avgScore.toFixed(2)}
${beltInfo}
${taskSummary}
${insight}`;
  }
}
