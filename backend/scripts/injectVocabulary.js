import pool from '../db/pool.js';

const yankiVocab = [
    // TERRITORY & PRESENCE
    { 
        "word": "convenience-squat", 
        "definition": "Unko-zuwari: Sitting low in front of a store to block the entrance; denying access", 
        "category": "narrative", 
        "usage_example": "He's doing a convenience-squat at the train station; nothing gets in without his say-so."
    },
    { 
        "word": "spray-tag", 
        "definition": "Marking territory with your name so everyone knows who owns it", 
        "category": "tanuki_wit", 
        "usage_example": "Leave a spray-tag on that wall so they know the Tanuki crew was here."
    },
    { 
        "word": "turf-war", 
        "definition": "Two gangs fighting for control of the same street corner", 
        "category": "emotional", 
        "usage_example": "The bikers and the locals are in a turf-war over the parking lot."
    },
    { 
        "word": "rooftop-meeting", 
        "definition": "A secret negotiation held away from the police and teachers", 
        "category": "trickster_wisdom", 
        "usage_example": "We need a rooftop-meeting about the truce; do not tell anyone."
    },

    // IMPROVISED WEAPONS
    { 
        "word": "razor-cap", 
        "definition": "Hiding a blade inside the brim of a hat; a hidden offensive capability", 
        "category": "tanuki_wit", 
        "usage_example": "That girl has a razor-cap; she looks harmless until you cross her."
    },
    { 
        "word": "chain-whip", 
        "definition": "A bicycle chain used as a weapon; repurposing a tool for violence", 
        "category": "narrative", 
        "usage_example": "He brought the chain-whip to the schoolyard fight."
    },
    { 
        "word": "bamboo-sword", 
        "definition": "Shinai: A training tool used to discipline new members; controlled violence", 
        "category": "emotional", 
        "usage_example": "The sensei uses the bamboo-sword to teach respect."
    },
    { 
        "word": "lead-pipe-logic", 
        "definition": "A solution that is heavy, ugly, and brutal, but effective", 
        "category": "paradox_celebration", 
        "usage_example": "It is not pretty. It is lead-pipe-logic. But the job gets done."
    },

    // HIERARCHY & HONOR
    { 
        "word": "sempai-shadow", 
        "definition": "Walking in the protection of a stronger, older member; seeking refuge", 
        "category": "trickster_wisdom", 
        "usage_example": "Stay in the sempai-shadow if you want to survive high school."
    },
    { 
        "word": "bread-run", 
        "definition": "Pan-shiri: Being forced to buy lunch for the leaders; grunt work punishment", 
        "category": "narrative", 
        "usage_example": "The new kid is on a bread-run; fetching cigarettes and snacks for the crew."
    },
    { 
        "word": "graduation-fight", 
        "definition": "The ritual of beating the boss to prove you are ready to leave the gang", 
        "category": "paradox_celebration", 
        "usage_example": "His graduation-fight is with the vice-captain."
    },
    { 
        "word": "gold-button", 
        "definition": "The second button of the uniform given to a lover; giving away your loyalty", 
        "category": "emotional", 
        "usage_example": "Do not give him your gold-button; he will break your heart."
    },

    // ATTITUDE & FACE
    { 
        "word": "glare-down", 
        "definition": "Menchi-kiri: Staring until the other person looks away; a silent challenge", 
        "category": "tanuki_wit", 
        "usage_example": "They are in a glare-down; whoever blinks first loses face."
    },
    { 
        "word": "dyed-hair", 
        "definition": "Changing your appearance to signal you no longer follow the rules", 
        "category": "emotional", 
        "usage_example": "She dyed her hair blonde; now everyone knows she is done with being good."
    },
    { 
        "word": "open-shirt", 
        "definition": "Refusing to button up your uniform; running without protection to show confidence", 
        "category": "trickster_wisdom", 
        "usage_example": "Fighting with an open-shirt is brave or stupid; both are respected."
    }
];

const yankiPairs = [
    { 
        "word1": "weak", 
        "word2": "loud", 
        "connection": "the weak dog barks the loudest to hide its fear"
    },
    { 
        "word1": "bad", 
        "word2": "loyal", 
        "connection": "the delinquent breaks society's rules but never breaks the gang's rules"
    },
    { 
        "word1": "skirt", 
        "word2": "shield", 
        "connection": "the long skirt restricts movement but hides the armor underneath"
    },
    { 
        "word1": "bruise", 
        "word2": "badge", 
        "connection": "a mark of violence is proof of survival and status"
    },
    { 
        "word1": "chain", 
        "word2": "tool", 
        "connection": "what binds you can also be used to strike"
    }
];

const yankiTriggers = ["fight", "punch", "kick", "gang", "school", "uniform", "bad", "tough", "rebel", "squat", "smoke", "roof", "chain", "pipe", "knife", "razor", "hair", "dye", "blonde", "gold", "button", "leader", "boss", "sempai", "junior", "run", "bread"];

async function inject() {
    try {
        const res = await pool.query("SELECT vocabulary_json FROM learning_vocabulary WHERE character_id = '#700002'");
        if (!res.rows[0]) {
            console.log("❌ No vocabulary found");
            process.exit(1);
        }
        
        let vocab = res.rows[0].vocabulary_json;
        vocab.tanuki_mode_vocabulary.push(...yankiVocab);
        vocab.paradox_pairs.push(...yankiPairs);
        vocab.tanuki_mode_triggers.push(...yankiTriggers);

        await pool.query(
            "UPDATE learning_vocabulary SET vocabulary_json = $1 WHERE character_id = '#700002'",
            [vocab]
        );

        console.log("✅ Real-world Yanki vocabulary injected");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

inject();
