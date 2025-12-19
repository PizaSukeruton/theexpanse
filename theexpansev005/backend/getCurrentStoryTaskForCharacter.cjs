(async () => {
  try {
    const { default: pool } = await import('./db/pool.js');

    async function getCurrentStoryTaskForCharacter(characterId) {
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

    const row = await getCurrentStoryTaskForCharacter('#700002');
    console.log(JSON.stringify(row, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
