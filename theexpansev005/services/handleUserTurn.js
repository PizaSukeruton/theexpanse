import { getClaudeKnowledgeSummary } from './claudeKnowledgeService.js';

function intentIsKnowledgeScopeQuestion(userText) {
  const lower = userText.toLowerCase();
  return lower.includes('do you know anything about');
}

function extractTopic(userText) {
  const marker = 'do you know anything about';
  const lower = userText.toLowerCase();
  const idx = lower.indexOf(marker);
  if (idx === -1) return userText.trim();
  const after = userText.slice(idx + marker.length).trim();
  return after.replace(/[?]+$/, '').trim();
}

export async function handleUserTurn(userText, claudeContext, generateClaudeReply) {
  if (intentIsKnowledgeScopeQuestion(userText)) {
    const topic = extractTopic(userText);
    const summary = await getClaudeKnowledgeSummary(topic);

    return generateClaudeReply({
      type: 'knowledge_capability_summary',
      summary,
      claudeMode: claudeContext.tanukiMode
    });
  }

  return generateClaudeReply({
    type: 'default',
    claudeMode: claudeContext.tanukiMode
  });
}
