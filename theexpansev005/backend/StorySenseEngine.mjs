export async function scoreStoryVsSequenceAttempt(characterId) {
  const { default: pool } = await import('./db/pool.js');
  const generateHexId = (await import('./utils/hexIdGenerator.js')).default;
  const { getCurrentStoryTaskForCharacter } = await import('./storytellingTaskHelper.mjs');

  const storyTask = await getCurrentStoryTaskForCharacter(characterId);

  if (!storyTask || storyTask.task_type_id !== '#005210') {
    console.error('Story task is missing or not #005210. Aborting.');
    return null;
  }

  const studentResponse = "[STORY]: The events follow a character who has a goal and changes by the end.";

  const text = studentResponse.toUpperCase();
  const details = {};
  details.classificationCorrect = text.startsWith('[STORY]') || text.startsWith('[SEQUENCE]');
  const lower = studentResponse.toLowerCase();
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

  const performanceId = await generateHexId('tse_storytelling_performance');

  const insertQuery = `
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

  const values = [
    performanceId,
    characterId,
    storyTask.current_lesson_id,
    storyTask.task_type_id,
    1,
    studentResponse,
    score,
    fsrsGrade,
    details
  ];

  const result = await pool.query(insertQuery, values);
  console.log('StorySenseEngine recorded performance:');
  console.log(JSON.stringify(result.rows[0], null, 2));
  return result.rows[0];
}
