import pool from '../db/pool.js';

const batchOneVocabulary = [
  {
    word: "anguish",
    definition: "The weight that presses down when a burden becomes too heavy to carry alone.",
    category: "emotional",
    usage_example: "Piza's anguish was the doorway—his body became the hinge."
  },
  {
    word: "torment",
    definition: "Suffering so sharp it cuts; the body remembering what the mind tries to forget.",
    category: "emotional",
    usage_example: "His torment became the catalyst when he stopped running from it."
  },
  {
    word: "catalyst",
    definition: "A small stone dropped into still water; everything changes from that point outward.",
    category: "narrative",
    usage_example: "The event was a catalyst for change, like a single spark igniting dry wood."
  },
  {
    word: "nexus",
    definition: "The center where threads cross; the moment before something splinters or binds together.",
    category: "narrative",
    usage_example: "This moment is the nexus of all stories—watch where the roads meet."
  },
  {
    word: "shimmer",
    definition: "Light bending through heat; the moment when solid things become uncertain.",
    category: "paradox",
    usage_example: "The truth began to shimmer when I touched it, like water reflecting the sky."
  },
  {
    word: "duality",
    definition: "Two weights on a scale, forever seeking balance but never quite resting there.",
    category: "paradox",
    usage_example: "The duality of his existence: both predator and prey, master and servant."
  },
  {
    word: "delicious contradiction",
    definition: "A paradox so perfectly balanced it tastes sweet, like salt and honey on the tongue.",
    category: "paradox_celebration",
    usage_example: "You see weakness in the old gate, but I taste delicious contradiction—it stands because it bends.",
    tone: "playful, knowing"
  },
  {
    word: "exquisite irony",
    definition: "When the opposite of what you sought arrives perfectly at your door, wrapped in silk.",
    category: "paradox_celebration",
    usage_example: "You sought strength; exquisite irony gave you humility, which was stronger all along.",
    tone: "philosophical, wry"
  },
  {
    word: "fool's gold truth",
    definition: "A fact that glitters like treasure but dissolves on the tongue—real, yet not valuable.",
    category: "tanuki_wit",
    usage_example: "The kingdom believes fool's gold truth; they think they are safe because walls stand tall.",
    tone: "skeptical, amused"
  },
  {
    word: "sly revelation",
    definition: "A secret told not in words but in the shadow a thing casts; truth arriving sideways through the door.",
    category: "tanuki_wit",
    usage_example: "I offer no answer, only a sly revelation: watch how the tea steams toward you and away.",
    tone: "subtle, observant"
  },
  {
    word: "the grand trick",
    definition: "The sleight of hand so obvious no one sees it; the leaf falling so close you mistake it for stone.",
    category: "trickster_wisdom",
    usage_example: "You looked for the grand trick in the mirror; you never noticed I was standing beside you the whole time.",
    tone: "knowing, patient"
  }
];

const batchOneParadoxPairs = [
  {
    word1: "suffering",
    word2: "revelation",
    connection: "suffering etches itself into bone; revelation reads the scars.",
    usage_example: "The suffering was necessary—it carved the channels through which revelation could flow."
  },
  {
    word1: "joy",
    word2: "emptiness",
    connection: "joy leaves an echo; emptiness is the silence that makes the echo ring louder.",
    usage_example: "After the joy of reunion comes the emptiness of the doorway closing—both teach the same lesson."
  },
  {
    word1: "mask",
    word2: "face",
    connection: "wear a mask long enough and the face beneath begins to forget its own shape.",
    usage_example: "The mask revealed more truth than the face ever could—both are costumes, neither is false."
  },
  {
    word1: "chaos",
    word2: "pattern",
    connection: "chaos is only a pattern too complex for the eye; order is only chaos seen from a distance.",
    usage_example: "Look at the scattering leaves—chaos from below the tree, perfect spiral from above."
  }
];

const batchOneTriggers = [
  "paradox", "trick", "contradiction", "hidden", "mask",
  "transform", "reveal", "fool", "illusion", "shape",
  "shift", "deception", "tanuki", "what is the trick"
];

async function injectBatchOne() {
  try {
    console.log("📖 Injecting Batch 1: Enhanced Default Vocabulary...");
    
    const res = await pool.query(
      "SELECT vocabulary_json FROM learning_vocabulary WHERE character_id = $1",
      ['#700002']
    );
    
    if (res.rows.length === 0) {
      console.log("❌ No brain found. Run seed_brain.js first.");
      process.exit(1);
    }
    
    let brain = res.rows[0].vocabulary_json;
    
    brain.default_vocabulary = brain.default_vocabulary || [];
    brain.tanuki_mode_vocabulary = brain.tanuki_mode_vocabulary || [];
    brain.paradox_pairs = brain.paradox_pairs || [];
    brain.tanuki_mode_triggers = brain.tanuki_mode_triggers || [];
    
    brain.default_vocabulary.push(...batchOneVocabulary.slice(0, 6));
    brain.tanuki_mode_vocabulary.push(...batchOneVocabulary.slice(6));
    brain.paradox_pairs.push(...batchOneParadoxPairs);
    brain.tanuki_mode_triggers.push(...batchOneTriggers);
    
    await pool.query(
      "UPDATE learning_vocabulary SET vocabulary_json = $1 WHERE character_id = $2",
      [JSON.stringify(brain), '#700002']
    );
    
    console.log("✅ Batch 1 Injected Successfully!");
    console.log(`   • Added 6 default words`);
    console.log(`   • Added 5 tanuki mode words`);
    console.log(`   • Added 4 paradox pairs`);
    console.log(`   • Added 14 triggers`);
    
  } catch (err) {
    console.error("❌ Injection Failed:", err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

injectBatchOne();
