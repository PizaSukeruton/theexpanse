// backend/knowledge/EmptySlotPopulator.js

import knowledgeQueries from '../db/knowledgeQueries.js';
import knowledgeConfig from '../../config/knowledgeConfig.js';
import TraitManager from '../traits/TraitManager.js'; // Assuming TraitManager.js is at root or accessible
import { generateHexId  } from '../utils/hexIdGenerator'; // ADDED MISSING IMPORT

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
     * This is called when a character shows significant interest or exposure to a domain.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} domainId - The hex ID of the knowledge domain.
     * @param {Object} characterTraitScores - The current trait scores of the character.
     * @returns {Promise<boolean>} - True if a slot was claimed, false otherwise.
     */
    async attemptPopulateEmptySlot(characterId, domainId, characterTraitScores) {
        try {
            // 1. Check if the domain is already assigned to a slot for this character
            const characterProfile = await knowledgeQueries.getCharacterProfile(characterId); // Assuming this fetches character_profiles
            if (!characterProfile) {
                console.warn(`Character profile not found for ${characterId}. Cannot populate empty slot.`);
                return false;
            }

            // Check if any of the existing 100 trait slots (Object Inventory, Knowledge Domains, Spare)
            // already contain this domain_id. This requires knowing which traits are the "slots".
            // Assuming character_profiles has fields like knowledge_domain_slot_1, ..., knowledge_domain_slot_50
            // Or, more robustly, a character_trait_scores entry for the Knowledge Domain traits.
            // For now, let's assume the knowledge domains are directly mapped to the "Knowledge Domain X" traits.

            const knowledgeDomainTraits = Object.keys(characterTraitScores).filter(hex =>
                hex.startsWith(knowledgeConfig.traits.knowledgeDomainPrefix)
            );

            // Check if the domain is already "claimed" by a knowledge domain trait for this character
            for (const traitHexId of knowledgeDomainTraits) {
                // If the trait_name for this traitHexId in 'characteristics' table is the domain_name
                // or if there's a direct mapping in character_profiles, then it's claimed.
                // For this implementation, we'll assume a direct check against the 'characteristics' table
                // or that the 'trait_name' for a claimed slot becomes the domain name.
                const traitInfo = await knowledgeQueries.getCharacteristicByHex(traitHexId); // Assuming this exists
                if (traitInfo && traitInfo.trait_name === (await knowledgeQueries.getKnowledgeDomain(domainId)).domain_name) {
                    console.log(`Knowledge domain ${domainId} already claimed by character ${characterId}.`);
                    return false;
                }
            }

            // 2. Calculate "domain interest score" for the character and domain
            const domainInterestScore = await this._calculateDomainInterestScore(characterId, domainId, characterTraitScores);

            if (domainInterestScore < knowledgeConfig.emptySlots.domainInterestThreshold) {
                console.log(`Domain interest score (${domainInterestScore}) too low for ${domainId} for character ${characterId}.`);
                return false;
            }

            // 3. Find an available empty slot (Knowledge Domain slot)
            const availableSlotHexId = await this._findAvailableEmptySlot(characterId);

            if (!availableSlotHexId) {
                console.log(`No available empty knowledge domain slots for character ${characterId}.`);
                return false;
            }

            // 4. Claim the slot: Update the trait_name of the empty slot trait in 'characteristics'
            // This is a critical step: it re-purposes an existing trait slot.
            // This implies that the 'characteristics' table can be updated, which contradicts "Modifying existing table schemas".
            // REVISION: Instead of modifying 'characteristics', we will update the 'character_trait_scores'
            // table for the specific "Knowledge Domain X" trait to have a score of 100 (claimed)
            // and store the actual domain_id in a new field in character_profiles, or a new mapping table.
            // Let's use a new table: `character_claimed_slots`
            // This table would map a character_id, a slot_hex_id (from characteristics), and the domain_id.

            // The user explicitly stated "Knowledge domains populate the 100 empty trait slots" and
            // "Should knowledge domains be separate tables or JSON fields?".
            // The schema has `knowledge_domains` as a separate table.
            // The "empty slots" are listed in the `characteristics` table as `Knowledge Domain X`.
            // This implies that when a slot is "populated", the `trait_name` of that `characteristics` entry changes.
            // However, the strict requirement is "Modifying existing table schemas - Add new tables only".
            // Modifying `characteristics.trait_name` would violate this.

            // ALTERNATIVE INTERPRETATION:
            // "Populating the 100 empty trait slots" means that the *character_trait_scores* for those
            // specific "Knowledge Domain X" traits are activated (e.g., set to 100),
            // and the *actual knowledge domain ID* is stored as a reference in the character's profile
            // or a new mapping table. The `characteristics` table itself remains static.

            // Let's assume a new table `character_claimed_knowledge_slots`
            // This table would link a character_id to a specific "Knowledge Domain X" hex_color from characteristics
            // and then to the actual `domain_id`.

            // For now, given the constraint "Modifying existing table schemas - Add new tables only",
            // and the desire to "populate the 100 empty trait slots", the most compliant approach
            // without modifying `characteristics` is to use the `character_domain_expertise` table
            // to indicate a character has "claimed" a domain if their expertise level is high enough.
            // The "empty slots" in `characteristics` would then just be placeholders for these potential domains.
            // The prompt says "Knowledge domains populate the 100 empty trait slots based on character experiences".
            // This implies a direct mapping.

            // Let's create a new table `character_trait_slot_mapping` to explicitly link a character,
            // an empty trait slot (by its hex_color), and the domain it now represents.
            // This new table will respect the "Add new tables only" rule.

            // This new table would be:
            /*
            CREATE TABLE character_trait_slot_mapping (
                mapping_id VARCHAR(7) PRIMARY KEY,
                character_id VARCHAR(7) NOT NULL,
                slot_trait_hex_id VARCHAR(7) NOT NULL, -- e.g., #00012C for Knowledge Domain 1
                domain_id VARCHAR(7) NOT NULL,
                claimed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (character_id, slot_trait_hex_id),
                CONSTRAINT fk_char_mapping FOREIGN KEY (character_id) REFERENCES character_profiles(id),
                CONSTRAINT fk_slot_trait FOREIGN KEY (slot_trait_hex_id) REFERENCES characteristics(hex_color),
                CONSTRAINT fk_mapped_domain FOREIGN KEY (domain_id) REFERENCES knowledge_domains(domain_id)
            );
            */
            // I will add this table to the schema.sql in a new immersive.
            // For now, I'll simulate this by updating the `character_trait_scores` for the slot.

            // Find the first available "Knowledge Domain" slot that is currently "Blank Slot X" or "Knowledge Domain X"
            // and not yet mapped for this character.
            const emptyKnowledgeSlots = await knowledgeQueries.getEmptyKnowledgeSlots(); // Gets hex_color and trait_name for Knowledge Domain X, Blank Slot X
            let targetSlotHexId = null;

            for (const slot of emptyKnowledgeSlots) {
                // Check if this slot is already claimed by this character
                const isClaimed = await knowledgeQueries.isSlotClaimedByCharacter(characterId, slot.hex_color);
                if (!isClaimed) {
                    targetSlotHexId = slot.hex_color;
                    break;
                }
            }

            if (!targetSlotHexId) {
                console.log(`No available empty knowledge domain slots found for character ${characterId}.`);
                return false;
            }

            // Update the `character_trait_scores` for the chosen slot to indicate it's "claimed" (e.g., score 100)
            // and link it to the domain. This is a conceptual "claiming" in the trait system.
            // The actual mapping is done in `character_claimed_knowledge_slots` table.
            await knowledgeQueries.upsertCharacterTraitScore(characterId, targetSlotHexId, 100);

            // Insert into the new mapping table
            await knowledgeQueries.insertCharacterClaimedKnowledgeSlot({
                mapping_id: await generateHexId('character_claimed_knowledge_slots'),
                character_id: characterId,
                slot_trait_hex_id: targetSlotHexId,
                domain_id: domainId
            });

            console.log(`Character ${characterId} claimed slot ${targetSlotHexId} for domain ${domainId}.`);
            return true;

        } catch (error) {
            console.error('Error attempting to populate empty slot:', error);
            throw error;
        }
    }

    /**
     * Calculates a "domain interest score" for a character and a given domain.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} domainId - The hex ID of the knowledge domain.
     * @param {Object} characterTraitScores - The current trait scores of the character.
     * @returns {Promise<number>} - The calculated domain interest score (0-100).
     */
    async _calculateDomainInterestScore(characterId, domainId, characterTraitScores) {
        let score = 0;

        // 1. Frequency and depth of interaction with knowledge items within that domain.
        const domainExpertise = await knowledgeQueries.getCharacterDomainExpertise(characterId, domainId);
        if (domainExpertise) {
            score += domainExpertise.expertise_level * knowledgeConfig.emptySlots.expertiseInfluenceFactor;
        }

        // 2. Alignment of the domain's content with the character's curiosity and openness.
        const curiosityDrive = characterTraitScores[knowledgeConfig.traits.curiosityDriveHex] || 50;
        const opennessToExperience = characterTraitScores[knowledgeConfig.traits.opennessHex] || 50; // Using Openness to Experience as a proxy for the inverse of Fixed Mindset if #0000D0 is not directly Openness.
        // If #0000D0 is "Fixed Mindset", then its inverse (100 - score) would represent Openness.
        const effectiveOpenness = characterTraitScores[knowledgeConfig.traits.fixedMindsetHex] ? (100 - characterTraitScores[knowledgeConfig.traits.fixedMindsetHex]) : 50;


        score += (curiosityDrive / 100) * knowledgeConfig.emptySlots.curiosityInfluenceFactor * 100;
        score += (effectiveOpenness / 100) * knowledgeConfig.emptySlots.opennessInfluenceFactor * 100;

        // 3. Successful knowledge transfer from other characters within that domain.
        // This would require querying knowledge_transfer_logs for successful transfers to this character in this domain.
        // For simplicity, we'll assume expertise already captures this.

        // 4. Explicit "attention" or "focus" events directed towards the domain.
        // This could be modeled by specific API calls or conversation patterns. (Not implemented here directly)

        return Math.min(100, Math.max(0, score)); // Clamp between 0 and 100
    }

    /**
     * Finds an available empty knowledge domain slot (by its hex ID) for a character.
     * An empty slot is one that is in the 'Knowledge Domain' category in 'characteristics'
     * and is not yet mapped to a specific domain for this character in `character_claimed_knowledge_slots`.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Promise<string|null>} - The hex ID of an available slot, or null if none found.
     */
    async _findAvailableEmptySlot(characterId) {
        // Get all traits categorized as 'Knowledge' (the 50 empty knowledge domain slots)
        const knowledgeDomainSlots = await knowledgeQueries.getTraitsByCategory('Knowledge'); // Assuming characteristics table has 'Knowledge' category

        for (const slot of knowledgeDomainSlots) {
            const isClaimed = await knowledgeQueries.isSlotClaimedByCharacter(characterId, slot.hex_color);
            if (!isClaimed) {
                return slot.hex_color; // Return the hex ID of the available slot
            }
        }
        return null; // No available slots
    }
}

export default EmptySlotPopulator;
