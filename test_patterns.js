import cotwIntentMatcher from './backend/councilTerminal/cotwIntentMatcher.js';

const testQueries = [
  'who are you',
  'what are you',
  'tell me about yourself',
  'are you real',
  "you're a bot",
  'who is claude',
  'what can you do',
  'who is Piza Sukeruton',
  'hi',
  'thanks'
];

console.log('Testing SELF_INQUIRY pattern detection:\n');

testQueries.forEach(query => {
  const normalized = query.toLowerCase().trim().replace(/[?!.,;:]+$/, '');
  let matched = false;
  let matchedType = 'NONE';
  
  for (const [intentType, patterns] of Object.entries(cotwIntentMatcher.conversationalPatterns)) {
    for (const pattern of patterns) {
      if (pattern.test(normalized)) {
        matched = true;
        matchedType = intentType;
        break;
      }
    }
    if (matched) break;
  }
  
  console.log('  "' + query + '" => ' + matchedType);
});
