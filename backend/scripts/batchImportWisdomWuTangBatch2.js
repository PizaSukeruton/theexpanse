import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const PHILOSOPHY_TRADITION = 'Wu-Tang';

const wisdomEntries = [
    // #31 - On Wicked Thoughts
    {
        speaker: 'RZA',
        quoteText: 'Your worst enemy can\'t harm you as much as your own wicked thoughts.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['self-knowledge', 'inner-enemy', 'mindfulness'],
        padPleasure: 0.2,
        padArousal: 0.3,
        padDominance: 0.4,
        originalBatchId: 31
    },
    // #32 - On Persistence
    {
        speaker: 'RZA',
        quoteText: 'The best tactic you can have in life: Never give up. Never let them count you out. That\'s how the greats play, right down to the last move.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['persistence', 'resilience', 'greatness'],
        padPleasure: 0.6,
        padArousal: 0.7,
        padDominance: 0.8,
        originalBatchId: 32
    },
    // #33 - On Teaching and Learning
    {
        speaker: 'RZA',
        quoteText: 'A real teacher is also a student, someone who never stops learning.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['teaching', 'learning', 'humility'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 33
    },
    // #34 - On Truth and Wisdom
    {
        speaker: 'RZA',
        quoteText: 'Truth is within us all, all the time—a seed waiting for light to help it grow. Wisdom is the light.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['truth', 'wisdom', 'growth'],
        padPleasure: 0.6,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 34
    },
    // #35 - On Getting Involved
    {
        speaker: 'RZA',
        quoteText: 'When we neglect others out of superficial wisdom, fake respect, phony knowledge—we tell ourselves it\'s their life; we say it\'s not our responsibility; we don\'t want to get involved. Get involved. Or we\'ll all feel the pain.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['community', 'responsibility', 'action'],
        padPleasure: 0.3,
        padArousal: 0.5,
        padDominance: 0.6,
        originalBatchId: 35
    },
    // #36 - On Manifestation
    {
        speaker: 'RZA',
        quoteText: 'All things manifest in due time. In order for thought to materialize into our three-dimensional world, it takes time. Be patient.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['patience', 'manifestation', 'time'],
        padPleasure: 0.5,
        padArousal: 0.1,
        padDominance: 0.4,
        originalBatchId: 36
    },
    // #37 - On Self-Recognition
    {
        speaker: 'RZA',
        quoteText: 'When a man recognizes himself, he recognizes his true jewel, and his body expresses that wisdom.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['self-knowledge', 'authenticity', 'expression'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 37
    },
    // #38 - On Finding Your Island
    {
        speaker: 'RZA',
        quoteText: 'Find an island in this life. Find a place where this culture can\'t take energy away from you, sap your will and originality.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['sanctuary', 'energy', 'originality'],
        padPleasure: 0.5,
        padArousal: 0.2,
        padDominance: 0.7,
        originalBatchId: 38
    },
    // #39 - On True Consciousness
    {
        speaker: 'RZA',
        quoteText: 'The true master is consciousness—not simply being awake—I\'m talking about the consciousness that never sleeps. The part of you that is aware of your consciousness.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['consciousness', 'awareness', 'mastery'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.7,
        originalBatchId: 39
    },
    // #40 - On Ch'an Buddhism
    {
        speaker: 'RZA',
        quoteText: 'You can break Ch\'an Buddhism down to three basic ideas. One is that every person has an inherent Buddha nature inside—anyone can become enlightened. Two, there\'s no one single path to enlightenment. Three, it\'s almost impossible to reach enlightenment solely through the exchange of words.',
        sourceType: 'book',
        sourceDetail: 'The Wu-Tang Manual (2005)',
        themes: ['spirituality', 'enlightenment', 'buddhism'],
        padPleasure: 0.5,
        padArousal: 0.2,
        padDominance: 0.5,
        originalBatchId: 40
    },
    // #41 - On Deliberation
    {
        speaker: 'RZA',
        quoteText: 'A man thinks seven times before he speaks.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['deliberation', 'wisdom', 'speech'],
        padPleasure: 0.4,
        padArousal: 0.1,
        padDominance: 0.6,
        originalBatchId: 41
    },
    // #42 - On Knowing Your Nature
    {
        speaker: 'RZA',
        quoteText: 'If you don\'t know yourself, you don\'t know your nature. If you don\'t know your nature, you don\'t know where to exist. By knowing your nature, knowing yourself, you know what to be and how to live.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['self-knowledge', 'nature', 'purpose'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 42
    },
    // #43 - On Trusting Chaos
    {
        speaker: 'RZA',
        quoteText: 'Trust chaos and confusion—not judging it, not fearing it, not reaching for an immediate solution. That\'s a secret to life.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['chaos', 'trust', 'patience'],
        padPleasure: 0.4,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 43
    },
    // #44 - On Peace
    {
        speaker: 'RZA',
        quoteText: 'Peace—it\'s the absence of confusion. Peace—it\'s the prevention of conflict. Peace—it establishes both parties on a ground of mutual respect.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['peace', 'respect', 'harmony'],
        padPleasure: 0.7,
        padArousal: -0.2,
        padDominance: 0.5,
        originalBatchId: 44
    },
    // #45 - On Disguised Blessings
    {
        speaker: 'RZA',
        quoteText: 'Your allies can arrive as enemies, blessings as a curse.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['perception', 'wisdom', 'discernment'],
        padPleasure: 0.3,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 45
    },
    // #46 - On Readiness to See
    {
        speaker: 'RZA',
        quoteText: 'Some things are invisible until you are truly ready to see them.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['perception', 'readiness', 'growth'],
        padPleasure: 0.5,
        padArousal: 0.2,
        padDominance: 0.4,
        originalBatchId: 46
    },
    // #47 - On Staying the Path
    {
        speaker: 'RZA',
        quoteText: 'When you enter the path of wisdom, of knowledge, of life—don\'t turn off that road.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['persistence', 'path', 'commitment'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.7,
        originalBatchId: 47
    },
    // #48 - On Knowledge as Fire
    {
        speaker: 'RZA',
        quoteText: 'Knowledge is like fire \'cause it breaks down things so you can see what they truly are.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['knowledge', 'truth', 'clarity'],
        padPleasure: 0.5,
        padArousal: 0.5,
        padDominance: 0.6,
        originalBatchId: 48
    },
    // #49 - On Body and Mind
    {
        speaker: 'RZA',
        quoteText: 'The body is a vehicle for the mind, and that vehicle is how you travel through space.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['body', 'mind', 'journey'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 49
    },
    // #50 - On Knowledge and Wisdom (Divine Mathematics)
    {
        speaker: 'RZA',
        quoteText: 'In the Divine mathematics, knowledge is 1: the foundation of all things. Wisdom is 2: the manifestation of knowledge. It is knowledge in action.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['knowledge', 'wisdom', 'mathematics'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 50
    },
    // #51 - On Wisdom as Word
    {
        speaker: 'RZA',
        quoteText: 'Wisdom is the word. It is the way to make knowledge known.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['wisdom', 'communication', 'expression'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 51
    },
    // #52 - On Digital Culture
    {
        speaker: 'RZA',
        quoteText: 'In a way, when TV went digital, we lost a foothold in reality. Now, we\'ll never truly know if what we\'re watching is real or has been altered. Digital culture brought a step away from truth.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['truth', 'digital', 'reality'],
        padPleasure: 0.2,
        padArousal: 0.3,
        padDominance: 0.4,
        originalBatchId: 52
    },
    // #53 - On Fearlessness
    {
        speaker: 'RZA',
        quoteText: 'Enlightened men do not fear.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['fear', 'courage', 'enlightenment'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.8,
        originalBatchId: 53
    },
    // #54 - On Playing to the Last Move
    {
        speaker: 'RZA',
        quoteText: 'You should live your life as a game with mortal stakes. A game you play right down to the last move.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['chess', 'life', 'persistence'],
        padPleasure: 0.5,
        padArousal: 0.6,
        padDominance: 0.7,
        originalBatchId: 54
    },
    // #55 - The Twelve Jewels
    {
        speaker: 'RZA',
        quoteText: 'The 12 jewels: knowledge, wisdom, understanding, freedom, justice, equality, food, clothing, shelter, love, peace, and happiness.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['spirituality', 'values', 'foundation'],
        padPleasure: 0.7,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 55
    }
];

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        let insertedCount = 0;
        
        for (const entry of wisdomEntries) {
            const wisdomId = await generateHexId('wisdom_reference_id');
            
            const sql = `
                INSERT INTO wisdom_references (
                    wisdom_id,
                    speaker,
                    quote_text,
                    source_type,
                    source_detail,
                    philosophy_tradition,
                    themes,
                    pad_pleasure,
                    pad_arousal,
                    pad_dominance,
                    original_batch_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            
            await client.query(sql, [
                wisdomId,
                entry.speaker,
                entry.quoteText,
                entry.sourceType,
                entry.sourceDetail,
                PHILOSOPHY_TRADITION,
                entry.themes,
                entry.padPleasure,
                entry.padArousal,
                entry.padDominance,
                entry.originalBatchId
            ]);
            
            insertedCount++;
            console.log(`Inserted wisdom #${entry.originalBatchId}: ${wisdomId}`);
        }
        
        await client.query('COMMIT');
        console.log(`\n✅ Successfully imported ${insertedCount} Wu-Tang Wisdom entries (Batch 2: IDs 31-55)`);
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error importing wisdom:', err.message);
        throw err;
    } finally {
        client.release();
        pool.end();
    }
}

run();
