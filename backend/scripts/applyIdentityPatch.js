import fs from 'fs';

const filePath = './backend/services/knowledgeQueryLayer.js';

const injectionCode = `
    // =========================================
    // IDENTITY INTERCEPT: Self-reference queries for Claude
    // =========================================
    const selfIdentityPatterns = [
      /^you$/i,
      /^yourself$/i,
      /who are you/i,
      /what are you/i,
      /tell me about (you|yourself)/i,
      /who is claude/i,
      /who is the tanuki/i,
      /claude the tanuki/i,
      /your identity/i,
      /what is your name/i
    ];

    const normalizedQuery = (rawEntity || '').trim().toLowerCase();
    // Check WHO or SEARCH intent + regex match
    const isIdentityIntent = intentType === 'WHO' || intentType === 'SEARCH';
    const isSelfIdentityQuery = isIdentityIntent && 
                                selfIdentityPatterns.some(p => p.test(normalizedQuery));

    if (isSelfIdentityQuery && characterId === '#700002') {
      console.log('[KnowledgeLayer] Self-reference detected, querying identity_anchors');
      try {
        const { default: identityModule } = await import('./IdentityModule.js');
        const anchors = await identityModule.getAnchorsByType(characterId, 'core_trait');

        if (anchors && anchors.length > 0) {
          // Sort by entrenchment (strongest beliefs first)
          anchors.sort((a, b) => b.entrenchment_level - a.entrenchment_level);
          const topAnchors = anchors.slice(0, 5);

          return {
            found: true,
            items: topAnchors.map(a => ({
              knowledge_id: a.anchor_id,
              content: a.anchor_text,
              domain_id: '#IDENTITY',
              source_type: 'identity_anchor',
              anchor_type: a.anchor_type,
              entrenchment: a.entrenchment_level
            })),
            count: topAnchors.length,
            domains: [{ domain_id: '#IDENTITY' }],
            searchTerm: normalizedQuery,
            intentType,
            characterId,
            isIdentityResponse: true
          };
        } else {
          // Fallback: anchor table empty, continue to normal knowledge search
          console.warn('[KnowledgeLayer] No identity anchors found, falling back to knowledge search');
        }
      } catch (identityErr) {
        console.error('[KnowledgeLayer] Identity lookup failed:', identityErr.message);
        // Fallback: continue to normal knowledge search
      }
    }
    // =========================================
`;

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // Safety check: Don't patch twice
  if (content.includes('IDENTITY INTERCEPT')) {
    console.log('✅ File is already patched.');
    process.exit(0);
  }

  // Regex to find the start of the function, ignoring specific arguments
  const functionStartRegex = /async\s+(function\s+)?queryClaudeKnowledge\s*\([^)]*\)\s*\{/;
  
  if (functionStartRegex.test(content)) {
    const newContent = content.replace(
      functionStartRegex,
      (match) => match + '\n' + injectionCode
    );
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('✅ Successfully injected Identity Intercept into knowledgeQueryLayer.js');
  } else {
    console.error('❌ Could not find function signature "async queryClaudeKnowledge" to patch.');
    process.exit(1);
  }
} catch (err) {
  console.error('❌ Error patching file:', err);
  process.exit(1);
}
