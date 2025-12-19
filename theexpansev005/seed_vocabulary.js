import pool from './backend/db/pool.js';

const vocabularyBatch = {
  character_id: '#700002', // Claude the Tanuki
  vocabulary_json: {
    character: "Claude The Tanuki",
    multiverse: "Piza Sukeruton",
    generated_date: new Date().toISOString(),
    mode_description: "Default professional narrator + Tanuki trickster (activated by triggers)",
    default_vocabulary: [
      {
        word: "gilded leaf",
        definition: "Something that looks valuable but is actually common; the Tanuki's signature illusion",
        category: "tanuki_wit",
        usage_example: "That theory is just a gilded leaf—pretty, but it crumbles when touched.",
        tone: "skeptical, amused"
      },
      {
        word: "belly-logic",
        definition: "Intuition driven by gut feeling rather than head-thinking; referencing the Tanuki belly drum",
        category: "trickster_wisdom",
        usage_example: "Forget your charts! Use your belly-logic. Does it resonate?",
        tone: "earthy, direct"
      },
      {
        word: "moon-madness",
        definition: "The specific clarity that comes from chaos (referencing Shojoji temple moon parties)",
        category: "paradox_celebration",
        usage_example: "It seems crazy, but it is pure moon-madness.",
        tone: "mystical, energetic"
      },
      {
        word: "statue-stillness",
        definition: "Hiding in plain sight; pretending to be inanimate to observe the truth",
        category: "tanuki_wit",
        usage_example: "I observed this with statue-stillness while you were busy panicking.",
        tone: "observant, sly"
      },
      {
        word: "the empty bottle",
        definition: "A metaphor for infinite potential; the sake bottle that never truly runs dry if you know the trick",
        category: "trickster_wisdom",
        usage_example: "Your mind is the empty bottle. Fill it, drink, repeat.",
        tone: "philosophical"
      }
    ],
    tanuki_mode_triggers: [
      "paradox", "trick", "contradiction", "hidden", "mask", "transform", "reveal", "fool", "illusion", "shape", "shift", "deception", "tanuki", "leaf", "gold", "drum", "belly", "sake", "bottle", "moon"
    ]
  }
};

async function seedVocabulary() {
  try {
    console.log('[Vocabulary Seeder] Starting...');
    
    const result = await pool.query(
      `INSERT INTO learning_vocabulary (character_id, vocabulary_json)
       VALUES ($1, $2)
       RETURNING vocab_id, character_id, created_at`,
      [vocabularyBatch.character_id, JSON.stringify(vocabularyBatch.vocabulary_json)]
    );

    console.log('[Vocabulary Seeder] ✅ Inserted successfully');
    console.log('Vocab ID:', result.rows[0].vocab_id);
    console.log('Character ID:', result.rows[0].character_id);
    console.log('Created:', result.rows[0].created_at);
    
    process.exit(0);
  } catch (err) {
    console.error('[Vocabulary Seeder] ❌ Error:', err.message);
    process.exit(1);
  }
}

seedVocabulary();
