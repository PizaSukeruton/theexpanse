import pool from '../db/pool.js';

const HEX_RANGES = {
    character_id: { start: 0x700000, end: 0x70FFFF },
    user_id: { start: 0xD00000, end: 0xD0FFFF },
    multiverse_event_id: { start: 0xC90000, end: 0xC9FFFF },
    aok_entry: { start: 0x600000, end: 0x6003E7 },
    aok_category: { start: 0x601000, end: 0x601063 },
    aok_review: { start: 0x602000, end: 0x6027FF },
    aok_search: { start: 0x603000, end: 0x6037FF },
    
    mapping_id: { start: 0xAA0000, end: 0xAA9FFF },
    relationship_id: { start: 0xAB0000, end: 0xAB9FFF },
    requirement_id: { start: 0xAC0000, end: 0xAC9FFF },
    transfer_id: { start: 0xAD0000, end: 0xAD9FFF },
    domain_id: { start: 0xAE0000, end: 0xAE9FFF },
    knowledge_item_id: { start: 0xAF0000, end: 0xAF9FFF },
    
    tse_evaluation_record_id: { start: 0x800000, end: 0x80FFFF },
    belt_progression_id: { start: 0xBB0000, end: 0xBBFFFF },
    conversation_id: { start: 0x900000, end: 0x9FFFFF },
    
    narrative_segment_id: { start: 0xC00000, end: 0xC0FFFF },
    narrative_path_id: { start: 0xC10000, end: 0xC1FFFF },
    multimedia_asset_id: { start: 0xC20000, end: 0xC2FFFF },
    location_id: { start: 0xC30000, end: 0xC3FFFF },
    
    tse_coding_teacher: { start: 0xC40000, end: 0xC4FFFF },
    tse_coding_attempt: { start: 0xC50000, end: 0xC5FFFF },
    tse_coding_evaluation: { start: 0xC60000, end: 0xC6FFFF },
    tse_coding_progress: { start: 0xC70000, end: 0xC7FFFF },
    tse_coding_challenge: { start: 0xC80000, end: 0xC8FFFF },
    
    story_arc_id: { start: 0x301000, end: 0x301FFF },
    terminal_log_id: { start: 0xE00000, end: 0xE0FFFF }
};

async function generateHexId(idType) {
    if (!HEX_RANGES[idType]) {
        throw new Error(`Invalid ID type: ${idType}. Must be one of: ${Object.keys(HEX_RANGES).join(', ')}`);
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const selectQuery = 'SELECT current_value FROM hex_id_counters WHERE id_type = $1 FOR UPDATE';
        const result = await client.query(selectQuery, [idType]);
        
        let currentCounterValue;
        let newHexId;
        
        if (result.rows.length === 0) {
            currentCounterValue = HEX_RANGES[idType].start;
            newHexId = `#${currentCounterValue.toString(16).toUpperCase().padStart(6, '0')}`;
            
            const insertQuery = `
                INSERT INTO hex_id_counters (id_type, last_used_id, current_value)
                VALUES ($1, $2, $3)
            `;
            await client.query(insertQuery, [idType, newHexId, currentCounterValue]);
        } else {
            currentCounterValue = parseInt(result.rows[0].current_value, 10) + 1;
            
            if (currentCounterValue > HEX_RANGES[idType].end) {
                await client.query('ROLLBACK');
                throw new Error(`Hex ID range for ${idType} exhausted. Max: #${HEX_RANGES[idType].end.toString(16).toUpperCase().padStart(6, '0')}`);
            }
            
            newHexId = `#${currentCounterValue.toString(16).toUpperCase().padStart(6, '0')}`;
            
            const updateQuery = `
                UPDATE hex_id_counters
                SET last_used_id = $1, current_value = $2
                WHERE id_type = $3
            `;
            await client.query(updateQuery, [newHexId, currentCounterValue, idType]);
        }
        
        await client.query('COMMIT');
        return newHexId;
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error generating hex ID for type ${idType}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
}

export default generateHexId;

export function isValidHexId(hexId) {
    return /^#[0-9A-Fa-f]{6}$/.test(hexId);
}

export function getIdType(hexId) {
    if (!isValidHexId(hexId)) return null;
    
    const num = parseInt(hexId.slice(1), 16);
    
    for (const [type, range] of Object.entries(HEX_RANGES)) {
        if (num >= range.start && num <= range.end) {
            return type;
        }
    }
    
    return 'unknown';
}
