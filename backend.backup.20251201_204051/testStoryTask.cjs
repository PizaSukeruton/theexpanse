const { getCurrentStoryTaskForCharacter } = require('./storytellingTaskHelper.cjs');

(async () => {
  const task = await getCurrentStoryTaskForCharacter('#700002');
  console.log(JSON.stringify(task, null, 2));
})();
