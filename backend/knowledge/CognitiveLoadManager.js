// backend/knowledge/CognitiveLoadManager.js

import knowledgeConfig from '../../config/knowledgeConfig.js';
import knowledgeQueries from '../db/knowledgeQueries.js';
import TraitManager from '../traits/TraitManager.js'; // Assuming TraitManager.js is at root or accessible

/**
 * @module CognitiveLoadManager
 * @description Simulates working memory constraints and cognitive load management.
 * Tracks active chunks, temporal decay, interference, and calculates cognitive load factor.
 */
class CognitiveLoadManager {
    constructor() {
        this.activeWorkingMemory = new Map(); // Stores { characterId: { knowledgeId: { contentHash, lastAccessedTimestamp } } }
        this.traitManager = TraitManager;
        this.decayInterval = knowledgeConfig.cognitiveLoad.temporalDecayIntervalMs; // 15-30 seconds
        this.cleanupInterval = setInterval(() => this.cleanupWorkingMemory(), this.decayInterval);
    }

    /**
     * Adds a knowledge chunk to a character's simulated working memory.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} knowledgeId - The hex ID of the knowledge chunk.
     * @param {string} content - The content of the knowledge chunk (for hashing).
     * @returns {Promise<void>}
     */
    async addChunkToWorkingMemory(characterId, knowledgeId, content) {
        if (!this.activeWorkingMemory.has(characterId)) {
            this.activeWorkingMemory.set(characterId, new Map());
        }

        const characterWM = this.activeWorkingMemory.get(characterId);
        const contentHash = this.generateContentHash(content); // Simple hash for content comparison

        // Handle interference: If WM is full, displace oldest or least relevant chunk
        const characterTraitScores = await this.traitManager.getCharacterTraitScores(characterId);
        const effectiveCapacity = this.getEffectiveWorkingMemoryCapacity(characterTraitScores);

        if (characterWM.size >= effectiveCapacity) {
            // Find chunk to displace (e.g., oldest, or lowest relevance if semantic search is integrated)
            let oldestChunkId = null;
            let oldestTimestamp = Infinity;
            for (const [id, chunkInfo] of characterWM.entries()) {
                if (chunkInfo.lastAccessedTimestamp < oldestTimestamp) {
                    oldestTimestamp = chunkInfo.lastAccessedTimestamp;
                    oldestChunkId = id;
                }
            }
            if (oldestChunkId) {
                characterWM.delete(oldestChunkId);
                console.log(`Character ${characterId} working memory full. Displaced chunk ${oldestChunkId}.`);
            }
        }

        characterWM.set(knowledgeId, { contentHash, lastAccessedTimestamp: Date.now() });
        console.log(`Chunk ${knowledgeId} added to character ${characterId}'s working memory.`);
    }

    /**
     * Retrieves the current cognitive load state for a character.
     * @param {string} characterId - The hex ID of the character.
     * @returns {Object} - { activeChunks: Array<Object>, loadFactor: number }
     */
    async getCharacterCognitiveLoad(characterId) {
        const characterWM = this.activeWorkingMemory.get(characterId) || new Map();
        const activeChunks = Array.from(characterWM.keys()).map(id => ({ knowledgeId: id }));

        const characterTraitScores = await this.traitManager.getCharacterTraitScores(characterId);
        const effectiveCapacity = this.getEffectiveWorkingMemoryCapacity(characterTraitScores);

        const loadFactor = effectiveCapacity > 0 ? characterWM.size / effectiveCapacity : 0;

        return { activeChunks, loadFactor };
    }

    /**
     * Calculates a character's effective working memory capacity based on their traits.
     * @param {Object} characterTraitScores - Map of trait_hex_id to score (0-100).
     * @returns {number} - The effective working memory capacity in chunks.
     */
    getEffectiveWorkingMemoryCapacity(characterTraitScores) {
        let capacity = knowledgeConfig.cognitiveLoad.baseWorkingMemoryCapacity;

        const workingMemoryScore = characterTraitScores[knowledgeConfig.traits.workingMemoryHex] || 50;
        const attentionSpanScore = characterTraitScores[knowledgeConfig.traits.attentionSpanHex] || 50;
        const concentrationScore = characterTraitScores[knowledgeConfig.traits.concentrationHex] || 50;
        const executiveFunctionScore = characterTraitScores[knowledgeConfig.traits.executiveFunctionHex] || 50;
        const neuroticismScore = characterTraitScores[knowledgeConfig.traits.neuroticismHex] || 50;

        // Positive influence from cognitive traits
        capacity += (workingMemoryScore / 100) * knowledgeConfig.cognitiveLoad.cognitiveTraitCapacityBonus;
        capacity += (attentionSpanScore / 100) * knowledgeConfig.cognitiveLoad.cognitiveTraitCapacityBonus;
        capacity += (concentrationScore / 100) * knowledgeConfig.cognitiveLoad.cognitiveTraitCapacityBonus;
        capacity += (executiveFunctionScore / 100) * knowledgeConfig.cognitiveLoad.cognitiveTraitCapacityBonus;

        // Negative influence from Neuroticism
        capacity -= (neuroticismScore / 100) * knowledgeConfig.cognitiveLoad.neuroticismCapacityPenalty;

        // Clamp capacity to min/max defined in config
        return Math.round(Math.min(knowledgeConfig.cognitiveLoad.maxWorkingMemoryCapacity, Math.max(knowledgeConfig.cognitiveLoad.minWorkingMemoryCapacity, capacity)));
    }

    /**
     * Periodically cleans up working memory by removing chunks that have decayed (not accessed recently).
     * This simulates temporal decay.
     */
    cleanupWorkingMemory() {
        const now = Date.now();
        this.activeWorkingMemory.forEach((characterWM, characterId) => {
            const chunksToRemove = [];
            for (const [knowledgeId, chunkInfo] of characterWM.entries()) {
                if (now - chunkInfo.lastAccessedTimestamp > this.decayInterval) {
                    chunksToRemove.push(knowledgeId);
                }
            }
            chunksToRemove.forEach(knowledgeId => {
                characterWM.delete(knowledgeId);
                // console.log(`Chunk ${knowledgeId} decayed from character ${characterId}'s working memory.`);
            });
            if (characterWM.size === 0) {
                this.activeWorkingMemory.delete(characterId); // Remove character entry if no active chunks
            }
        });
    }

    /**
     * Updates persistent cognitive load traits based on recent cognitive experiences.
     * This feeds into the TSE learning loop.
     * @param {string} characterId - The hex ID of the character.
     * @param {Object} characterTraitScores - The current trait scores of the character.
     * @returns {Promise<void>}
     */
    async updatePersistentCognitiveLoadTraits(characterId, characterTraitScores) {
        try {
            const { loadFactor } = await this.getCharacterCognitiveLoad(characterId);

            // If character frequently experiences high cognitive load, increase Neuroticism or related traits
            if (loadFactor > knowledgeConfig.cognitiveLoad.persistentOverloadThreshold) {
                const stressManagement = characterTraitScores[knowledgeConfig.traits.stressManagementHex] || 50;
                const overwhelmManagement = characterTraitScores[knowledgeConfig.traits.overwhelmManagementHex] || 50;
                const generalAnxiety = characterTraitScores[knowledgeConfig.traits.generalAnxietyHex] || 50;

                // Example: Reduce Stress Management and Overwhelm Management, increase General Anxiety
                const delta = knowledgeConfig.cognitiveLoad.persistentLoadImpact;

                // Update trait scores (assuming TraitManager has an update method)
                // this.traitManager.updateTrait(characterId, knowledgeConfig.traits.stressManagementHex, -delta);
                // this.traitManager.updateTrait(characterId, knowledgeConfig.traits.overwhelmManagementHex, -delta);
                // this.traitManager.updateTrait(characterId, knowledgeConfig.traits.generalAnxietyHex, delta);

                console.log(`Character ${characterId} experienced high cognitive load. Potentially updating persistent traits.`);
            }
        } catch (error) {
            console.error('Error updating persistent cognitive load traits:', error);
        }
    }

    /**
     * Simple hash function for content.
     * @param {string} str - The string to hash.
     * @returns {string} - A simple hash.
     */
    generateContentHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
}

export default CognitiveLoadManager;


