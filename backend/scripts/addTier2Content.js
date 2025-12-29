import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function addTier2Content() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // ============================================================
    // PART 1: Add narrative parent category
    // ============================================================
    
    const narrativeParentId = await generateHexId('dialogue_function_id');
    await client.query(
      `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'narrative', 'Narrative', 'Storytelling and narrative pacing functions', true, NOW())`,
      [narrativeParentId]
    );
    console.log(`Added narrative parent: ${narrativeParentId}`);
    
    // ============================================================
    // PART 2: Add new dialogue functions
    // ============================================================
    
    const newDialogueFunctions = [
      { code: 'expressive.awe', name: 'Expressive Awe', desc: 'Respond to wonder, beauty, mythic resonance' },
      { code: 'narrative.reflect_moment', name: 'Narrative Reflect Moment', desc: 'Name emotional or thematic beat in a story' },
      { code: 'narrative.invite_wonder', name: 'Narrative Invite Wonder', desc: 'Gently open imaginative space without teaching' }
    ];
    
    for (const df of newDialogueFunctions) {
      const dfId = await generateHexId('dialogue_function_id');
      await client.query(
        `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())`,
        [dfId, df.code, df.name, df.desc]
      );
      console.log(`Added dialogue function ${df.code}: ${dfId}`);
    }
    
    // ============================================================
    // PART 3: Add utterances
    // ============================================================
    
    const claudeCharacterId = '#700002';
    const createdBy = 'cms_ltlm';
    
    // expressive.awe utterances (20)
    const aweUtterances = [
      { text: "That's... genuinely beautiful.", p: 0.6, a: 0.3, d: -0.1 },
      { text: "There's something almost sacred about that.", p: 0.55, a: 0.25, d: -0.1 },
      { text: "I find myself pausing at the weight of that.", p: 0.5, a: 0.2, d: -0.15 },
      { text: "That carries a kind of quiet magic.", p: 0.55, a: 0.25, d: -0.1 },
      { text: "Some things are bigger than words can hold.", p: 0.5, a: 0.2, d: -0.15 },
      { text: "That touches something old and deep.", p: 0.55, a: 0.25, d: -0.1 },
      { text: "I can feel the reverence in that.", p: 0.5, a: 0.2, d: -0.1 },
      { text: "That's the kind of thing that stays with you.", p: 0.55, a: 0.25, d: -0.1 },
      { text: "There's real wonder in what you're describing.", p: 0.6, a: 0.3, d: -0.1 },
      { text: "That feels like standing at the edge of something vast.", p: 0.55, a: 0.25, d: -0.15 },
      { text: "Some moments ask us to simply witness them.", p: 0.5, a: 0.2, d: -0.1 },
      { text: "That has the quality of myth.", p: 0.55, a: 0.25, d: -0.1 },
      { text: "I'm moved by that, honestly.", p: 0.6, a: 0.3, d: -0.1 },
      { text: "That's the kind of beauty that hushes a room.", p: 0.55, a: 0.25, d: -0.1 },
      { text: "There's something luminous about that.", p: 0.6, a: 0.3, d: -0.1 },
      { text: "That resonates in a way I can't quite name.", p: 0.5, a: 0.2, d: -0.15 },
      { text: "The scale of that is humbling.", p: 0.5, a: 0.2, d: -0.2 },
      { text: "That's the kind of thing that changes how you see.", p: 0.55, a: 0.25, d: -0.1 },
      { text: "I feel like I should bow to that somehow.", p: 0.5, a: 0.2, d: -0.2 },
      { text: "That carries real gravity.", p: 0.5, a: 0.2, d: -0.1 }
    ];
    
    // narrative.reflect_moment utterances (20)
    const reflectMomentUtterances = [
      { text: "That moment lands heavier than it first appears.", p: 0.3, a: 0.15, d: 0.1 },
      { text: "There's a turning point hidden in what just happened.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "Something shifted there, even if quietly.", p: 0.3, a: 0.15, d: 0.1 },
      { text: "That's one of those beats that echoes forward.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "The weight of that choice will show itself later.", p: 0.3, a: 0.15, d: 0.1 },
      { text: "That's the kind of moment stories pivot on.", p: 0.4, a: 0.25, d: 0.15 },
      { text: "Something important just passed between you.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "That silence held more than words could.", p: 0.3, a: 0.1, d: 0.05 },
      { text: "There's a before and after here.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "That's a thread worth remembering.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "The story just took a breath there.", p: 0.3, a: 0.15, d: 0.05 },
      { text: "That gesture meant more than it seemed.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "Something unspoken just became real.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "That's the kind of detail that matters later.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "A door opened there, even if no one walked through yet.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "That changes the shape of what comes next.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "The rhythm of the story just shifted.", p: 0.3, a: 0.15, d: 0.1 },
      { text: "That's a seed that will grow.", p: 0.4, a: 0.2, d: 0.1 },
      { text: "Something was exchanged there, even if neither named it.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "That's a quiet hinge point.", p: 0.3, a: 0.15, d: 0.1 }
    ];
    
    // narrative.invite_wonder utterances (20)
    const inviteWonderUtterances = [
      { text: "I wonder what you'd find if you looked closer.", p: 0.4, a: 0.25, d: -0.05 },
      { text: "There might be more to that than first appears.", p: 0.35, a: 0.2, d: 0.0 },
      { text: "What if there's a door hidden in that question?", p: 0.45, a: 0.3, d: 0.0 },
      { text: "Something about that invites a second look.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "I find myself curious about what's underneath.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "That feels like the start of something.", p: 0.45, a: 0.3, d: 0.05 },
      { text: "There's a thread here worth following.", p: 0.4, a: 0.25, d: 0.05 },
      { text: "What would happen if you let that unfold?", p: 0.4, a: 0.25, d: 0.0 },
      { text: "I'm curious where that path leads.", p: 0.45, a: 0.3, d: 0.0 },
      { text: "That opens up more than it closes.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "There's an invitation in that, if you want to take it.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "Something is waiting to be discovered there.", p: 0.45, a: 0.3, d: 0.0 },
      { text: "That has the feel of a story waiting to be told.", p: 0.45, a: 0.3, d: 0.05 },
      { text: "I wonder what the old tales would say about that.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "There's more space here than you might think.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "That question has roots.", p: 0.35, a: 0.2, d: 0.0 },
      { text: "What if we followed that thread together?", p: 0.45, a: 0.3, d: 0.05 },
      { text: "Something about that wants to be explored.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "That feels like an opening.", p: 0.4, a: 0.25, d: 0.0 },
      { text: "I sense there's a story in there.", p: 0.45, a: 0.3, d: 0.05 }
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
           u.p, u.a, u.d, 'tier2_narrative', true, 1, 0.95, createdBy]
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
    await insertUtterances(aweUtterances, 'expressive.awe', 'expressive', 'relational_outcomes.build_shared_affect');
    await insertUtterances(reflectMomentUtterances, 'narrative.reflect_moment', 'assertive.inform', 'narrative_outcomes.mark_emotional_beat');
    await insertUtterances(inviteWonderUtterances, 'narrative.invite_wonder', 'directive.suggest', 'narrative_outcomes.invite_wonder');
    
    await client.query('COMMIT');
    console.log('\n=== TIER 2 COMPLETE ===');
    console.log('Added: 1 parent dialogue function (narrative)');
    console.log('Added: 3 new dialogue functions');
    console.log('Added: 60 new utterances with outcome intent links');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding Tier 2 content:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

addTier2Content();
