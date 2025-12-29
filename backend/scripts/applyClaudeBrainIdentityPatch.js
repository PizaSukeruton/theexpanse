import fs from 'fs';

const filePath = './backend/councilTerminal/ClaudeBrain.js';

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // Safety check: Don't patch twice
  if (content.includes('identityModule')) {
    console.log('✅ File already contains identityModule references.');
    process.exit(0);
  }

  // 1. Add import after DrClaudeModule
  content = content.replace(
    "import DrClaudeModule from '../services/DrClaudeModule.js';",
    "import DrClaudeModule from '../services/DrClaudeModule.js';\nimport identityModule from '../services/IdentityModule.js';"
  );
  console.log('✅ Added identityModule import');

  // 2. Add STEP 2.8 after STEP 2.75 (before STEP 3)
  const step28Code = `

      // ==========================================
      // STEP 2.8: IDENTITY CONTEXT LOADING
      // ==========================================
      let identityContext = null;
      try {
        identityContext = await identityModule.buildIdentityContext(
          this.CLAUDE_CHARACTER_ID,
          user.user_id || '#D00001',
          { userInput: command, pad: userPad }
        );
        console.log('[ClaudeBrain] Identity loaded: ' + identityContext.anchors.length + ' anchors, trust=' + (identityContext.relationship?.trustScore?.toFixed(2) || 'N/A'));
      } catch (identityError) {
        console.error('[ClaudeBrain] Identity load failed:', identityError.message);
      }

`;

  content = content.replace(
    "// ==========================================\n      // STEP 3: GET CLAUDE'S MOOD",
    step28Code + "      // ==========================================\n      // STEP 3: GET CLAUDE'S MOOD"
  );
  console.log('✅ Added STEP 2.8 identity context loading');

  // 3. Update handleNoEntityFound call to pass identityContext
  content = content.replace(
    "return await this.handleNoEntityFound(intentResult, session, user, responseStyle, userPad, mood);",
    "return await this.handleNoEntityFound(intentResult, session, user, responseStyle, userPad, mood, identityContext);"
  );
  console.log('✅ Updated handleNoEntityFound call with identityContext');

  // 4. Update handleNoEntityFound signature
  content = content.replace(
    "async handleNoEntityFound(intentResult, session, user, responseStyle, userPad, mood) {",
    "async handleNoEntityFound(intentResult, session, user, responseStyle, userPad, mood, identityContext = null) {"
  );
  console.log('✅ Updated handleNoEntityFound signature');

  // 5. Add identity response handling and learning gate in handleNoEntityFound
  const identityHandlingCode = `
      // Check if this is an identity response
      const isIdentity = knowledgeResult.isIdentityResponse || false;
      const source = isIdentity ? 'identity' : 'lore';

      return {
        success: true,
        output,
        source,
        isIdentityResponse: isIdentity,
        confidence: isIdentity ? 0.95 : 0.7,
        knowledgeResult,
        storeContext: {
          lastDomains: knowledgeResult.domains || [],
          lastEntity: intentResult.entity,
          knowledgeIds: knowledgeResult.items.map(i => i.knowledge_id),
          lastKnowledgeIndex: 0
        }
      };
    }

    // Identity gate for learning
    if (identityContext) {
      try {
        const canLearnCheck = await identityModule.canLearn(this.CLAUDE_CHARACTER_ID, {
          content: intentResult.original || intentResult.entity
        });
        if (!canLearnCheck.allowed) {
          console.log('[ClaudeBrain] Learning blocked by identity:', canLearnCheck.reason);
          session.context.learning_mode_disabled = true;
        }
      } catch (learnGateErr) {
        console.error('[ClaudeBrain] Learning gate error:', learnGateErr.message);
      }
    }

    if (user.access_level !== 11`;

  // Replace the original return block in handleNoEntityFound
  content = content.replace(
    `return {
        success: true,
        output,
        source: 'lore',
        confidence: 0.7,
        knowledgeResult,
        storeContext: {
          lastDomains: knowledgeResult.domains || [],
          lastEntity: intentResult.entity,
          knowledgeIds: knowledgeResult.items.map(i => i.knowledge_id),
          lastKnowledgeIndex: 0
        }
      };
    }

    if (user.access_level !== 11`,
    identityHandlingCode
  );
  console.log('✅ Added identity response handling and learning gate');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('\n✅ All patches applied successfully to ClaudeBrain.js');

} catch (err) {
  console.error('❌ Error patching file:', err);
  process.exit(1);
}
