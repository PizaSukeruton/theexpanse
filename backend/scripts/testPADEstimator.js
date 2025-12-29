import padEstimator from '../services/padEstimator.js';

async function test() {
  console.log('Training PADEstimator...\n');
  const stats = await padEstimator.train();
  console.log('\nTraining stats:', stats);
  
  console.log('\n--- Testing emotion detection ---\n');
  
  const testPhrases = [
    "I'm feeling very happy",
    "I'm so sad right now",
    "I'm excited about this",
    "I feel hopeless",
    "Thank you so much",
    "I got the job"
  ];
  
  for (const phrase of testPhrases) {
    const result = padEstimator.estimate(phrase);
    console.log(`"${phrase}"`);
    console.log(`  P: ${result.pad.pleasure.toFixed(3)}, A: ${result.pad.arousal.toFixed(3)}, D: ${result.pad.dominance.toFixed(3)}`);
    console.log(`  Coverage: ${(result.coverage * 100).toFixed(1)}%, Confidence: ${(result.confidence * 100).toFixed(1)}%\n`);
  }
  
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
