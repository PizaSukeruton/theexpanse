// backend/knowledge/KnowledgeTransferManager.js

import knowledgeConfig from '../../config/knowledgeConfig.js';
import TraitManager from '../traits/TraitManager.js'; // Assuming TraitManager.js is at root or accessible

/**
 * @module KnowledgeTransferManager
 * @description Manages cross-character knowledge sharing, calculating success rates
 * and quality degradation based on personality compatibility and expertise.
 */
class KnowledgeTransferManager {
    constructor() {
        this.traitManager = TraitManager;
    }

    /**
     * Calculates the outcome of a knowledge transfer attempt between two characters.
     * @param {Object} senderTraitScores - Map of trait_hex_id to score (0-100) for the sender.
     * @param {Object} receiverTraitScores - Map of trait_hex_id to score (0-100) for the receiver.
     * @param {number} senderExpertiseScore - Sender's expertise level in the specific knowledge item (0-100).
     * @param {number} knowledgeComplexityScore - Complexity of the knowledge item (0-1).
     * @returns {{successRate: number, qualityDegradation: number}}
     */
    calculateTransferOutcome(senderTraitScores, receiverTraitScores, senderExpertiseScore, knowledgeComplexityScore) {
        // 1. Calculate Teaching Quality (Sender)
        const senderConscientiousness = senderTraitScores[knowledgeConfig.traits.conscientiousnessHex] || 50;
        const senderVerbalExpression = senderTraitScores[knowledgeConfig.traits.verbalExpressionHex] || 50;
        const senderSocialCommunication = senderTraitScores[knowledgeConfig.traits.socialCommunicationHex] || 50;

        let teachingQuality = knowledgeConfig.transfer.baseTeachingQuality;
        teachingQuality += (senderConscientiousness / 100) * knowledgeConfig.transfer.conscientiousnessTeachingFactor;
        teachingQuality += (senderVerbalExpression / 100) * knowledgeConfig.transfer.verbalExpressionTeachingFactor;
        teachingQuality += (senderSocialCommunication / 100) * knowledgeConfig.transfer.socialCommunicationTeachingFactor;

        // Expertise level heavily influences teaching quality
        teachingQuality *= (senderExpertiseScore / 100) * knowledgeConfig.transfer.expertiseTeachingFactor;

        teachingQuality = Math.min(1.0, Math.max(0.1, teachingQuality)); // Clamp

        // 2. Calculate Learning Receptivity (Receiver)
        const receiverOpenness = receiverTraitScores[knowledgeConfig.traits.opennessHex] || 50;
        const receiverAgreeableness = receiverTraitScores[knowledgeConfig.traits.agreeablenessHex] || 50;
        const receiverTrustBuilding = receiverTraitScores[knowledgeConfig.traits.trustBuildingHex] || 50; // Trust with sender

        let learningReceptivity = knowledgeConfig.transfer.baseLearningReceptivity;
        learningReceptivity += (receiverOpenness / 100) * knowledgeConfig.transfer.opennessReceptivityFactor;
        learningReceptivity += (receiverAgreeableness / 100) * knowledgeConfig.transfer.agreeablenessReceptivityFactor;
        learningReceptivity += (receiverTrustBuilding / 100) * knowledgeConfig.transfer.trustReceptivityFactor;

        learningReceptivity = Math.min(1.0, Math.max(0.1, learningReceptivity)); // Clamp

        // 3. Calculate Transfer Success Rate
        let successRate = knowledgeConfig.transfer.baseTransferRate;
        successRate *= teachingQuality;
        successRate *= learningReceptivity;

        // Penalize for knowledge complexity
        successRate *= (1 - knowledgeComplexityScore * knowledgeConfig.transfer.knowledgeComplexityPenalty);

        // Personality conflict filter (e.g., if receiver is highly conservative and knowledge is radical)
        const receiverConservativeApproach = receiverTraitScores[knowledgeConfig.traits.conservativeApproachHex] || 50;
        const conflictFilterPenalty = (receiverConservativeApproach / 100) * knowledgeConfig.transfer.conflictFilterFactor * knowledgeComplexityScore; // More complex, more conflict
        successRate *= (1 - conflictFilterPenalty);


        successRate = Math.min(1.0, Math.max(0.01, successRate)); // Clamp success rate

        // 4. Calculate Quality Degradation
        let qualityDegradation = knowledgeConfig.transfer.baseQualityDegradation;
        qualityDegradation += (1 - teachingQuality) * knowledgeConfig.transfer.teachingQualityDegradationFactor;
        qualityDegradation += (1 - learningReceptivity) * knowledgeConfig.transfer.learningReceptivityDegradationFactor;
        qualityDegradation += knowledgeComplexityScore * knowledgeConfig.transfer.knowledgeComplexityDegradationFactor;
        qualityDegradation += conflictFilterPenalty * knowledgeConfig.transfer.conflictFilterDegradationFactor;

        qualityDegradation = Math.min(knowledgeConfig.transfer.maxQualityDegradation, Math.max(0.0, qualityDegradation)); // Clamp degradation

        return { successRate, qualityDegradation };
    }
}

export default KnowledgeTransferManager;

