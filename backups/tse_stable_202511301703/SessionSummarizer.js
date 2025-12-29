export default class SessionSummarizer {
  static summarize(session) {
    if (!session || !session.tasks || !session.evaluations) {
      return "No session data provided.";
    }

    const totalTasks = session.tasks.length;
    const avgScore =
      session.evaluations.reduce((a, b) => a + b.score, 0) /
      session.evaluations.length;

    const summaryLines = [];

    summaryLines.push(
      `Session complete. ${totalTasks} tasks attempted.`
    );

    summaryLines.push(
      `Average performance score: ${avgScore.toFixed(2)}`
    );

    if (session.beltAfter) {
      summaryLines.push(
        `Updated belt level: ${session.beltAfter.level} (XP: ${session.beltAfter.xpGained})`
      );
    }

    session.tasks.forEach((task, i) => {
      const evalScore = session.evaluations[i]?.score ?? 0;
      summaryLines.push(
        `Task ${i + 1}: ${task.taskType} – Score ${evalScore}/5`
      );
    });

    let strengths = [];
    let weaknesses = [];

    if (avgScore >= 4) {
      strengths.push("Strong causal reasoning");
    } else if (avgScore >= 2) {
      strengths.push("Partial task understanding");
      weaknesses.push("Inconsistent clarity");
    } else {
      weaknesses.push("Struggles with core task structure");
    }

    if (strengths.length) {
      summaryLines.push("Strengths: " + strengths.join(", "));
    }

    if (weaknesses.length) {
      summaryLines.push("Needs Improvement: " + weaknesses.join(", "));
    }

    return summaryLines.join("\n");
  }
}
