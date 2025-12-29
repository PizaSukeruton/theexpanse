async function getCurrentStoryTaskForCharacter(characterId) {
  const { default: pool } = await import('./db/pool.js');

  const query = `
    SELECT 
      s.character_id,
      s.current_lesson_id,
      l.lesson_name,
      l.teacher_definition,
      l.teacher_micro_examples,
      l.teacher_worked_example,
      t.task_type_id,
      t.task_name,
      t.prompt_template,
      t.expected_output_format
    FROM tse_character_storytelling_state s
    JOIN tse_storytelling_lessons l
      ON s.current_lesson_id = l.lesson_id
    JOIN tse_storytelling_task_types t
      ON l.lesson_id = t.lesson_id
    WHERE s.character_id = $1
    ORDER BY t.difficulty ASC
    LIMIT 1;
  `;

  const result = await pool.query(query, [characterId]);
  return result.rows[0] || null;
}

module.exports = { getCurrentStoryTaskForCharacter };
