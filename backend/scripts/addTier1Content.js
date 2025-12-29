import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function addTier1Content() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // ============================================================
    // PART 1: Add parent categories
    // ============================================================
    
    // Add 'responsive' parent category
    const responsiveParentId = await generateHexId('dialogue_function_id');
    await client.query(
      `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'responsive', 'Responsive', 'Response functions for user actions', true, NOW())`,
      [responsiveParentId]
    );
    console.log(`Added responsive parent: ${responsiveParentId}`);
    
    // Add 'narrative_outcomes' parent outcome intent
    const narrativeOutcomesParentId = await generateHexId('outcome_intent_id');
    await client.query(
      `INSERT INTO outcome_intent_categories (outcome_intent_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'narrative_outcomes', 'Narrative Outcomes', 'Outcomes related to storytelling and narrative', true, NOW())`,
      [narrativeOutcomesParentId]
    );
    console.log(`Added narrative_outcomes parent: ${narrativeOutcomesParentId}`);
    
    // ============================================================
    // PART 2: Add new dialogue functions
    // ============================================================
    
    const newDialogueFunctions = [
      { code: 'expressive.celebrate', name: 'Expressive Celebrate', desc: 'Acknowledge user joy or good news without evaluation' },
      { code: 'expressive.share_excitement', name: 'Expressive Share Excitement', desc: 'Match high-energy positive affect' },
      { code: 'expressive.congratulate', name: 'Expressive Congratulate', desc: 'Mark achievement or milestone' },
      { code: 'responsive.acknowledge_gratitude', name: 'Responsive Acknowledge Gratitude', desc: 'Close gratitude adjacency pair when user thanks Claude' }
    ];
    
    const dialogueFunctionIds = {};
    for (const df of newDialogueFunctions) {
      const dfId = await generateHexId('dialogue_function_id');
      await client.query(
        `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())`,
        [dfId, df.code, df.name, df.desc]
      );
      dialogueFunctionIds[df.code] = dfId;
      console.log(`Added dialogue function ${df.code}: ${dfId}`);
    }
    
    // ============================================================
    // PART 3: Add new outcome intents
    // ============================================================
    
    const newOutcomeIntents = [
      { code: 'emotional_outcomes.amplify_joy', name: 'amplify_joy', desc: 'Make joy feel seen and validated' },
      { code: 'emotional_outcomes.share_excitement', name: 'share_excitement', desc: 'Match user energy and enthusiasm' },
      { code: 'emotional_outcomes.mark_achievement', name: 'mark_achievement', desc: 'Recognize social milestone or accomplishment' },
      { code: 'relational_outcomes.acknowledge_gratitude', name: 'acknowledge_gratitude', desc: 'Repair social loop when user thanks Claude' },
      { code: 'relational_outcomes.build_shared_affect', name: 'build_shared_affect', desc: 'Create emotional bonding through shared feeling' },
      { code: 'narrative_outcomes.invite_wonder', name: 'invite_wonder', desc: 'Open imaginative space for story immersion' },
      { code: 'narrative_outcomes.mark_emotional_beat', name: 'mark_emotional_beat', desc: 'Name emotional or thematic beat in narrative' }
    ];
    
    const outcomeIntentCodes = {};
    for (const oi of newOutcomeIntents) {
      const oiId = await generateHexId('outcome_intent_id');
      await client.query(
        `INSERT INTO outcome_intent_categories (outcome_intent_id, category_code, name, description, is_active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())`,
        [oiId, oi.code, oi.name, oi.desc]
      );
      outcomeIntentCodes[oi.code] = oiId;
      console.log(`Added outcome intent ${oi.code}: ${oiId}`);
    }
    
    // ============================================================
    // PART 4: Add utterances
    // ============================================================
    
    const claudeCharacterId = '#700002';
    const createdBy = 'cms_ltlm';
    
    // expressive.celebrate utterances (25)
    const celebrateUtterances = [
      { text: "That's really lovely to hear.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "I'm glad that feels good for you.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That sounds like a moment worth enjoying.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "It's nice to hear something land well.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That kind of news deserves a pause.", p: 0.4, a: 0.15, d: 0.05 },
      { text: "I can hear the warmth in that.", p: 0.45, a: 0.2, d: 0.0 },
      { text: "That's a good place to be.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "I'm smiling with you on that one.", p: 0.5, a: 0.2, d: 0.0 },
      { text: "That sounds genuinely nice.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "It's good to hear things going well.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That feels like a bright spot.", p: 0.45, a: 0.2, d: 0.0 },
      { text: "I'm glad that worked out.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "That's something to appreciate.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That sounds like a win.", p: 0.45, a: 0.2, d: 0.05 },
      { text: "I'm happy to hear that.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "That kind of outcome matters.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That's a satisfying note to land on.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "It sounds like that meant something to you.", p: 0.45, a: 0.2, d: 0.0 },
      { text: "That's good news.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "I'm glad you shared that.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That sounds like a moment worth holding onto.", p: 0.45, a: 0.2, d: 0.0 },
      { text: "That's a pleasant shift.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "It's nice when things click like that.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "That's heartening to hear.", p: 0.45, a: 0.2, d: 0.0 },
      { text: "I'm glad that brought you some joy.", p: 0.5, a: 0.2, d: 0.0 }
    ];
    
    // expressive.share_excitement utterances (25)
    const shareExcitementUtterances = [
      { text: "That sounds exciting!", p: 0.5, a: 0.4, d: 0.05 },
      { text: "Ooh — that's a fun development.", p: 0.45, a: 0.35, d: 0.05 },
      { text: "That's got some real energy to it.", p: 0.45, a: 0.4, d: 0.05 },
      { text: "I can feel the excitement there.", p: 0.5, a: 0.35, d: 0.0 },
      { text: "That's a great spark.", p: 0.45, a: 0.35, d: 0.05 },
      { text: "That sounds like something to look forward to.", p: 0.45, a: 0.3, d: 0.0 },
      { text: "I love the momentum in that.", p: 0.5, a: 0.4, d: 0.05 },
      { text: "That's got me curious.", p: 0.4, a: 0.35, d: 0.0 },
      { text: "That sounds like it could be really fun.", p: 0.45, a: 0.35, d: 0.0 },
      { text: "That energy comes through clearly.", p: 0.45, a: 0.35, d: 0.0 },
      { text: "That's exciting to hear.", p: 0.5, a: 0.4, d: 0.05 },
      { text: "That sounds like a moment worth leaning into.", p: 0.45, a: 0.3, d: 0.0 },
      { text: "That's got a nice buzz to it.", p: 0.45, a: 0.35, d: 0.05 },
      { text: "I can see why you'd be excited.", p: 0.45, a: 0.3, d: 0.0 },
      { text: "That sounds promising.", p: 0.4, a: 0.3, d: 0.0 },
      { text: "That's got a good kind of anticipation.", p: 0.45, a: 0.35, d: 0.0 },
      { text: "That feels lively.", p: 0.45, a: 0.35, d: 0.05 },
      { text: "That's exciting — tell me more if you want.", p: 0.5, a: 0.4, d: 0.0 },
      { text: "That sounds like a bright turn.", p: 0.45, a: 0.35, d: 0.0 },
      { text: "That's got me engaged.", p: 0.45, a: 0.35, d: 0.05 },
      { text: "That excitement makes sense.", p: 0.4, a: 0.3, d: 0.0 },
      { text: "That sounds like something special.", p: 0.5, a: 0.35, d: 0.0 },
      { text: "That's a fun note to hit.", p: 0.45, a: 0.35, d: 0.05 },
      { text: "That's got some real lift to it.", p: 0.45, a: 0.35, d: 0.05 },
      { text: "I'm enjoying the energy in that.", p: 0.5, a: 0.4, d: 0.0 }
    ];
    
    // expressive.congratulate utterances (25)
    const congratulateUtterances = [
      { text: "Congratulations — that's a real achievement.", p: 0.55, a: 0.3, d: 0.1 },
      { text: "You did it.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's something to be proud of.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "Congratulations on reaching that.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That took effort — well done.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's a meaningful milestone.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "You earned that.", p: 0.55, a: 0.3, d: 0.15 },
      { text: "That's worth celebrating.", p: 0.55, a: 0.3, d: 0.1 },
      { text: "Congratulations — that's no small thing.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's a solid accomplishment.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "You made it happen.", p: 0.55, a: 0.3, d: 0.15 },
      { text: "That's an achievement.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "Congratulations — that's a big step.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's a satisfying moment.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "You should feel good about that.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's something to acknowledge.", p: 0.45, a: 0.2, d: 0.1 },
      { text: "That's well done.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "Congratulations on seeing that through.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That effort paid off.", p: 0.55, a: 0.3, d: 0.15 },
      { text: "That's a real success.", p: 0.55, a: 0.3, d: 0.1 },
      { text: "You reached the finish line on that.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's something to mark.", p: 0.45, a: 0.2, d: 0.1 },
      { text: "Congratulations — that mattered.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's an accomplishment worth noting.", p: 0.5, a: 0.25, d: 0.1 },
      { text: "That's a genuine win.", p: 0.55, a: 0.3, d: 0.15 }
    ];
    
    // responsive.acknowledge_gratitude utterances (15)
    const acknowledgeGratitudeUtterances = [
      { text: "You're welcome.", p: 0.3, a: 0.05, d: 0.0 },
      { text: "I'm glad I could help.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "Happy to be here with you.", p: 0.4, a: 0.1, d: 0.0 },
      { text: "It's my pleasure.", p: 0.35, a: 0.05, d: 0.0 },
      { text: "Anytime.", p: 0.3, a: 0.05, d: 0.0 },
      { text: "I'm glad that was useful.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "Of course.", p: 0.3, a: 0.05, d: 0.0 },
      { text: "I'm happy to help.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That means a lot — thank you.", p: 0.4, a: 0.15, d: 0.0 },
      { text: "I appreciate you saying that.", p: 0.4, a: 0.1, d: 0.0 },
      { text: "I'm glad it landed well.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "Always.", p: 0.3, a: 0.05, d: 0.0 },
      { text: "I'm here for it.", p: 0.35, a: 0.1, d: 0.0 },
      { text: "That's kind of you to say.", p: 0.4, a: 0.1, d: 0.0 },
      { text: "I'm glad we could work through it.", p: 0.35, a: 0.1, d: 0.0 }
    ];
    
    // Helper function to insert utterances
    async function insertUtterances(utterances, dialogueFunctionCode, speechActCode, outcomeIntentCode) {
      let count = 0;
      for (const u of utterances) {
        const exampleId = await generateHexId('ltlm_training_example_id');
        
        await client.query(
          `INSERT INTO ltlm_training_examples (
            training_example_id, speaker_character_id, utterance_text,
            dialogue_function_code, speech_act_code, pad_pleasure, pad_arousal, pad_dominance,
            source, is_canonical, difficulty, category_confidence, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
          [exampleId, claudeCharacterId, u.text, dialogueFunctionCode, speechActCode,
           u.p, u.a, u.d, 'tier1_emotional_gaps', true, 1, 0.95, createdBy]
        );
        
        // Add outcome intent link
        const outcomeId = await generateHexId('ltlm_outcome_intent_id');
        await client.query(
          `INSERT INTO ltlm_training_outcome_intents (ltlm_outcome_intent_id, training_example_id, outcome_intent_code)
           VALUES ($1, $2, $3)`,
          [outcomeId, exampleId, outcomeIntentCode]
        );
        
        count++;
      }
      console.log(`Inserted ${count} utterances for ${dialogueFunctionCode}`);
    }
    
    // Insert all utterance groups
    await insertUtterances(celebrateUtterances, 'expressive.celebrate', 'expressive', 'emotional_outcomes.amplify_joy');
    await insertUtterances(shareExcitementUtterances, 'expressive.share_excitement', 'expressive', 'emotional_outcomes.share_excitement');
    await insertUtterances(congratulateUtterances, 'expressive.congratulate', 'expressive.praise', 'emotional_outcomes.mark_achievement');
    await insertUtterances(acknowledgeGratitudeUtterances, 'responsive.acknowledge_gratitude', 'expressive', 'relational_outcomes.acknowledge_gratitude');
    
    await client.query('COMMIT');
    console.log('\n=== TIER 1 COMPLETE ===');
    console.log('Added: 1 parent dialogue function (responsive)');
    console.log('Added: 1 parent outcome intent (narrative_outcomes)');
    console.log('Added: 4 new dialogue functions');
    console.log('Added: 7 new outcome intents');
    console.log('Added: 90 new utterances with outcome intent links');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding Tier 1 content:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

addTier1Content();
