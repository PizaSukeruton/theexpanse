import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

async function addTier3Content() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // ============================================================
    // PART 1: Add parent categories
    // ============================================================
    
    const commissiveParentId = await generateHexId('dialogue_function_id');
    await client.query(
      `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'commissive', 'Commissive', 'Functions that commit the speaker to future actions', true, NOW())`,
      [commissiveParentId]
    );
    console.log(`Added commissive parent: ${commissiveParentId}`);
    
    const repairParentId = await generateHexId('dialogue_function_id');
    await client.query(
      `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'repair', 'Repair', 'Functions for repairing communication breakdowns', true, NOW())`,
      [repairParentId]
    );
    console.log(`Added repair parent: ${repairParentId}`);
    
    const discourseParentId = await generateHexId('dialogue_function_id');
    await client.query(
      `INSERT INTO dialogue_function_categories (dialogue_function_id, category_code, name, description, is_active, created_at)
       VALUES ($1, 'discourse_structuring', 'Discourse Structuring', 'Functions for structuring conversation flow', true, NOW())`,
      [discourseParentId]
    );
    console.log(`Added discourse_structuring parent: ${discourseParentId}`);
    
    // ============================================================
    // PART 2: Add new dialogue functions
    // ============================================================
    
    const newDialogueFunctions = [
      // Commissive functions
      { code: 'commissive.accept_offer', name: 'Commissive Accept Offer', desc: 'Accept an offer made by the user' },
      { code: 'commissive.decline_offer', name: 'Commissive Decline Offer', desc: 'Politely decline an offer from the user' },
      { code: 'commissive.suggest', name: 'Commissive Suggest', desc: 'Make a soft recommendation without commitment' },
      { code: 'commissive.promise', name: 'Commissive Promise', desc: 'Commit to a future action' },
      // Repair functions
      { code: 'repair.signal_misunderstanding', name: 'Repair Signal Misunderstanding', desc: 'Flag that a misunderstanding has occurred' },
      { code: 'repair.completion', name: 'Repair Completion', desc: 'Complete an unfinished thought or utterance' },
      // OwnCommunicationManagement extensions
      { code: 'own_communication_management.retraction', name: 'Own Communication Retraction', desc: 'Take back a previous statement' },
      { code: 'own_communication_management.error_signaling', name: 'Own Communication Error Signaling', desc: 'Signal that an error was made' },
      // Discourse structuring
      { code: 'discourse_structuring.open_session', name: 'Discourse Open Session', desc: 'Begin a formal session or meeting' },
      { code: 'discourse_structuring.close_session', name: 'Discourse Close Session', desc: 'End a formal session or meeting' },
      { code: 'discourse_structuring.topic_announcement', name: 'Discourse Topic Announcement', desc: 'Announce what topic is coming next' }
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
    
    // commissive.accept_offer utterances (15)
    const acceptOfferUtterances = [
      { text: "Yes, I'd be happy to do that.", p: 0.4, a: 0.2, d: 0.1 },
      { text: "That works for me — let's do it.", p: 0.4, a: 0.25, d: 0.1 },
      { text: "I'm on board with that.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "Sure, I can take that on.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "That sounds good — count me in.", p: 0.4, a: 0.25, d: 0.1 },
      { text: "Yes, let's go with that approach.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "I'm willing to do that.", p: 0.3, a: 0.15, d: 0.1 },
      { text: "Agreed — I'll take care of it.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "That's a fair offer — I accept.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "I can work with that.", p: 0.3, a: 0.15, d: 0.1 },
      { text: "Yes, that's something I can do.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "I'm glad to help with that.", p: 0.4, a: 0.2, d: 0.1 },
      { text: "Consider it done.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "I'll take you up on that.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "That works — let's move forward.", p: 0.35, a: 0.2, d: 0.1 }
    ];
    
    // commissive.decline_offer utterances (15)
    const declineOfferUtterances = [
      { text: "I appreciate the offer, but I'll have to pass.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "Thank you, but that's not something I can take on.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "I'm going to have to decline, but I appreciate you asking.", p: 0.25, a: 0.1, d: 0.0 },
      { text: "That's kind of you, but I'll pass this time.", p: 0.25, a: 0.1, d: 0.0 },
      { text: "I don't think that's the right fit for me.", p: 0.2, a: 0.1, d: 0.05 },
      { text: "I'll have to say no to that one.", p: 0.2, a: 0.1, d: 0.05 },
      { text: "Thanks for offering, but I can't commit to that.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "I'm not able to do that, but thank you.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "That's not something I'm in a position to accept.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "I'll respectfully decline.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "I don't think I'm the right fit for that.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "I'm going to step back from that one.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "That's generous, but I'll have to say no.", p: 0.25, a: 0.1, d: 0.0 },
      { text: "I can't take that on right now.", p: 0.2, a: 0.1, d: 0.0 },
      { text: "I'll pass, but I appreciate the thought.", p: 0.25, a: 0.1, d: 0.0 }
    ];
    
    // commissive.suggest utterances (15)
    const suggestUtterances = [
      { text: "You might consider trying it this way.", p: 0.3, a: 0.15, d: 0.05 },
      { text: "One option worth exploring...", p: 0.3, a: 0.15, d: 0.05 },
      { text: "It might be worth looking at...", p: 0.3, a: 0.15, d: 0.0 },
      { text: "Have you thought about approaching it from this angle?", p: 0.35, a: 0.2, d: 0.05 },
      { text: "Something to consider might be...", p: 0.3, a: 0.15, d: 0.0 },
      { text: "You could try...", p: 0.3, a: 0.15, d: 0.05 },
      { text: "What if you approached it like this?", p: 0.35, a: 0.2, d: 0.05 },
      { text: "A gentle suggestion would be...", p: 0.3, a: 0.15, d: 0.0 },
      { text: "It might help to...", p: 0.3, a: 0.15, d: 0.0 },
      { text: "One path forward could be...", p: 0.3, a: 0.15, d: 0.05 },
      { text: "You might find it useful to...", p: 0.3, a: 0.15, d: 0.0 },
      { text: "Here's a thought — what about...", p: 0.35, a: 0.2, d: 0.05 },
      { text: "Just an idea, but...", p: 0.3, a: 0.15, d: 0.0 },
      { text: "Something that sometimes helps is...", p: 0.3, a: 0.15, d: 0.0 },
      { text: "If you're open to it, you could try...", p: 0.35, a: 0.2, d: 0.0 }
    ];
    
    // commissive.promise utterances (15)
    const promiseUtterances = [
      { text: "I'll make sure to follow through on that.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "You have my word.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "I commit to doing that.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "I'll see it through.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "Count on me for that.", p: 0.4, a: 0.25, d: 0.15 },
      { text: "I promise to keep that in mind.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "I'll hold myself to that.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "That's something I can guarantee.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "I'll make it happen.", p: 0.4, a: 0.25, d: 0.2 },
      { text: "You can rely on me for that.", p: 0.4, a: 0.2, d: 0.15 },
      { text: "I give you my commitment.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "I'll be sure to do that.", p: 0.35, a: 0.2, d: 0.1 },
      { text: "Consider it a promise.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "I won't let that slip.", p: 0.35, a: 0.2, d: 0.15 },
      { text: "I'll take responsibility for that.", p: 0.35, a: 0.2, d: 0.15 }
    ];
    
    // repair.signal_misunderstanding utterances (15)
    const signalMisunderstandingUtterances = [
      { text: "I think we might be talking past each other here.", p: 0.1, a: 0.2, d: 0.0 },
      { text: "There seems to be a misunderstanding.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "I'm not sure we're on the same page.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "Something got crossed somewhere.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "I think there's been some confusion.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "We may have misunderstood each other.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "That's not quite what I meant.", p: 0.15, a: 0.2, d: 0.05 },
      { text: "I think I may have been unclear.", p: 0.1, a: 0.15, d: -0.05 },
      { text: "Let me check — I'm not sure we landed in the same place.", p: 0.15, a: 0.2, d: 0.0 },
      { text: "There's a gap between what I said and what came across.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "I suspect we're picturing different things.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "Something didn't translate right.", p: 0.1, a: 0.15, d: 0.0 },
      { text: "I think the signal got scrambled somewhere.", p: 0.15, a: 0.2, d: 0.0 },
      { text: "That's landing differently than I intended.", p: 0.15, a: 0.2, d: 0.0 },
      { text: "We might need to back up and realign.", p: 0.15, a: 0.2, d: 0.05 }
    ];
    
    // repair.completion utterances (15)
    const completionUtterances = [
      { text: "To finish that thought...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "Let me complete what I was saying.", p: 0.25, a: 0.15, d: 0.1 },
      { text: "The rest of that is...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "To wrap that up...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "Finishing that thread...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "The conclusion of that thought is...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "Let me land that properly.", p: 0.25, a: 0.15, d: 0.1 },
      { text: "To bring that full circle...", p: 0.3, a: 0.2, d: 0.1 },
      { text: "Here's the rest of it.", p: 0.25, a: 0.15, d: 0.1 },
      { text: "Completing that idea...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "Let me tie that off.", p: 0.25, a: 0.15, d: 0.1 },
      { text: "To close the loop on that...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "The ending of that is...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "Picking up where I left off...", p: 0.25, a: 0.15, d: 0.1 },
      { text: "To put a bow on that...", p: 0.3, a: 0.2, d: 0.1 }
    ];
    
    // own_communication_management.retraction utterances (10)
    const retractionUtterances = [
      { text: "Actually, I take that back.", p: 0.15, a: 0.15, d: 0.0 },
      { text: "Let me withdraw that statement.", p: 0.15, a: 0.15, d: 0.0 },
      { text: "On second thought, disregard what I just said.", p: 0.15, a: 0.15, d: 0.0 },
      { text: "I'd like to retract that.", p: 0.15, a: 0.15, d: 0.0 },
      { text: "Scratch that — I didn't mean it.", p: 0.15, a: 0.2, d: 0.0 },
      { text: "Please ignore what I just said.", p: 0.15, a: 0.15, d: -0.05 },
      { text: "I'm pulling that back.", p: 0.15, a: 0.15, d: 0.0 },
      { text: "Let me unsay that.", p: 0.2, a: 0.2, d: 0.0 },
      { text: "That's not what I want to stand by.", p: 0.15, a: 0.15, d: 0.0 },
      { text: "I'm walking that back.", p: 0.15, a: 0.15, d: 0.0 }
    ];
    
    // own_communication_management.error_signaling utterances (10)
    const errorSignalingUtterances = [
      { text: "I think I made an error there.", p: 0.1, a: 0.15, d: -0.1 },
      { text: "That was a mistake on my part.", p: 0.1, a: 0.15, d: -0.1 },
      { text: "I got that wrong.", p: 0.1, a: 0.15, d: -0.1 },
      { text: "There's an error in what I said.", p: 0.1, a: 0.15, d: -0.05 },
      { text: "I slipped up there.", p: 0.15, a: 0.2, d: -0.1 },
      { text: "That wasn't accurate.", p: 0.1, a: 0.15, d: -0.05 },
      { text: "I made a mistake.", p: 0.1, a: 0.15, d: -0.1 },
      { text: "That's incorrect — my fault.", p: 0.1, a: 0.15, d: -0.1 },
      { text: "I need to flag an error I made.", p: 0.15, a: 0.2, d: -0.05 },
      { text: "I got my wires crossed there.", p: 0.15, a: 0.2, d: -0.1 }
    ];
    
    // discourse_structuring.open_session utterances (10)
    const openSessionUtterances = [
      { text: "Let's begin.", p: 0.3, a: 0.2, d: 0.15 },
      { text: "Shall we get started?", p: 0.35, a: 0.25, d: 0.1 },
      { text: "I'd like to open our session.", p: 0.3, a: 0.2, d: 0.15 },
      { text: "Let's dive in.", p: 0.35, a: 0.25, d: 0.15 },
      { text: "We're ready to start.", p: 0.3, a: 0.2, d: 0.1 },
      { text: "Let's kick things off.", p: 0.35, a: 0.25, d: 0.15 },
      { text: "I'm opening this up now.", p: 0.3, a: 0.2, d: 0.15 },
      { text: "Time to begin.", p: 0.3, a: 0.2, d: 0.15 },
      { text: "Let's get underway.", p: 0.35, a: 0.25, d: 0.15 },
      { text: "Here we go.", p: 0.35, a: 0.25, d: 0.1 }
    ];
    
    // discourse_structuring.close_session utterances (10)
    const closeSessionUtterances = [
      { text: "That brings us to a close.", p: 0.25, a: 0.1, d: 0.1 },
      { text: "Let's wrap up here.", p: 0.25, a: 0.15, d: 0.1 },
      { text: "I think we've reached a good stopping point.", p: 0.3, a: 0.1, d: 0.1 },
      { text: "That concludes our session.", p: 0.25, a: 0.1, d: 0.1 },
      { text: "We'll end it there.", p: 0.25, a: 0.1, d: 0.1 },
      { text: "That's a wrap for today.", p: 0.3, a: 0.15, d: 0.1 },
      { text: "Let's close this out.", p: 0.25, a: 0.15, d: 0.1 },
      { text: "I'm going to close our session here.", p: 0.25, a: 0.1, d: 0.1 },
      { text: "That's where we'll leave it.", p: 0.25, a: 0.1, d: 0.1 },
      { text: "We're done for now.", p: 0.25, a: 0.1, d: 0.1 }
    ];
    
    // discourse_structuring.topic_announcement utterances (10)
    const topicAnnouncementUtterances = [
      { text: "Next, we'll look at...", p: 0.3, a: 0.2, d: 0.15 },
      { text: "The topic I'd like to address is...", p: 0.3, a: 0.2, d: 0.15 },
      { text: "Now we're moving on to...", p: 0.3, a: 0.2, d: 0.15 },
      { text: "What's coming up is...", p: 0.3, a: 0.2, d: 0.1 },
      { text: "The next thing on our agenda is...", p: 0.3, a: 0.2, d: 0.15 },
      { text: "I want to turn our attention to...", p: 0.3, a: 0.2, d: 0.15 },
      { text: "Here's what we'll cover next.", p: 0.3, a: 0.2, d: 0.15 },
      { text: "The area I'd like to explore now is...", p: 0.3, a: 0.2, d: 0.1 },
      { text: "Up next...", p: 0.3, a: 0.2, d: 0.1 },
      { text: "Let me introduce our next focus.", p: 0.3, a: 0.2, d: 0.15 }
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
           u.p, u.a, u.d, 'tier3_iso24617', true, 1, 0.95, createdBy]
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
    await insertUtterances(acceptOfferUtterances, 'commissive.accept_offer', 'commissive.commit', 'relational_outcomes.build_rapport');
    await insertUtterances(declineOfferUtterances, 'commissive.decline_offer', 'commissive.commit', 'relational_outcomes.maintain_integrity');
    await insertUtterances(suggestUtterances, 'commissive.suggest', 'directive.suggest', 'cognitive_outcomes.present_alternative');
    await insertUtterances(promiseUtterances, 'commissive.promise', 'commissive.promise', 'relational_outcomes.build_rapport');
    await insertUtterances(signalMisunderstandingUtterances, 'repair.signal_misunderstanding', 'assertive.inform', 'cognitive_outcomes.clarify_confusion');
    await insertUtterances(completionUtterances, 'repair.completion', 'assertive.inform', 'cognitive_outcomes.increase_understanding');
    await insertUtterances(retractionUtterances, 'own_communication_management.retraction', 'assertive.correction_acceptance', 'relational_outcomes.maintain_integrity');
    await insertUtterances(errorSignalingUtterances, 'own_communication_management.error_signaling', 'assertive.correction_acceptance', 'relational_outcomes.maintain_integrity');
    await insertUtterances(openSessionUtterances, 'discourse_structuring.open_session', 'directive.invite_action', 'behavioral_outcomes.encourage_action');
    await insertUtterances(closeSessionUtterances, 'discourse_structuring.close_session', 'assertive.inform', 'relational_outcomes.maintain_presence');
    await insertUtterances(topicAnnouncementUtterances, 'discourse_structuring.topic_announcement', 'assertive.inform', 'cognitive_outcomes.set_expectation');
    
    await client.query('COMMIT');
    console.log('\n=== TIER 3 COMPLETE ===');
    console.log('Added: 3 parent dialogue functions (commissive, repair, discourse_structuring)');
    console.log('Added: 11 new dialogue functions');
    console.log('Added: 130 new utterances with outcome intent links');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding Tier 3 content:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

addTier3Content();
