// backend/knowledge/SpacedRepetitionScheduler.js

import knowledgeConfig from '../../config/knowledgeConfig.js';
import MemoryDecayCalculator from './MemoryDecayCalculator.js';

class SpacedRepetitionScheduler {
    constructor() {
        this.memoryDecayCalculator = new MemoryDecayCalculator();
        this.w = knowledgeConfig.fsrs.weights;
        
        console.log(`[SpacedRepetitionScheduler] Mode: ${knowledgeConfig.fsrs.mode}`);
        console.log(`[SpacedRepetitionScheduler] Trait modifiers: ${knowledgeConfig.fsrs.traitModifiers.enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    calculateFSRSUpdate(currentStability, currentDifficulty, currentRetrievability, grade, learningProfile = null) {
        const fsrsGrade = grade - 1;

        let traitModifiedDifficulty = currentDifficulty;
        let traitModifiedStability = currentStability;

        if (knowledgeConfig.fsrs.mode === 'trait-modified' && learningProfile) {
            traitModifiedDifficulty = this._applyTraitModifiersToDifficulty(currentDifficulty, learningProfile);
            traitModifiedStability = this._applyTraitModifiersToStability(currentStability, learningProfile);
        }

        let newStability, newDifficulty;

        if (fsrsGrade === 0) {
            newStability = this.w[0];
            newDifficulty = traitModifiedDifficulty + this.w[1] * (1 - currentRetrievability);
        } else {
            newDifficulty = traitModifiedDifficulty + this.w[2] * (1 - fsrsGrade / 3);
            newDifficulty = Math.min(10, Math.max(1, newDifficulty));

            if (currentStability <= 0.4) {
                newStability = this.w[3] * Math.exp(this.w[4] * (fsrsGrade - 1) + this.w[5] * (newDifficulty - 5));
            } else {
                newStability = traitModifiedStability * (1 + Math.exp(this.w[6] * (fsrsGrade - 1) + this.w[7] * (newDifficulty - 5)));
            }
        }

        newStability = Math.min(knowledgeConfig.fsrs.maxStability, Math.max(knowledgeConfig.fsrs.minStability, newStability));

        const newIntervalDays = newStability * knowledgeConfig.fsrs.intervalMultiplier;

        return {
            newStability: newStability,
            newDifficulty: newDifficulty,
            newIntervalDays: newIntervalDays
        };
    }

    calculateNextReviewInterval(initialStability, initialDifficulty, initialRetrievability, initialIntervalDays) {
        return initialIntervalDays;
    }

    _applyTraitModifiersToDifficulty(baseDifficulty, learningProfile) {
        if (!knowledgeConfig.fsrs.traitModifiers.enabled) {
            return baseDifficulty;
        }

        let modifiedDifficulty = baseDifficulty;

        const anxietyScore = learningProfile.emotional?.anxiety || 50;
        const disciplineScore = learningProfile.behavioral?.discipline || 50;

        modifiedDifficulty += (anxietyScore / 100) * knowledgeConfig.fsrs.traitModifiers.anxietyDifficultyImpact;
        modifiedDifficulty -= (disciplineScore / 100) * knowledgeConfig.fsrs.traitModifiers.disciplineDifficultyReduction;

        return Math.min(10, Math.max(1, modifiedDifficulty));
    }

    _applyTraitModifiersToStability(baseStability, learningProfile) {
        if (!knowledgeConfig.fsrs.traitModifiers.enabled) {
            return baseStability;
        }

        let modifiedStability = baseStability;

        const disciplineScore = learningProfile.behavioral?.discipline || 50;
        const anxietyScore = learningProfile.emotional?.anxiety || 50;
        const emotionalStabilityScore = learningProfile.emotional?.emotionalStability || 50;

        modifiedStability *= (1 + (disciplineScore / 100) * knowledgeConfig.fsrs.traitModifiers.disciplineStabilityBonus);
        modifiedStability *= (1 - (anxietyScore / 100) * knowledgeConfig.fsrs.traitModifiers.anxietyStabilityPenalty);
        modifiedStability *= (1 + (emotionalStabilityScore / 100) * knowledgeConfig.fsrs.traitModifiers.emotionalStabilityBonus);

        return Math.min(knowledgeConfig.fsrs.maxStability, Math.max(knowledgeConfig.fsrs.minStability, modifiedStability));
    }
}

export default SpacedRepetitionScheduler;
