// backend/knowledge/SpacedRepetitionScheduler.js

import knowledgeConfig from '../../config/knowledgeConfig.js';
import MemoryDecayCalculator from './MemoryDecayCalculator.js';

/**
 * @module SpacedRepetitionScheduler
 * @description Implements the FSRS algorithm for optimal review scheduling,
 * adapting intervals based on character performance and traits.
 */
class SpacedRepetitionScheduler {
    constructor() {
        this.memoryDecayCalculator = new MemoryDecayCalculator();
        // FSRS weights (learned parameters) from config
        this.w = knowledgeConfig.fsrs.weights;
    }

    /**
     * Calculates the next review interval and updates Stability (S) and Difficulty (D)
     * based on the FSRS algorithm and character's trait modifiers.
     *
     * @param {number} currentStability - Current Stability (S) of the knowledge item.
     * @param {number} currentDifficulty - Current Difficulty (D) of the knowledge item.
     * @param {number} currentRetrievability - Current Retrievability (R) of the knowledge item (from decay calc).
     * @param {number} grade - User's self-rating (1=Forgot, 2=Hard, 3=Good, 4=Easy).
     * @param {Object} characterTraitScores - Map of trait_hex_id to score (0-100).
     * @returns {{newStability: number, newDifficulty: number, newIntervalDays: number}}
     */
    calculateFSRSUpdate(currentStability, currentDifficulty, currentRetrievability, grade, characterTraitScores) {
        // Normalize grade to FSRS scale (e.g., 0-3 or 1-4)
        // Assuming grade 1-4: 1=Forgot, 2=Hard, 3=Good, 4=Easy
        // FSRS typically uses 0-3: 0=Forgot, 1=Hard, 2=Good, 3=Easy
        const fsrsGrade = grade - 1;

        // Apply trait modifiers to FSRS parameters or their impact
        const traitModifiedDifficulty = this._applyTraitModifiersToDifficulty(currentDifficulty, characterTraitScores);
        const traitModifiedStability = this._applyTraitModifiersToStability(currentStability, characterTraitScores);

        let newStability, newDifficulty;

        if (fsrsGrade === 0) { // Forgot
            newStability = this.w[0]; // Reset stability to initial value
            newDifficulty = traitModifiedDifficulty + this.w[1] * (1 - currentRetrievability); // Increase difficulty
        } else {
            // Calculate new difficulty (FSRS formula)
            newDifficulty = traitModifiedDifficulty + this.w[2] * (1 - fsrsGrade / 3); // Adjust difficulty based on grade
            newDifficulty = Math.min(10, Math.max(1, newDifficulty)); // Clamp difficulty between 1 and 10

            // Calculate new stability (FSRS formula)
            // Initial stability calculation (if it's the first successful review)
            if (currentStability <= 0.4) { // Heuristic for initial learning phase
                newStability = this.w[3] * Math.exp(this.w[4] * (fsrsGrade - 1) + this.w[5] * (newDifficulty - 5));
            } else {
                newStability = traitModifiedStability * (1 + Math.exp(this.w[6] * (fsrsGrade - 1) + this.w[7] * (newDifficulty - 5)));
            }
        }

        // Clamp new stability to prevent unrealistically high values
        newStability = Math.min(knowledgeConfig.fsrs.maxStability, Math.max(knowledgeConfig.fsrs.minStability, newStability));

        // Calculate next interval based on new stability
        const newIntervalDays = newStability * knowledgeConfig.fsrs.intervalMultiplier; // Simple multiplier for interval

        return {
            newStability: newStability,
            newDifficulty: newDifficulty,
            newIntervalDays: newIntervalDays
        };
    }

    /**
     * Calculates the initial next review interval for a newly acquired knowledge item.
     * @param {number} initialStability - The initial stability.
     * @param {number} initialDifficulty - The initial difficulty.
     * @param {number} initialRetrievability - The initial retrievability.
     * @param {number} initialIntervalDays - The base initial interval in days.
     * @returns {number} - The calculated initial interval in days.
     */
    calculateNextReviewInterval(initialStability, initialDifficulty, initialRetrievability, initialIntervalDays) {
        // For a new item, the first interval might be short.
        // This can be a fixed value or slightly adjusted by initial strength.
        // For FSRS, the first interval is often based on default stability.
        return initialIntervalDays; // Use the configured initial interval
    }


    /**
     * Applies trait modifiers to the difficulty parameter.
     * High Neuroticism might increase perceived difficulty.
     * High Conscientiousness might decrease perceived difficulty.
     * @param {number} baseDifficulty - The base difficulty.
     * @param {Object} characterTraitScores - Map of trait_hex_id to score (0-100).
     * @returns {number} - The trait-modified difficulty.
     */
    _applyTraitModifiersToDifficulty(baseDifficulty, characterTraitScores) {
        let modifiedDifficulty = baseDifficulty;

        const neuroticismScore = characterTraitScores[knowledgeConfig.traits.neuroticismHex] || 50;
        const conscientiousnessScore = characterTraitScores[knowledgeConfig.traits.conscientiousnessHex] || 50;

        // Neuroticism: increases perceived difficulty (e.g., due to anxiety, self-doubt)
        modifiedDifficulty += (neuroticismScore / 100) * knowledgeConfig.fsrs.neuroticismDifficultyImpact;

        // Conscientiousness: decreases perceived difficulty (e.g., due to focus, diligence)
        modifiedDifficulty -= (conscientiousnessScore / 100) * knowledgeConfig.fsrs.conscientiousnessDifficultyImpact;

        return Math.min(10, Math.max(1, modifiedDifficulty)); // Clamp difficulty
    }

    /**
     * Applies trait modifiers to the stability parameter.
     * High Conscientiousness might increase stability (slower decay).
     * High Neuroticism might decrease stability (faster decay).
     * @param {number} baseStability - The base stability.
     * @param {Object} characterTraitScores - Map of trait_hex_id to score (0-100).
     * @returns {number} - The trait-modified stability.
     */
    _applyTraitModifiersToStability(baseStability, characterTraitScores) {
        let modifiedStability = baseStability;

        const conscientiousnessScore = characterTraitScores[knowledgeConfig.traits.conscientiousnessHex] || 50;
        const neuroticismScore = characterTraitScores[knowledgeConfig.traits.neuroticismHex] || 50;

        // Conscientiousness: increases stability (better retention)
        modifiedStability *= (1 + (conscientiousnessScore / 100) * knowledgeConfig.fsrs.conscientiousnessStabilityBonus);

        // Neuroticism: decreases stability (worse retention)
        modifiedStability *= (1 - (neuroticismScore / 100) * knowledgeConfig.fsrs.neuroticismStabilityPenalty);

        return Math.min(knowledgeConfig.fsrs.maxStability, Math.max(knowledgeConfig.fsrs.minStability, modifiedStability)); // Clamp stability
    }
}

export default SpacedRepetitionScheduler;

