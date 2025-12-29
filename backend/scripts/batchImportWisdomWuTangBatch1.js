import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const PHILOSOPHY_TRADITION = 'Wu-Tang';

const wisdomEntries = [
    // #1 - ODB Grammy Declaration
    {
        speaker: 'Ol\' Dirty Bastard',
        quoteText: 'Wu-Tang is for the children. We teach the children.',
        sourceType: 'public_statement',
        sourceDetail: '1998 Grammy Awards',
        themes: ['community', 'legacy', 'teaching'],
        padPleasure: 0.6,
        padArousal: 0.7,
        padDominance: 0.8,
        originalBatchId: 1
    },
    // #2 - On Confusion as Guidance
    {
        speaker: 'RZA',
        quoteText: 'Confusion is a gift from God. Those times when you feel most desperate for a solution, sit. Wait. The information will become clear. The confusion is there to guide you. Seek detachment and become the producer of your life.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['patience', 'clarity', 'self-mastery'],
        padPleasure: 0.3,
        padArousal: -0.2,
        padDominance: 0.5,
        originalBatchId: 2
    },
    // #3 - On Defeat and Wisdom
    {
        speaker: 'RZA',
        quoteText: 'If you live through defeat, you are not defeated. If you are beaten but acquire wisdom, you have won. Lose yourself to improve yourself. Only when we shed all self-definition do we find who we really are.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009), p.89',
        themes: ['resilience', 'wisdom', 'self-knowledge'],
        padPleasure: 0.4,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 3
    },
    // #4 - On Self-Sourced Happiness
    {
        speaker: 'RZA',
        quoteText: 'Happiness is something you get from yourself. If you\'re completely satisfied with yourself, nobody can take it away from you.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['happiness', 'self-knowledge', 'independence'],
        padPleasure: 0.7,
        padArousal: 0.2,
        padDominance: 0.7,
        originalBatchId: 4
    },
    // #5 - On True Living
    {
        speaker: 'RZA',
        quoteText: 'Life comes when you have knowledge, wisdom, and understanding, when you can see for real, touch, and feel for real, know for real. Then you are truly living.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['wisdom', 'knowledge', 'consciousness'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 5
    },
    // #6 - On Being Your Own Producer
    {
        speaker: 'RZA',
        quoteText: 'Seek detachment and become the producer of your life.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009), p.77',
        themes: ['self-mastery', 'detachment', 'agency'],
        padPleasure: 0.4,
        padArousal: 0.3,
        padDominance: 0.8,
        originalBatchId: 6
    },
    // #7 - On Knowledge of Self
    {
        speaker: 'RZA',
        quoteText: 'The knowledge of self is the most important thing, because how are you going to know God if you don\'t know yourself? How are you going to know anything if you don\'t know yourself?',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['self-knowledge', 'spirituality', 'foundation'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 7
    },
    // #8 - On Learning from History
    {
        speaker: 'RZA',
        quoteText: 'Experience is the best teacher. But in our day and time, what we need is wisdom, because wisdom overcomes experience — that\'s the experience that\'s already lived by others. I\'m not trying to repeat the histories. I already learned from what they did.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['wisdom', 'learning', 'history'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 8
    },
    // #9 - On Foundation Building
    {
        speaker: 'RZA',
        quoteText: 'Do the knowledge, meaning: look, listen, observe, and also respect. If you do that, you\'ll have a strong foundation to build anything you want to do in life upon. Know before you do. Look before you leap.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['foundation', 'observation', 'patience'],
        padPleasure: 0.4,
        padArousal: 0.2,
        padDominance: 0.5,
        originalBatchId: 9
    },
    // #10 - On Creation vs. Destruction
    {
        speaker: 'RZA',
        quoteText: 'It\'s harder to make the glass than break the glass.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009), p.22',
        themes: ['creation', 'effort', 'value'],
        padPleasure: 0.3,
        padArousal: 0.2,
        padDominance: 0.5,
        originalBatchId: 10
    },
    // #11 - On Love and Wisdom
    {
        speaker: 'RZA',
        quoteText: 'Love, like wisdom, dissolves you and then resolves you. It breaks down your ego and puts you back together again properly.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['love', 'wisdom', 'transformation'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.3,
        originalBatchId: 11
    },
    // #12 - On Timing
    {
        speaker: 'RZA',
        quoteText: '\'Truth out of season bears no fruit.\' To me, that means two things. One: There\'s a time and place for every kind of knowledge to flourish. Two: The personal characteristics of great messengers are usually irrelevant.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['timing', 'truth', 'wisdom'],
        padPleasure: 0.4,
        padArousal: 0.2,
        padDominance: 0.5,
        originalBatchId: 12
    },
    // #13 - On Mental Birth
    {
        speaker: 'RZA',
        quoteText: 'Just as you must come through a woman\'s womb to attain physical birth, so must you come through Wisdom to achieve mental birth. And like childbirth, Wisdom often comes with pain.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['wisdom', 'growth', 'pain'],
        padPleasure: 0.3,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 13
    },
    // #14 - On Heaven
    {
        speaker: 'RZA',
        quoteText: 'Don\'t wait till you die to go to heaven.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['presence', 'spirituality', 'action'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 14
    },
    // #15 - The Solar System Metaphor
    {
        speaker: 'RZA',
        quoteText: 'I strive to be like the sun sitting in the middle of the solar system with all the planets spinning around it — millions of things going on. It\'s just sitting there being the sun, but exerting gravitational effect on everything. I think man should look at himself that way.',
        sourceType: 'book',
        sourceDetail: 'The Tao of Wu (2009)',
        themes: ['centeredness', 'influence', 'self-mastery'],
        padPleasure: 0.5,
        padArousal: 0.1,
        padDominance: 0.8,
        originalBatchId: 15
    },
    // #16-21 - Cultural Mantras
    {
        speaker: 'Wu-Tang Clan',
        quoteText: 'C.R.E.A.M. - Cash Rules Everything Around Me',
        sourceType: 'mantra',
        sourceDetail: 'Enter the Wu-Tang (36 Chambers), 1993',
        themes: ['economics', 'survival', 'reality'],
        padPleasure: 0.2,
        padArousal: 0.6,
        padDominance: 0.7,
        originalBatchId: 16
    },
    {
        speaker: 'Wu-Tang Clan',
        quoteText: 'Protect Ya Neck',
        sourceType: 'mantra',
        sourceDetail: 'Enter the Wu-Tang (36 Chambers), 1993',
        themes: ['self-preservation', 'vigilance', 'survival'],
        padPleasure: 0.3,
        padArousal: 0.7,
        padDominance: 0.8,
        originalBatchId: 17
    },
    {
        speaker: 'Wu-Tang Clan',
        quoteText: 'Wu-Tang Forever',
        sourceType: 'mantra',
        sourceDetail: 'Second Studio Album, 1997',
        themes: ['legacy', 'permanence', 'unity'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 18
    },
    {
        speaker: 'Wu-Tang Clan',
        quoteText: 'Enter the Wu-Tang (36 Chambers)',
        sourceType: 'mantra',
        sourceDetail: 'Debut Album, 1993',
        themes: ['initiation', 'martial-arts', 'spirituality'],
        padPleasure: 0.5,
        padArousal: 0.6,
        padDominance: 0.7,
        originalBatchId: 19
    },
    {
        speaker: 'GZA',
        quoteText: 'Liquid Swords',
        sourceType: 'mantra',
        sourceDetail: 'GZA Solo Album, 1995',
        themes: ['precision', 'lyricism', 'martial-arts'],
        padPleasure: 0.4,
        padArousal: 0.5,
        padDominance: 0.8,
        originalBatchId: 20
    },
    {
        speaker: 'Raekwon',
        quoteText: 'Only Built 4 Cuban Linx',
        sourceType: 'mantra',
        sourceDetail: 'Raekwon Solo Album, 1995',
        themes: ['exclusivity', 'craftsmanship', 'legacy'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.7,
        originalBatchId: 21
    },
    // #22-30 - Interview Quotes
    {
        speaker: 'Ghostface Killah',
        quoteText: 'Things change. Nothing ever stays the same, yo. You ain\'t never gonna stay 25 or 30 or 40. You always gonna change. Every day you change.',
        sourceType: 'interview',
        sourceDetail: 'AZ Quotes',
        themes: ['change', 'impermanence', 'growth'],
        padPleasure: 0.4,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 22
    },
    {
        speaker: 'RZA',
        quoteText: 'I think most of my approach to life has been like that — to find order in chaos, to be in the middle of a bunch of things happening at the same time, but find focus.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['focus', 'chaos', 'order'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.7,
        originalBatchId: 23
    },
    {
        speaker: 'RZA',
        quoteText: 'Through great input you get great output.',
        sourceType: 'interview',
        sourceDetail: 'Interview',
        themes: ['effort', 'quality', 'process'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 24
    },
    {
        speaker: 'RZA',
        quoteText: 'Art — the beautiful thing about art, from my standpoint, is that it has no discrimination.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['art', 'equality', 'universality'],
        padPleasure: 0.7,
        padArousal: 0.3,
        padDominance: 0.4,
        originalBatchId: 25
    },
    {
        speaker: 'RZA',
        quoteText: 'Every defeat is a lesson, and every victory is a celebration.',
        sourceType: 'interview',
        sourceDetail: 'Interview',
        themes: ['resilience', 'learning', 'balance'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 26
    },
    {
        speaker: 'RZA',
        quoteText: 'Success is not about how high you climb, but how many people you bring with you.',
        sourceType: 'interview',
        sourceDetail: 'Interview',
        themes: ['success', 'community', 'leadership'],
        padPleasure: 0.7,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 27
    },
    {
        speaker: 'RZA',
        quoteText: 'We told you Wu-Tang was forever, and some people forgot that. It\'s not some fad.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['legacy', 'permanence', 'authenticity'],
        padPleasure: 0.5,
        padArousal: 0.5,
        padDominance: 0.8,
        originalBatchId: 28
    },
    {
        speaker: 'Raekwon',
        quoteText: 'In order to be one of the greats, you\'ve got to study the greats.',
        sourceType: 'interview',
        sourceDetail: 'Interview',
        themes: ['mastery', 'learning', 'greatness'],
        padPleasure: 0.5,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 29
    },
    {
        speaker: 'Ghostface Killah',
        quoteText: 'When you love what you do, more than likely everything is gonna just come out decent.',
        sourceType: 'interview',
        sourceDetail: 'Interview',
        themes: ['passion', 'craft', 'authenticity'],
        padPleasure: 0.7,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 30
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
        console.log(`\n✅ Successfully imported ${insertedCount} Wu-Tang Wisdom entries (Batch 1)`);
        
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
