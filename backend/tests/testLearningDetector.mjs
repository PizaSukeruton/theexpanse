import learningDetector from '../services/learningDetector.js';
import padEstimator from '../services/padEstimator.js';
import ngramSurprisal from '../services/ngramSurprisal.js';
import metaphorDetector from '../services/metaphorDetector.js';

async function run() {
  // Mirror real system bootstrap
  console.log('[TEST] Training PAD estimator...');
  await padEstimator.train();

  console.log('[TEST] Training n-gram surprisal model...');
  await ngramSurprisal.train();

  console.log('[TEST] Training metaphor detector...');
  await metaphorDetector.train();

  const cases = [
    {
      name: 'BLAND',
      text: 'Hello how are you today'
    },
    {
      name: 'NOVEL_METAPHOR',
      text: 'My thoughts are a cracked compass spinning in wet fog'
    },
    {
      name: 'LOW_PAD',
      text: 'asdf qwer zxcv blip blorp'
    }
  ];

  for (const c of cases) {
    const r = await learningDetector.detectLearningOpportunity(c.text, 'test-user');
    console.log('---', c.name, '---');
    console.log({
      shouldAsk: r.shouldAsk,
      score: r.score,
      pressures: r.pressures,
      signals: r.signals
    });
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
