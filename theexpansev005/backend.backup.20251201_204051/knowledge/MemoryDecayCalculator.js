// backend/knowledge/MemoryDecayCalculator.js

import knowledgeConfig from '../../config/knowledgeConfig.js';

/**
 * @module MemoryDecayCalculator
 * @description Implements the Ebbinghaus Forgetting Curve and integrates with FSRS
 * parameters to calculate memory retention (retrievability).
 */
class MemoryDecayCalculator {
    constructor() {
        // FSRS parameters for retrievability calculation (from FSRS documentation)
        // These are typically learned parameters, but for initial implementation, use defaults.
        this.fsrsWeights = knowledgeConfig.fsrs.weights;
    }

    /**
     * Calculates the retrievability (R) of a knowledge item based on its stability (S)
     * and the time elapsed since the last review.
     * Uses the FSRS formula for retrievability: R(t) = (1 + F * t / S)^C
     * where F and C are derived from FSRS weights.
     *
     * @param {number} stability - The FSRS Stability (S) parameter for the knowledge item (in days).
     * @param {number} timeElapsedDays - The time elapsed since the last review (in days).
     * @returns {number} - The current retrievability (0-1).
     */
    calculateRetrievability(stability, timeElapsedDays) {
        if (stability <= 0 || timeElapsedDays < 0) {
            return 0; // Invalid inputs
        }

        // FSRS formula for R(t) is generally R(t) = 0.9 * exp(-t / S) for specific use cases
        // or more complex forms. The user's research mentions R = e^(-t/S) as Ebbinghaus,
        // and FSRS uses DSR model. Let's use a common FSRS-derived retrievability formula
        // that is more robust than simple Ebbinghaus for adaptive systems.
        // A common approximation for FSRS retrievability when not doing full prediction:
        // R = 0.9 * Math.exp(-timeElapsedDays / stability) is a simple way to model decay from 90%
        // However, the research implies a direct Ebbinghaus form R = e^(-t/S) for baseline.
        // Let's stick to the simpler Ebbinghaus form for baseline decay as requested,
        // and FSRS will adjust 'S' to control this decay.

        // R = e^(-t/S)
        const retrievability = Math.exp(-timeElapsedDays / stability);

        // Ensure retrievability is clamped between 0 and 1
        return Math.min(1.0, Math.max(0.0, retrievability));
    }

    /**
     * Calculates the memory decay rate based on initial decay and trait modifiers.
     * This is used to influence the 'stability' parameter in FSRS or initial strength.
     * @param {Object} characterTraitScores - Map of trait_hex_id to score (0-100).
     * @param {string} learningMethod - The method by which knowledge was acquired (e.g., 'conversation', 'observation').
     * @returns {number} - The calculated decay rate factor. Lower means slower decay.
     */
    calculateDecayRateFactor(characterTraitScores, learningMethod) {
        let traitModifiedDecayRate = 1.0;

        const conscientiousnessScore = characterTraitScores[knowledgeConfig.traits.conscientiousnessHex] || 50;
        const neuroticismScore = characterTraitScores[knowledgeConfig.traits.neuroticismHex] || 50;

        // Conscientiousness bonus: leads to slower decay (higher factor)
        traitModifiedDecayRate *= (1 + (conscientiousnessScore / 100) * knowledgeConfig.memory.conscientiousnessRetentionBonus);

        // Neuroticism penalty: leads to faster decay (lower factor)
        traitModifiedDecayRate *= (1 - (neuroticismScore / 100) * knowledgeConfig.memory.neuroticismDecayPenalty);

        // Learning method bonus
        let learningMethodBonus = knowledgeConfig.memory.learningMethodBonuses[learningMethod] || 1.0;

        let finalDecayRateFactor = traitModifiedDecayRate * learningMethodBonus;

        // Clamp the final factor to prevent extreme values
        finalDecayRateFactor = Math.min(knowledgeConfig.memory.maxDecayRateFactor, Math.max(knowledgeConfig.memory.minDecayRateFactor, finalDecayRateFactor));

        return finalDecayRateFactor;
    }
}

export default MemoryDecayCalculator;

