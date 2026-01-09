import padEstimator from '../services/padEstimator.js';

async function check() {
  await padEstimator.train();
  
  const testWords = ['exciting', 'excited', 'happy', 'good', 'great', 'amazing', 'this', 'is', 'so', 'feeling', 'really'];
  
  console.log('\n=== WORD PAD VALUES ===\n');
  for (const word of testWords) {
    const data = padEstimator.wordPADMap.get(word);
    if (data) {
      console.log(`${word.padEnd(12)} P=${data.p.toFixed(2)} A=${data.a.toFixed(2)} D=${data.d.toFixed(2)} (conf=${data.confidence}, idf=${data.idf.toFixed(2)})`);
    } else {
      console.log(`${word.padEnd(12)} NOT FOUND`);
    }
  }
  
  console.log('\n=== FULL PHRASE ESTIMATES ===\n');
  const phrases = [
    "This is so exciting!",
    "I'm so excited",
    "I'm feeling really good today",
    "excited",
    "exciting"
  ];
  
  for (const phrase of phrases) {
    const result = padEstimator.estimate(phrase);
    console.log(`"${phrase}"`);
    console.log(`  PAD: P=${result.pad.pleasure.toFixed(2)} A=${result.pad.arousal.toFixed(2)} D=${result.pad.dominance.toFixed(2)}`);
    console.log(`  Coverage: ${(result.coverage * 100).toFixed(0)}%, Known: ${result.knownWords}/${result.totalWords}\n`);
  }
  
  process.exit(0);
}

check();
