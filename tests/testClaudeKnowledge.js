import { getClaudeKnowledgeSummary } from './services/claudeKnowledgeService.js';

const run = async () => {
  const test = await getClaudeKnowledgeSummary('Japan');
  console.log(JSON.stringify(test, null, 2));
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
