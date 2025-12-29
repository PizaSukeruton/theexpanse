import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';

const PHILOSOPHY_TRADITION = 'Wu-Tang';

const wisdomEntries = [
    // #81 - On Weaving vs. Telling
    {
        speaker: 'GZA',
        quoteText: 'It\'s not about telling the story — it\'s about weaving the tale.',
        sourceType: 'essay',
        sourceDetail: 'Medium/Cuepoint Essay (2015)',
        themes: ['craft', 'storytelling', 'artistry'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.7,
        originalBatchId: 81
    },
    // #82 - On Using Everything as a Vehicle
    {
        speaker: 'GZA',
        quoteText: 'I can write about anything and it will be interesting. You have to use everything as a vehicle.',
        sourceType: 'essay',
        sourceDetail: 'Medium/Cuepoint Essay (2015)',
        themes: ['craft', 'creativity', 'perspective'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 82
    },
    // #83 - On Sterile Imagination
    {
        speaker: 'GZA',
        quoteText: 'Most rappers\' imaginations are sterile. I can write about anything and it will be interesting.',
        sourceType: 'essay',
        sourceDetail: 'Medium/Cuepoint Essay (2015)',
        themes: ['creativity', 'imagination', 'craft'],
        padPleasure: 0.4,
        padArousal: 0.5,
        padDominance: 0.8,
        originalBatchId: 83
    },
    // #84 - On Economy of Language
    {
        speaker: 'GZA',
        quoteText: 'Work maximum damage in minimum time. Half short, twice strong.',
        sourceType: 'interview',
        sourceDetail: 'Chicago Sun-Times Interview (2016)',
        themes: ['craft', 'precision', 'economy'],
        padPleasure: 0.5,
        padArousal: 0.6,
        padDominance: 0.8,
        originalBatchId: 84
    },
    // #85 - On Word Choice
    {
        speaker: 'GZA',
        quoteText: 'I don\'t need to use four- and five-syllable words when one- and two-syllable words still tell a strong story.',
        sourceType: 'interview',
        sourceDetail: 'Chicago Sun-Times Interview (2016)',
        themes: ['craft', 'simplicity', 'clarity'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 85
    },
    // #86 - On Cosmic Connection
    {
        speaker: 'GZA',
        quoteText: 'Just the aspect of everything being connected — we\'re all made of stardust — is a beautiful thing. There\'s so much to pull from.',
        sourceType: 'interview',
        sourceDetail: 'Chicago Sun-Times Interview (2016)',
        themes: ['science', 'connection', 'wonder'],
        padPleasure: 0.8,
        padArousal: 0.4,
        padDominance: 0.4,
        originalBatchId: 86
    },
    // #87 - On Wu-Tang's Core Mission
    {
        speaker: 'GZA',
        quoteText: 'For us it was always about writing the most intellectual, wittiest rap. Always. Always.',
        sourceType: 'interview',
        sourceDetail: 'Chicago Sun-Times Interview (2016)',
        themes: ['craft', 'excellence', 'purpose'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 87
    },
    // #88 - On Long-Term Thinking
    {
        speaker: 'GZA',
        quoteText: 'It\'s always been about shelf life. Long-term parking, not short-term. That\'s why I take the time that I do when I write.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['craft', 'patience', 'legacy'],
        padPleasure: 0.5,
        padArousal: 0.2,
        padDominance: 0.7,
        originalBatchId: 88
    },
    // #89 - On Finding Inspiration
    {
        speaker: 'GZA',
        quoteText: 'I can find inspiration and inspiration can find me, almost anywhere. Lately, I\'m very inspired by science and nature. I find the earth and the universe fascinating – how everything is truly connected.',
        sourceType: 'interview',
        sourceDetail: 'Oxford Student Interview (2012)',
        themes: ['inspiration', 'science', 'connection'],
        padPleasure: 0.7,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 89
    },
    // #90 - On Martial Arts Themes
    {
        speaker: 'GZA',
        quoteText: 'When we were younger we were drawn to the incredible action. As we got older, we started to identify with certain common themes like loyalty, discipline and brotherhood.',
        sourceType: 'interview',
        sourceDetail: 'Oxford Student Interview (2012)',
        themes: ['martial-arts', 'loyalty', 'brotherhood'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 90
    },
    // #91 - On Being an Emcee
    {
        speaker: 'GZA',
        quoteText: 'When I was growing up, to be an emcee meant to write the most clever, intellectual, and wittiest rap. And that\'s what we did.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['craft', 'excellence', 'standards'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 91
    },
    // #92 - On Quality
    {
        speaker: 'GZA',
        quoteText: 'Rappers should sit down and construct quality lines.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['craft', 'discipline', 'quality'],
        padPleasure: 0.4,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 92
    },
    // #93 - On Scientific Questions
    {
        speaker: 'GZA',
        quoteText: 'Why is the sky blue? Why is the grass green? These are questions that require science to answer.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['science', 'curiosity', 'questioning'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 93
    },
    // #94 - On Mathematics
    {
        speaker: 'GZA',
        quoteText: 'I like science and mathematics. When I say mathematics, I don\'t mean algebra or math in that sense, but the mathematics of things.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['mathematics', 'understanding', 'patterns'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 94
    },
    // #95 - On Hip-Hop as Vehicle
    {
        speaker: 'GZA',
        quoteText: 'Hip-hop is my vehicle for scientific enlightenment.',
        sourceType: 'interview',
        sourceDetail: 'Quote.org',
        themes: ['hip-hop', 'science', 'purpose'],
        padPleasure: 0.6,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 95
    },
    // #96 - On Science and Attraction
    {
        speaker: 'GZA',
        quoteText: 'I don\'t think people have ever really been in touch with science. They\'re drawn to it, but they don\'t know why they\'re drawn to it.',
        sourceType: 'interview',
        sourceDetail: 'Wall Street Journal Interview (2012)',
        themes: ['science', 'curiosity', 'connection'],
        padPleasure: 0.5,
        padArousal: 0.3,
        padDominance: 0.5,
        originalBatchId: 96
    },
    // #97 - On Vegetarianism
    {
        speaker: 'GZA',
        quoteText: 'As far as being a vegetarian, it\'s a moral thing, a health thing, a conscious thing — a combination of all. I think it\'s better to be that way.',
        sourceType: 'interview',
        sourceDetail: 'Eater Interview (2010)',
        themes: ['consciousness', 'health', 'morality'],
        padPleasure: 0.5,
        padArousal: 0.2,
        padDominance: 0.5,
        originalBatchId: 97
    },
    // #98 - On Nature Connection
    {
        speaker: 'GZA',
        quoteText: 'I\'m always touching plants and vibing with them.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['nature', 'connection', 'presence'],
        padPleasure: 0.7,
        padArousal: 0.2,
        padDominance: 0.4,
        originalBatchId: 98
    },
    // #99 - On Thinking
    {
        speaker: 'GZA',
        quoteText: 'People say Wu-Tang makes you think too much. What\'s wrong with thinking?',
        sourceType: 'interview',
        sourceDetail: 'Quote.org',
        themes: ['thinking', 'challenge', 'purpose'],
        padPleasure: 0.5,
        padArousal: 0.5,
        padDominance: 0.7,
        originalBatchId: 99
    },
    // #100 - On Artist Responsibility
    {
        speaker: 'GZA',
        quoteText: 'That\'s one of the unique things about being an artist. That you have a voice that people hear and listen to, so it\'s important to say something that\'s important.',
        sourceType: 'interview',
        sourceDetail: 'StarTalk Interview with Neil deGrasse Tyson',
        themes: ['responsibility', 'voice', 'purpose'],
        padPleasure: 0.6,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 100
    },
    // #101 - On Chess Benefits
    {
        speaker: 'GZA',
        quoteText: 'Chess involves critical thinking, planning ahead, strategising – it\'s very helpful, on many different levels.',
        sourceType: 'interview',
        sourceDetail: 'Vice Interview (2024)',
        themes: ['chess', 'strategy', 'thinking'],
        padPleasure: 0.5,
        padArousal: 0.4,
        padDominance: 0.6,
        originalBatchId: 101
    },
    // #102 - On Gratitude and Persistence
    {
        speaker: 'GZA',
        quoteText: 'I\'m grateful for everything we have done throughout our careers and if there\'s nothing else to put out, then there\'s nothing to put out. I\'m constantly writing and working. It doesn\'t stop there.',
        sourceType: 'interview',
        sourceDetail: 'Rolling Stone Interview (2012)',
        themes: ['gratitude', 'persistence', 'craft'],
        padPleasure: 0.6,
        padArousal: 0.3,
        padDominance: 0.6,
        originalBatchId: 102
    },
    // #103 - On Brotherhood
    {
        speaker: 'GZA',
        quoteText: 'The dynamic is incredible between us. We\'re brothers and that will never change. Just like with any old and true friend, once we\'re reunited it\'s as if no time has elapsed.',
        sourceType: 'interview',
        sourceDetail: 'Oxford Student Interview (2012)',
        themes: ['brotherhood', 'loyalty', 'connection'],
        padPleasure: 0.8,
        padArousal: 0.4,
        padDominance: 0.5,
        originalBatchId: 103
    },
    // #104 - On Authenticity vs. Trends
    {
        speaker: 'GZA',
        quoteText: 'A lot of artists think that to be current, you have to follow what\'s out there and do something that\'s so unlike what you normally do. It can work, but it doesn\'t if you chase it.',
        sourceType: 'interview',
        sourceDetail: 'BrainyQuote',
        themes: ['authenticity', 'craft', 'integrity'],
        padPleasure: 0.4,
        padArousal: 0.3,
        padDominance: 0.7,
        originalBatchId: 104
    },
    // #105 - On the Cosmos
    {
        speaker: 'GZA',
        quoteText: 'It\'s just a beautiful story — planets, black holes, comets.',
        sourceType: 'media',
        sourceDetail: 'Rolling Stone Interview on Dark Matter',
        themes: ['science', 'wonder', 'cosmos'],
        padPleasure: 0.8,
        padArousal: 0.4,
        padDominance: 0.4,
        originalBatchId: 105
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
        console.log(`\n✅ Successfully imported ${insertedCount} Wu-Tang Wisdom entries (Batch 4: GZA IDs 81-105)`);
        
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
