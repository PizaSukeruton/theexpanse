(async () => {
  try {
    const { scoreStoryVsSequenceAttempt } = await import('./StorySenseEngine.mjs');
    await scoreStoryVsSequenceAttempt('#700002');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
