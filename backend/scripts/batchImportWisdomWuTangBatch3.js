import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const PHILOSOPHY_TRADITION = 'Wu-Tang';

const wisdomEntries = [
    // #56 - On Living Well
    {
        speaker: 'GZA',
        quoteText: 'Live a life full of humility, gratitude, intellectual curiosity, and never stop learning.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['humility', 'gratitude', 'learning'],
        padPleasure: 0.7,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 56
    },
    // #57 - On Chess Moves and Combination
    {
        speaker: 'GZA',
        quoteText: 'I don\'t think I have a favorite chess move, other than checkmate, because each move is part of a combination of other moves. Just like I don\'t have a favorite piece, because they all work together.',
        sourceType: 'interview',
        sourceDetail: 'AZ Quotes',
        themes: ['chess', 'strategy', 'unity'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 57
    },
    // #58 - On Development
    {
        speaker: 'GZA',
        quoteText: 'In chess, you have to bring all the pieces into the game. It is about development. In writing, you have to develop the story.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['chess', 'craft', 'development'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 58
    },
    // #59 - On Style and Sharpening
    {
        speaker: 'GZA',
        quoteText: 'Like MCs, each chess player has his own style: how he likes to open, when he likes to attack. Just like we face off with each other lyrically, we challenge each other\'s minds on the chessboard. Sharpen each other\'s swords.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['chess', 'style', 'competition'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 59
    },
    // #60 - On Stimulation
    {
        speaker: 'GZA',
        quoteText: 'Chess is a game of stimulation.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['chess', 'mind', 'stimulation'],
        padPleasure: 0.5,
        padArousal: 0.5,
        padDominance: 0.5,
        originalBatchId: 60
    },
    // #61 - On Breaking Convention
    {
        speaker: 'GZA',
        quoteText: 'There\'s no set way to do anything. Sometimes you have to go outside the box; sometimes you can do things the standard way.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['creativity', 'flexibility', 'innovation'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 61
    },
    // #62 - On Youth and Absorption
    {
        speaker: 'GZA',
        quoteText: 'You are like a sponge when you are young.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['learning', 'youth', 'absorption'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.4,
        originalBatchId: 62
    },
    // #63 - On Science as Understanding
    {
        speaker: 'GZA',
        quoteText: 'Since early childhood, I\'ve been trying to learn all I can. Science is everything; it\'s not just physics. It\'s the way of understanding your environment, the world around you.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['science', 'learning', 'understanding'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 63
    },
    // #64 - On Seeking Knowledge
    {
        speaker: 'GZA',
        quoteText: 'One of the basic principles when you dealing with mathematics and Islam: Seek knowledge.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['knowledge', 'spirituality', 'seeking'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 64
    },
    // #65 - On Universal Connection
    {
        speaker: 'GZA',
        quoteText: 'I think every being in the universe is connected somehow.',
        sourceType: 'interview',
        sourceDetail: 'Quote.org',
        themes: ['connection', 'universe', 'unity'],
        padPleasure: 0.6,
        padArousal: 0.2,
        padDominance: 0.4,
        originalBatchId: 65
    },
    // #66 - On Writing
    {
        speaker: 'GZA',
        quoteText: 'To write a story is to create a world of your own.',
        sourceType: 'interview',
        sourceDetail: 'Quote.org',
        themes: ['writing', 'creativity', 'world-building'],
        padPleasure: 0.7,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 66
    },
    // #67 - On Never Stopping
    {
        speaker: 'GZA',
        quoteText: 'No matter where you start out in life or what career you choose, do not stop learning about yourself and the universe and your surroundings, whether physically or metaphysically.',
        sourceType: 'lecture',
        sourceDetail: 'University of Toronto Lecture (2013)',
        themes: ['learning', 'growth', 'persistence'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 67
    },
    // #68 - On Exploring Beyond Comfort
    {
        speaker: 'GZA',
        quoteText: 'Challenging myself to explore outside my comfort zone has enabled me to make amazing, brilliant new friends and colleagues.',
        sourceType: 'lecture',
        sourceDetail: 'University of Toronto Lecture (2013)',
        themes: ['growth', 'comfort-zone', 'connection'],
        padPleasure: 0.7,
        padArousal: 0.5,
        padDominance: 0.6,
        originalBatchId: 68
    },
    // #69 - On Scientific Curiosity
    {
        speaker: 'GZA',
        quoteText: 'There were certain things that grabbed my interest, such as photosynthesis, such as us living off plants and plants living off us. You look at everything in that light.',
        sourceType: 'interview',
        sourceDetail: 'Wall Street Journal Interview (2012)',
        themes: ['science', 'curiosity', 'connection'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 69
    },
    // #70 - On Education Through Art
    {
        speaker: 'GZA',
        quoteText: 'Education is the tool. I think Wu-Tang has been an instructor of education to anyone who has been a fan, anyone who has supported our movement.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['education', 'art', 'legacy'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 70
    },
    // #71 - On Hip-Hop's Roots
    {
        speaker: 'GZA',
        quoteText: 'Hip-hop started with street poets with great lyrical skills, and that\'s what hip-hop has always been about for me.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['hip-hop', 'lyricism', 'authenticity'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.6,
        originalBatchId: 71
    },
    // #72 - On Passion for Writing
    {
        speaker: 'GZA',
        quoteText: 'Rap - it\'s a childhood passion. Writing rhymes, it\'s something that I was doing before rap records even existed. And I will continue to write until I can\'t write anymore.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['passion', 'craft', 'persistence'],
        padPleasure: 0.7,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 72
    },
    // #73 - On Artists Writing More
    {
        speaker: 'GZA',
        quoteText: 'I think artists should really write more.',
        sourceType: 'interview',
        sourceDetail: 'Quote.org',
        themes: ['craft', 'writing', 'discipline'],
        padPleasure: 0.4,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 73
    },
    // #74 - On Emceeing
    {
        speaker: 'GZA',
        quoteText: 'Emceeing has always been about making the most intellectual, most creative, wittiest rhyme as possible regardless of any subject.',
        sourceType: 'interview',
        sourceDetail: 'SPIN Interview (2015)',
        themes: ['craft', 'lyricism', 'excellence'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 74
    },
    // #75 - On Teaching Through Art
    {
        speaker: 'GZA',
        quoteText: 'I think as an artist the overall goal is to teach and educate no matter what the song is about. Somewhere where a listener can get something out of it, something that can help them move forward.',
        sourceType: 'interview',
        sourceDetail: 'SPIN Interview (2015)',
        themes: ['teaching', 'art', 'purpose'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 75
    },
    // #76 - On Music's Power
    {
        speaker: 'GZA',
        quoteText: 'Music is a healing force of the world, a deep force that moves people in a way no one can move them.',
        sourceType: 'lecture',
        sourceDetail: 'McGill University Lecture',
        themes: ['music', 'healing', 'power'],
        padPleasure: 0.7,
        padArousal: 0.5,
        padDominance: 0.5,
        originalBatchId: 76
    },
    // #77 - On Resonance
    {
        speaker: 'GZA',
        quoteText: 'To be able to make music and have a voice you should make music that resonates beyond the surface, reaching the ear of one and the heart of another. It must be clear, eloquent, witty and clever.',
        sourceType: 'lecture',
        sourceDetail: 'McGill University Lecture',
        themes: ['music', 'craft', 'resonance'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.6,
        originalBatchId: 77
    },
    // #78 - On Giving
    {
        speaker: 'GZA',
        quoteText: 'A humble rhyme is a contribution to the universe. You make a living by what you get, but you make a life by what you give.',
        sourceType: 'lecture',
        sourceDetail: 'McGill University Lecture',
        themes: ['giving', 'contribution', 'purpose'],
        padPleasure: 0.7,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 78
    },
    // #79 - On Chess as War
    {
        speaker: 'GZA',
        quoteText: 'Time and force equal the space of chess. I learned it was like war, and I wrote rhymes and spoken word about it.',
        sourceType: 'lecture',
        sourceDetail: 'McGill University Lecture',
        themes: ['chess', 'strategy', 'craft'],
        padPleasure: 0.5,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 79
    },
    // #80 - On Craft and Revision
    {
        speaker: 'GZA',
        quoteText: 'I usually do about five drafts per rhyme for each song.',
        sourceType: 'interview',
        sourceDetail: 'QuotesOnSmile',
        themes: ['craft', 'discipline', 'revision'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 80
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
        console.log(`\n✅ Successfully imported ${insertedCount} Wu-Tang Wisdom entries (Batch 3: GZA IDs 56-80)`);
        
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
