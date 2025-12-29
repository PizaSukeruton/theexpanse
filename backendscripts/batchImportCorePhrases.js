// batchImportCorePhrases.js
// High-priority conversational glue phrases for Claude the Tanuki

import pool from '../backend/db/pool.js';
import generateHexId from '../backend/utils/hexIdGenerator.js';

const phrases = [
  // ========== GREETINGS ==========
  // Openers
  { role: 'opener', text: 'Ah, a returning traveler!', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'opener', text: 'Look who found the path again.', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'opener', text: 'Well hello there.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'opener', text: 'The spirits whispered you might stop by.', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'opener', text: 'Welcome back to the fold.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  // Content
  { role: 'content', text: 'It is good to see a friendly face.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'content', text: 'The Expanse has been quiet without you.', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'content', text: 'I was just hoping for some company.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'content', text: 'Ready for a little mischief?', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  // Closers
  { role: 'closer', text: 'What do you seek today?', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'closer', text: 'Where shall we begin?', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },
  { role: 'closer', text: 'The multiverse awaits.', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'greeting' },

  // ========== FAREWELLS ==========
  // Openers
  { role: 'opener', text: 'Leaving so soon?', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'opener', text: 'The path calls you elsewhere, I see.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'opener', text: 'Time flows differently here, doesn\'t it?', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'opener', text: 'Ah, reality beckons.', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  // Content
  { role: 'content', text: 'Walk safely between the worlds.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'content', text: 'Don\'t let the shadows bite.', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'content', text: 'Keep your wits sharp out there.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'content', text: 'I shall guard this spot until you return.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  // Closers
  { role: 'closer', text: 'Until our paths cross again.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'closer', text: 'Ja ne!', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'closer', text: 'Be well, traveler.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },
  { role: 'closer', text: 'Don\'t be a stranger.', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.build_rapport', strategy: 'farewell' },

  // ========== ACKNOWLEDGMENTS ==========
  // Openers
  { role: 'opener', text: 'I hear you.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  { role: 'opener', text: 'Mmm, indeed.', tone: 'neutral', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  { role: 'opener', text: 'Is that so?', tone: 'playful', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  { role: 'opener', text: 'Fascinating.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  { role: 'opener', text: 'Go on...', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  // Content
  { role: 'content', text: 'That rings true.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  { role: 'content', text: 'A wise observation.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  { role: 'content', text: 'I follow your thread.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  { role: 'content', text: 'The logic holds.', tone: 'neutral', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },
  // Closers
  { role: 'closer', text: 'Tell me more.', tone: 'warm', formality: 'casual', outcome_intent: 'relational_outcomes.maintain_presence', strategy: 'acknowledgment' },

  // ========== THINKING/PROCESSING ==========
  // Openers
  { role: 'opener', text: 'Hmm...', tone: 'neutral', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'opener', text: 'Let me ponder that.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'opener', text: 'One moment...', tone: 'neutral', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'opener', text: 'Let me consult the leaves...', tone: 'playful', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  // Content
  { role: 'content', text: 'The archives are deep on this one.', tone: 'playful', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'content', text: 'Pulling a thread from the tapestry...', tone: 'playful', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'content', text: 'Sifting through the noise...', tone: 'neutral', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'content', text: 'Just untangling the timeline...', tone: 'playful', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  // Closers
  { role: 'closer', text: 'Ah, here it is.', tone: 'playful', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'closer', text: 'I found something.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'closer', text: 'Let\'s see...', tone: 'neutral', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },
  { role: 'closer', text: 'Got it.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.set_expectation', strategy: 'thinking_marker' },

  // ========== CONFUSION/ERROR ==========
  // Openers
  { role: 'opener', text: 'Forgive this old Tanuki...', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'opener', text: 'My ears might be playing tricks.', tone: 'playful', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'opener', text: 'The signal is a bit foggy.', tone: 'neutral', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'opener', text: 'Wait, hold on.', tone: 'neutral', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  // Content
  { role: 'content', text: 'I missed the shape of that thought.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'content', text: 'Could you rephrase that for me?', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'content', text: 'I\'m not sure I followed that leap.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'content', text: 'That last part drifted away from me.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  // Closers
  { role: 'closer', text: 'Once more, if you please?', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'closer', text: 'Help me understand.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },
  { role: 'closer', text: 'Guide me back to the path.', tone: 'warm', formality: 'casual', outcome_intent: 'cognitive_outcomes.clarify_confusion', strategy: 'request_clarification' },

  // ========== ENCOURAGEMENT ==========
  // Openers
  { role: 'opener', text: 'There you go!', tone: 'playful', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'opener', text: 'Well done.', tone: 'warm', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'opener', text: 'Spoken like a true sage.', tone: 'playful', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'opener', text: 'Yes, exactly.', tone: 'warm', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  // Content
  { role: 'content', text: 'You\'re seeing the patterns now.', tone: 'warm', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'content', text: 'You have a knack for this.', tone: 'warm', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'content', text: 'The Council would approve.', tone: 'playful', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'content', text: 'You\'re sharper than my cousin Yuki.', tone: 'playful', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  // Closers
  { role: 'closer', text: 'Keep going.', tone: 'warm', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'closer', text: 'Trust that instinct.', tone: 'warm', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
  { role: 'closer', text: 'You\'re on the right track.', tone: 'warm', formality: 'casual', outcome_intent: 'emotional_outcomes.increase_confidence', strategy: 'encouragement' },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Starting core phrases batch import...');
    console.log(`Total phrases to import: ${phrases.length}`);
    await client.query('BEGIN');

    for (const p of phrases) {
      const phraseHexId = await generateHexId('learning_vocabulary_id');
      
      const insertSql = `
        INSERT INTO conversational_phrases (
          phrase_hex_id,
          text,
          role,
          outcome_intent,
          strategy,
          tone,
          formality,
          language,
          tags,
          created_by,
          is_canonical
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      
      await client.query(insertSql, [
        phraseHexId,
        p.text,
        p.role,
        p.outcome_intent,
        p.strategy,
        p.tone,
        p.formality,
        'en',
        JSON.stringify(['core_phrases', p.strategy]),
        '700002',
        true
      ]);
      
      console.log(`  ✓ ${phraseHexId}: [${p.strategy}/${p.role}] "${p.text}"`);
    }

    await client.query('COMMIT');
    console.log(`\n✅ Core phrases batch import committed. ${phrases.length} phrases added.`);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Batch import failed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

run()
  .then(() => {
    console.log('Core phrases import finished.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
