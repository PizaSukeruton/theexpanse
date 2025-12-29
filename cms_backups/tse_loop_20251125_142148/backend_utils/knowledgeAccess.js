// backend/utils/knowledgeAccess.js
import pool from '../db/pool.js';

// Re-export validation from hexIdGenerator
export { isValidHexId } from './hexIdGenerator.js';

export async function getCharacterProfile(characterId) {
    const result = await pool.query(
        'SELECT * FROM character_profiles WHERE character_id = $1',
        [characterId]
    );
    return result.rows[0] || null;
}

export async function getCharacterKnowledgeSlotMappings(characterId) {
    const result = await pool.query(
        'SELECT * FROM character_knowledge_slot_mappings WHERE character_id = $1',
        [characterId]
    );
    return result.rows;
}

export async function getDomainDetails(domainId) {
    const result = await pool.query(
        'SELECT * FROM knowledge_domains WHERE domain_id = $1',
        [domainId]
    );
    return result.rows[0] || null;
}

export async function getCharacterAccessibleKnowledge(characterId, domainId) {
    // First verify character exists
    const character = await getCharacterProfile(characterId);
    if (!character) {
        throw new Error(`Character ${characterId} not found`);
    }
    
    // Get mapping for this domain
    const mappingResult = await pool.query(
        `SELECT * FROM character_knowledge_slot_mappings 
         WHERE character_id = $1 AND domain_id = $2`,
        [characterId, domainId]
    );
    
    if (mappingResult.rows.length === 0) {
        throw new Error(`Character ${characterId} not mapped to domain ${domainId}`);
    }
    
    const mapping = mappingResult.rows[0];
    
    // Get knowledge items in this domain
    const itemsResult = await pool.query(
        `SELECT * FROM knowledge_items 
         WHERE domain_id = $1 
         ORDER BY created_at DESC`,
        [domainId]
    );
    
    return {
        character_id: characterId,
        domain_id: domainId,
        access_percentage: mapping.access_percentage,
        slot_trait_hex_id: mapping.slot_trait_hex_id,
        knowledge_items: itemsResult.rows
    };
}

export async function assignCharacterToKnowledgeDomain(characterId, slotTraitHexId, domainId) {
    // Verify character exists
    const character = await getCharacterProfile(characterId);
    if (!character) {
        throw new Error(`Character ${characterId} not found`);
    }
    
    // Insert new mapping
    const result = await pool.query(
        `INSERT INTO character_knowledge_slot_mappings 
         (character_id, slot_trait_hex_id, domain_id, access_percentage, is_active)
         VALUES ($1, $2, $3, 100, true)
         RETURNING *`,
        [characterId, slotTraitHexId, domainId]
    );
    
    return result.rows[0];
}


const knowledgeAccess = {
    getCharacterProfile,
    getCharacterKnowledgeSlotMappings,
    getDomainDetails,
    getCharacterAccessibleKnowledge,
    assignCharacterToKnowledgeDomain
};

export default knowledgeAccess;
