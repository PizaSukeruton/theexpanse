// backend/knowledge/EmptySlotPopulator.js

import knowledgeQueries from '../db/knowledgeQueries.js';
import TraitManager from '../traits/TraitManager.js';
import generateHexId from '../utils/hexIdGenerator.js';

/**
 * @module EmptySlotPopulator
 * @description Manages the dynamic assignment of knowledge domains to empty trait slots
 * based on character experiences and trait-driven interests.
 */
class EmptySlotPopulator {
    constructor() {
        this.traitManager = TraitManager;
    }

    /**
     * Attempts to populate an empty knowledge domain slot for a character.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} domainId - The hex ID of the knowledge domain.
     * @param {Object} characterTraitScores - The current trait scores of the character.
     * @returns {Promise<boolean>} - True if a slot was claimed, false otherwise.
     */
    async attemptPopulateEmptySlot(characterId, domainId, characterTraitScores) {
        try {
            // 1. Check if the domain is already claimed by this character
            const alreadyClaimed = await knowledgeQueries.isSlotClaimedByCharacter(characterId, domainId);
            if (alreadyClaimed) {
                console.log(`Character ${characterId} already has a slot for domain ${domainId}`);
                return false;
            }

            // 2. Calculate domain interest score
            const domainInterestScore = await this._calculateDomainInterestScore(
                characterId, 
                domainId, 
                characterTraitScores
            );

            // 3. Get threshold from system settings
            const threshold = parseFloat(
                await knowledgeQueries.getSystemSetting('empty_slot_domain_interest_threshold') || 60
            );

            if (domainInterestScore < threshold) {
                console.log(`Domain interest score (${domainInterestScore.toFixed(2)}) too low for ${domainId} (threshold: ${threshold})`);
                return false;
            }

            // 4. Find an available empty slot
            const availableSlot = await this._findAvailableEmptySlot(characterId);
            if (!availableSlot) {
                console.log(`No available empty knowledge domain slots for character ${characterId}`);
                return false;
            }

            // 5. Claim the slot in both tables
            const claimMappingId = await generateHexId('character_claimed_knowledge_slots');
            await knowledgeQueries.insertCharacterClaimedKnowledgeSlot({
                mapping_id: claimMappingId,
                character_id: characterId,
                slot_trait_hex_id: availableSlot,
                domain_id: domainId
            });

            const slotMappingId = await generateHexId('character_knowledge_slot_mappings');
            await knowledgeQueries.insertCharacterKnowledgeSlotMapping({
                mapping_id: slotMappingId,
                character_id: characterId,
                slot_trait_hex_id: availableSlot,
                domain_id: domainId,
                access_percentage: 100
            });

            // 6. Update trait score to mark slot as claimed
            await knowledgeQueries.upsertCharacterTraitScore(characterId, availableSlot, 100);

            console.log(`✅ Character ${characterId} claimed slot ${availableSlot} for domain ${domainId} (score: ${domainInterestScore.toFixed(2)})`);
            return true;

        } catch (error) {
            console.error('Error attempting to populate empty slot:', error);
            throw error;
        }
    }

    /**
     * Calculates a domain interest score for a character and domain.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} domainId - The hex ID of the knowledge domain.
     * @param {Object} characterTraitScores - The current trait scores (hex_id: percentile_score).
     * @returns {Promise<number>} - The calculated domain interest score (0-100).
     */
    async _calculateDomainInterestScore(characterId, domainId, characterTraitScores) {
        let score = 0;

        // Load influence factors from system settings (as percentages 0-100)
        const expertiseFactor = parseFloat(
            await knowledgeQueries.getSystemSetting('empty_slot_expertise_influence_factor') || 50
        ) / 100;
        
        const curiosityFactor = parseFloat(
            await knowledgeQueries.getSystemSetting('empty_slot_curiosity_influence_factor') || 30
        ) / 100;
        
        const opennessFactor = parseFloat(
            await knowledgeQueries.getSystemSetting('empty_slot_openness_influence_factor') || 20
        ) / 100;

        // 1. Domain expertise contribution
        const domainExpertise = await knowledgeQueries.getCharacterDomainExpertise(characterId, domainId);
        if (domainExpertise && domainExpertise.expertise_level) {
            score += domainExpertise.expertise_level * expertiseFactor;
        }

        // 2. Curiosity Drive contribution (trait #00002D)
        const curiosityDrive = characterTraitScores['#00002D'] || 50;
        score += curiosityDrive * curiosityFactor;

        // 3. Openness contribution (using Growth Mindset #0000CF, inverse of Fixed Mindset #0000D0)
        const growthMindset = characterTraitScores['#0000CF'] || 50;
        const fixedMindset = characterTraitScores['#0000D0'] || 50;
        const effectiveOpenness = (growthMindset + (100 - fixedMindset)) / 2;
        score += effectiveOpenness * opennessFactor;

        return Math.min(100, Math.max(0, score));
    }

    /**
     * Finds an available empty knowledge domain slot for a character.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Promise<string|null>} - The hex ID of an available slot, or null if none found.
     */
    async _findAvailableEmptySlot(characterId) {
        const knowledgeDomainSlots = await knowledgeQueries.getTraitsByCategory('Knowledge');

        for (const slot of knowledgeDomainSlots) {
            const isClaimed = await knowledgeQueries.isSlotClaimedByCharacter(characterId, slot.hex_color);
            if (!isClaimed) {
                return slot.hex_color;
            }
        }
        return null;
    }
}

export default EmptySlotPopulator;
