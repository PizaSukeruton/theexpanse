(async () => {
  try {
    const { default: pool } = await import('./db/pool.js');
    const generateHexId = (await import('./utils/hexIdGenerator.js')).default;

    const characterId = '#700002';
    const lessonId = '#005201';
    const taskTypeId = '#005210';

    const studentResponse = "[STORY]: The events follow a character who has a goal and changes by the end.";

    const performanceId = await generateHexId('tse_storytelling_performance');

    const query = `
      INSERT INTO tse_storytelling_performance (
        performance_id,
        character_id,
        lesson_id,
        task_type_id,
        attempt_number,
        student_response,
        score,
        fsrs_grade,
        rubric_details,
        completed_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
      RETURNING *;
    `;

    const rubricDetails = {
      classificationCorrect: true,
      mentionsCharacterOrGoalOrChange: true
    };

    const values = [
      performanceId,
      characterId,
      lessonId,
      taskTypeId,
      1,
      studentResponse,
      100,
      5,
      rubricDetails
    ];

    const result = await pool.query(query, values);
    console.log('Recorded storytelling performance:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
