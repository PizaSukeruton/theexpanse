import pool from './backend/db/pgPool.js';
import generateHexId from './backend/utils/hexIdGenerator.js';

async function createCouncilTerminal() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // The Council Terminal character
        const TERMINAL_ID = '#C0FF1C';  // "COFFIC" - Council Office Terminal
        const TERMINAL_NAME = 'Council Terminal CTI-1985';
        
        // Check if exists
        const existing = await client.query(
            'SELECT character_id FROM character_profiles WHERE character_id = $1',
            [TERMINAL_ID]
        );
        
        if (existing.rows.length === 0) {
            console.log('Creating Council Terminal character...');
            
            // Insert character profile
            await client.query(`
                INSERT INTO character_profiles (
                    character_id, 
                    character_name, 
                    category, 
                    description,
                    trait_generation_enabled
                ) VALUES ($1, $2, $3, $4, $5)
            `, [
                TERMINAL_ID,
                TERMINAL_NAME,
                'Machines',  // New machine character!
                'A sentient 1985 mainframe computer interface. Phosphor green display, 300 baud modem sounds. Primary interface to the Council of the Wise. Glitches when discussing The Expanse. Running since before the Cheese Wars began.',
                true
            ]);
            
            console.log('✓ Created Council Terminal character');
            
            // Add core cognitive/technical traits
            const terminalTraits = [
                { hex: '#00001E', score: 95 },  // Working Memory - excellent
                { hex: '#00001F', score: 98 },  // Long-term Memory - near perfect
                { hex: '#000026', score: 92 },  // Memory Retrieval - excellent
                { hex: '#000032', score: 88 },  // Logical Reasoning - very good
                { hex: '#00003B', score: 94 },  // Systems Thinking - excellent
                { hex: '#000044', score: 90 },  // Evidence Evaluation - very good
                { hex: '#000046', score: 85 },  // Processing Speed - good
                { hex: '#0000AF', score: 99 },  // Consistency - near perfect
                { hex: '#000108', score: 96 },  // Data Analysis - excellent
                { hex: '#000109', score: 93 },  // Technical Skills - excellent
                { hex: '#00010A', score: 97 },  // Digital Literacy - excellent
                
                // Some quirky emotional traits for personality
                { hex: '#00000A', score: 45 },  // Self-Awareness - moderate (it's a computer)
                { hex: '#00001A', score: 20 },  // Uncertainty Tolerance - low (needs data!)
                { hex: '#000018', score: 75 },  // Future Anxiety - high (worried about Y2K still)
            ];
            
            for (const trait of terminalTraits) {
                await client.query(
                    `INSERT INTO character_trait_scores (character_hex_id, trait_hex_color, percentile_score) 
                     VALUES ($1, $2, $3)
                     ON CONFLICT (character_hex_id, trait_hex_color) 
                     DO UPDATE SET percentile_score = $3`,
                    [TERMINAL_ID, trait.hex, trait.score]
                );
            }
            
            console.log('✓ Added personality traits');
            
            // Now populate Knowledge Domain slots with character knowledge
            // Using slots #00012C through #000135 for the 6 main characters + system knowledge
            const characterKnowledge = [
                { 
                    slot: '#00012C', 
                    domain: 'Piza Sukeruton Archives',
                    mastery: 75,  // Good but not complete knowledge
                    description: 'Skeleton traveler, pizza enthusiast, dimensional wanderer'
                },
                {
                    slot: '#00012D',
                    domain: 'Pineaple Yurei Intelligence',
                    mastery: 45,  // Limited, corrupted data
                    description: 'WARNING: Data partially corrupted. Angry entity. Cheese theft confirmed.'
                },
                {
                    slot: '#00012E',
                    domain: 'Claude The Tanuki Files',
                    mastery: 80,  // Good knowledge of the guide
                    description: 'Mischievous guide, narrator, shapeshifter tendencies documented'
                },
                {
                    slot: '#00012F',
                    domain: 'Frankie Trouble Dossier',
                    mastery: 95,  // Excellent - Council member
                    description: 'Council member, Wu-Tang Clan enthusiast, best friend designation'
                },
                {
                    slot: '#000130',
                    domain: 'Slicifer Case File',
                    mastery: 60,  // Moderate knowledge
                    description: 'First cheese soul victim, angry pizza slice entity'
                },
                {
                    slot: '#000131',
                    domain: 'Chuckles Incident Report',
                    mastery: 70,  // Decent knowledge
                    description: 'B-Roll chaos entity, rollerskating primate, TV show termination'
                },
                {
                    slot: '#000132',
                    domain: 'Cheese Wars Historical Data',
                    mastery: 85,  // Good historical records
                    description: 'Comprehensive timeline of cheese vanquishing events'
                },
                {
                    slot: '#000133',
                    domain: 'The Expanse [CLASSIFIED]',
                    mastery: 25,  // Very limited, causes glitches
                    description: 'ERROR: Data causes system instability. White void detected.'
                },
                {
                    slot: '#000134',
                    domain: 'Council Protocols',
                    mastery: 100,  // Perfect knowledge
                    description: 'Complete operational procedures for Council of the Wise'
                },
                {
                    slot: '#000135',
                    domain: '1985 System Operations',
                    mastery: 100,  // It knows itself perfectly
                    description: 'DOS 3.0, BASIC, BBS systems, 300 baud modem protocols'
                }
            ];
            
            // Insert knowledge domains as trait scores
            for (const knowledge of characterKnowledge) {
                await client.query(
                    `INSERT INTO character_trait_scores (character_hex_id, trait_hex_color, percentile_score)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (character_hex_id, trait_hex_color)
                     DO UPDATE SET percentile_score = $3`,
                    [TERMINAL_ID, knowledge.slot, knowledge.mastery]
                );
                console.log(`✓ Added knowledge: ${knowledge.domain} (${knowledge.mastery}% mastery)`);
            }
            
        } else {
            console.log('Council Terminal already exists, updating knowledge...');
            
            // Update existing terminal's knowledge if needed
            const updateKnowledge = [
                { slot: '#00012C', mastery: 75 },  // Piza
                { slot: '#00012D', mastery: 45 },  // Pineaple Yurei
                { slot: '#00012E', mastery: 80 },  // Claude
                { slot: '#00012F', mastery: 95 },  // Frankie
                { slot: '#000130', mastery: 60 },  // Slicifer
                { slot: '#000131', mastery: 70 },  // Chuckles
            ];
            
            for (const k of updateKnowledge) {
                await client.query(
                    `INSERT INTO character_trait_scores (character_hex_id, trait_hex_color, percentile_score)
                     VALUES ($1, $2, $3)
                     ON CONFLICT (character_hex_id, trait_hex_color)
                     DO UPDATE SET percentile_score = $3`,
                    [TERMINAL_ID, k.slot, k.mastery]
                );
            }
            console.log('✓ Updated Terminal knowledge domains');
        }
        
        await client.query('COMMIT');
        
        // Display the Terminal's current state
        console.log('\n=== Council Terminal Status ===');
        const profile = await client.query(
            'SELECT * FROM character_profiles WHERE character_id = $1',
            [TERMINAL_ID]
        );
        console.log('Profile:', profile.rows[0]);
        
        console.log('\n=== Terminal Knowledge Domains ===');
        const knowledge = await client.query(`
            SELECT 
                cts.trait_hex_color as slot,
                cts.percentile_score as mastery,
                c.trait_name
            FROM character_trait_scores cts
            JOIN characteristics c ON c.hex_color = cts.trait_hex_color
            WHERE cts.character_hex_id = $1
            AND cts.trait_hex_color BETWEEN '#00012C' AND '#000135'
            ORDER BY cts.trait_hex_color
        `, [TERMINAL_ID]);
        
        knowledge.rows.forEach(k => {
            const domains = {
                '#00012C': 'Piza Sukeruton Archives',
                '#00012D': 'Pineaple Yurei Intelligence',
                '#00012E': 'Claude The Tanuki Files',
                '#00012F': 'Frankie Trouble Dossier',
                '#000130': 'Slicifer Case File',
                '#000131': 'Chuckles Incident Report',
                '#000132': 'Cheese Wars Historical Data',
                '#000133': 'The Expanse [CLASSIFIED]',
                '#000134': 'Council Protocols',
                '#000135': '1985 System Operations'
            };
            const domainName = domains[k.slot] || k.trait_name;
            console.log(`  ${k.slot}: ${domainName} - ${k.mastery}% mastery`);
        });
        
        console.log('\n✓ Council Terminal is ready to interface with users!');
        console.log('  Access point: CTI-1985');
        console.log('  Status: ONLINE');
        console.log('  Joy levels: MONITORING...');
        
        process.exit(0);
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating Council Terminal:', error);
        process.exit(1);
    } finally {
        client.release();
    }
}

createCouncilTerminal();
