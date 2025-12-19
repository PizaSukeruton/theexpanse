// Simplified test version - works with actual database structure
import pool from '../db/pool.js';
import { EventEmitter } from 'events';

class CharacterEngine extends EventEmitter {
    constructor(characterId) {
        super();
        this.characterId = characterId;
        this.traits = new Map();
        this.inventory = new Map();
        this.knowledge = new Map();
        this.blankSlots = new Map();
        this.isLoaded = false;
        this.metadata = {};
    }

    async loadCharacter() {
        const client = await pool.connect();
        try {
            // Load character metadata
            const characterQuery = `
                SELECT character_id, character_name, description, category
                FROM character_profiles
                WHERE character_id = $1
            `;
            
            const characterResult = await client.query(characterQuery, [this.characterId]);
            
            if (characterResult.rows.length === 0) {
                throw new Error(`Character ${this.characterId} not found`);
            }
            
            this.metadata = characterResult.rows[0];

            // Load ALL 370 slots from character_trait_scores
            const slotsQuery = `
                SELECT 
                    cts.trait_hex_color as slot_hex,
                    cts.percentile_score,
                    c.trait_name,
                    c.category
                FROM character_trait_scores cts
                INNER JOIN characteristics c ON cts.trait_hex_color = c.hex_color
                WHERE cts.character_hex_id = $1
            `;
            
            const slotsResult = await client.query(slotsQuery, [this.characterId]);
            
            // Categorize slots
            for (const slot of slotsResult.rows) {
                const slotData = {
                    hex: slot.slot_hex,
                    name: slot.trait_name,
                    score: parseFloat(slot.percentile_score) || 0,
                    category: slot.category
                };

                switch(slot.category) {
                    case 'Inventory':
                        this.inventory.set(slotData.hex, slotData);
                        break;
                    case 'Knowledge':
                        this.knowledge.set(slotData.hex, slotData);
                        break;
                    case 'Blank Slot':
                        this.blankSlots.set(slotData.hex, slotData);
                        break;
                    default:
                        this.traits.set(slotData.hex, slotData);
                }
            }
            
            this.isLoaded = true;
            
            console.log(`✅ [CharacterEngine] ${this.metadata.character_name} (${this.characterId}) loaded successfully`);
            console.log(`   - ${this.traits.size} traits, ${this.inventory.size} inventory, ${this.knowledge.size} knowledge, ${this.blankSlots.size} blank slots`);
            
            return {
                characterId: this.characterId,
                metadata: this.metadata,
                slotCounts: {
                    traits: this.traits.size,
                    inventory: this.inventory.size,
                    knowledge: this.knowledge.size,
                    blank: this.blankSlots.size
                }
            };

        } catch (error) {
            console.error('[CharacterEngine] Error:', error);
            throw error;
        } finally {
            client.release();
        }
    }
    
    async cleanup() {
        this.traits.clear();
        this.inventory.clear();
        this.knowledge.clear();
        this.blankSlots.clear();
        this.isLoaded = false;
    }
}

export default CharacterEngine;
