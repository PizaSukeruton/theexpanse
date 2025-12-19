import vectorMemoryManager from './vectorMemoryManager.js';
import generateHexId from './hexIdGenerator.js';

class SessionSummarizer {
  async createSessionSummary(userId, sessionContext, dossierEntries) {
    if (!sessionContext || !sessionContext.entityHistory || sessionContext.entityHistory.length === 0) {
      return null;
    }

    const entities = sessionContext.entityHistory || [];
    const uniqueEntities = [...new Set(entities.map(e => e.entity || e))];
    const topicsCovered = [...new Set(entities.map(e => e.type || 'general'))];

    const summaryPrompt = this.generateSummaryPrompt(uniqueEntities, topicsCovered, dossierEntries);

    const summaryId = await generateHexId('conversation_id');

    const summary = {
      summary_id: summaryId,
      user_id: userId,
      session_date: new Date().toISOString(),
      entities_discussed: uniqueEntities,
      topics_covered: topicsCovered,
      dossier_entries_count: dossierEntries ? dossierEntries.length : 0,
      summary_text: summaryPrompt.briefSummary,
      greeting_prompt: summaryPrompt.greetingPrompt,
      key_discoveries: summaryPrompt.keyDiscoveries,
      conversation_turns: sessionContext.conversationTurns || 0,
      council_progress_snapshot: {
        entities_researched: uniqueEntities.length,
        depth_achieved: entities.length,
        topics_explored: topicsCovered
      }
    };

    return summary;
  }

  generateSummaryPrompt(entities, topics, dossierEntries) {
    const entityList = entities.slice(0, 3).join(', ') || 'the Cheese Wars';
    const topicList = topics.slice(0, 3).join(', ') || 'various mysteries';

    const briefSummary = `Today we explored ${entityList}. Key topics: ${topicList}. ${dossierEntries && dossierEntries.length > 0 ? `You've built ${dossierEntries.length} Dossier entries on these subjects.` : ''}`;

    const greetingPrompt = `Last time we were chatting, we dove deep into ${entityList}. You were researching the mysteries of the Cheese Wars and The Expanse. Should we pick up where we left off, or explore something new?`;

    const keyDiscoveries = entities.map(entity => ({
      entity,
      significance: 'moderate',
      context: `Discussed in relation to the Cheese Wars and Council investigation`
    }));

    return {
      briefSummary,
      greetingPrompt,
      keyDiscoveries
    };
  }

  async commitSessionToMemory(userId, summary) {
    if (!summary) return null;

    try {
      const result = await vectorMemoryManager.storeConversationVector(
        userId,
        `Session Summary: ${summary.entities_discussed.join(', ')}`,
        summary.summary_text,
        {
          type: 'session_summary',
          session_id: summary.summary_id,
          entities: summary.entities_discussed,
          topics: summary.topics_covered,
          greeting_template: summary.greeting_prompt,
          manually_committed: true,
          importance_level: 'HIGH'
        }
      );

      console.log(`✓ Session summary committed to memory: ${summary.summary_id}`);
      return result;
    } catch (error) {
      console.error(`✗ Failed to commit session to memory:`, error.message);
      throw error;
    }
  }
}

export default new SessionSummarizer();
