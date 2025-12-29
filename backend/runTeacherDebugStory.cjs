(async () => {
  const { default: pool } = await import('./db/pool.js');
  const TeacherComponent = (await import('./tse/TeacherComponent.js')).default;

  const teacher = new TeacherComponent(pool);
  await teacher.initialize();
  await teacher.debugStoryTaskForClaude();
  process.exit(0);
})();
