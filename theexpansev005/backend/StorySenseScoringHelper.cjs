(async () => {
  try {
    const { default: pool } = await import('./db/pool.js');

    async function getRubric(taskTypeId) {
      const res = await pool.query(
        'SELECT features, total_possible_score, grade_mapping FROM tse_storytelling_rubrics WHERE task_type_id = $1',
        [taskTypeId]
      );
      return res.rows[0] || null;
    }

    function scoreStoryVsSequenceAnswer(answer, rubric) {
      const text = answer.toUpperCase();
      const details = {};

      details.classificationCorrect = text.startsWith('[STORY]') || text.startsWith('[SEQUENCE]');
      const lower = answer.toLowerCase();
      details.mentionsCharacterOrGoalOrChange =
        lower.includes('character') || lower.includes('goal') || lower.includes('change');

      let score = 0;
      if (details.classificationCorrect) score += 50;
      if (details.mentionsCharacterOrGoalOrChange) score += 50;

      let fsrsGrade = 0;
      if (score >= 90) fsrsGrade = 5;
      else if (score >= 75) fsrsGrade = 4;
      else if (score >= 50) fsrsGrade = 3;
      else if (score >= 25) fsrsGrade = 2;
      else if (score > 0) fsrsGrade = 1;

      return { score, fsrsGrade, rubricDetails: details };
    }

    const taskTypeId = '#005210';
    const rubric = await getRubric(taskTypeId);

    const testAnswer = "[STORY]: The events follow a character who has a goal and changes by the end.";
    const scored = scoreStoryVsSequenceAnswer(testAnswer, rubric);

    console.log('Scored example answer for', taskTypeId);
    console.log(JSON.stringify(scored, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
