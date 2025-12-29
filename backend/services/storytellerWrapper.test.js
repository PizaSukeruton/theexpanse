import { buildStorytellerResponse } from './storytellerWrapper.js';

const testIntent = {
  type: 'WHAT',
  entity: 'test_entity',
  confidence: 0.9
};

const testKnowledge = 'This is test knowledge content about the concept.';

(async () => {
  try {
    console.log('[TEST] Starting storytellerWrapper smoke test...\n');
    
    const result = await buildStorytellerResponse({
      intentResult: testIntent,
      emotionalSignal: null,
      knowledgeText: testKnowledge,
      tone: 'neutral',
      formality: 'casual'
    });

    console.log('[TEST] Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\n[TEST] storytellerMeta:');
    console.log(JSON.stringify(result.storytellerMeta, null, 2));
    
    if (result.storytellerMeta.phraseIds && result.storytellerMeta.phraseIds.length > 0) {
      console.log('\n✓ SUCCESS: phraseIds populated. Phrases were chained.');
    } else {
      console.log('\n⚠ WARNING: phraseIds empty. No phrases found or chainPhrases not executing.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('[TEST] Error:', err.message);
    process.exit(1);
  }
})();
