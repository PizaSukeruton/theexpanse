// backend/knowledge/KnowledgeAcquisitionEngine.js

import knowledgeQueries from '../db/knowledgeQueries.js';
import MemoryDecayCalculator from './MemoryDecayCalculator.js';
import CognitiveLoadManager from './CognitiveLoadManager.js';
import SpacedRepetitionScheduler from './SpacedRepetitionScheduler.js';
import KnowledgeTransferManager from './KnowledgeTransferManager.js';
import EmptySlotPopulator from './EmptySlotPopulator.js';
import TraitManager from '../traits/TraitManager.js'; // CORRECTED PATH
import chunkerBridge from '../utils/chunkerBridge.js'; // CORRECTED PATH
import knowledgeConfig from '../../config/knowledgeConfig.js';
import generateHexId from '../utils/hexIdGenerator.js'; // CORRECTED PATH

/**
 * @module KnowledgeAcquisitionEngine
 * @description Main orchestrator for the trait-driven knowledge acquisition system.
 * Handles ingestion, processing, and retrieval of knowledge, coordinating with
 * other knowledge modules and integrating with existing system components.
 */
class KnowledgeAcquisitionEngine {
    constructor() {
        this.memoryDecayCalculator = new MemoryDecayCalculator();
        this.cognitiveLoadManager = new CognitiveLoadManager();
        this.spacedRepetitionScheduler = new SpacedRepetitionScheduler();
        this.knowledgeTransferManager = new KnowledgeTransferManager();
        this.emptySlotPopulator = new EmptySlotPopulator();
        this.traitManager = TraitManager; // Use the existing TraitManager instance
    }

    /**
     * Initializes the knowledge acquisition engine, loading necessary configurations.
     * @returns {Promise<void>}
     */
    async initialize() {
        // Any initial setup, e.g., loading global trait modifiers from DB if not already in config
        console.log('KnowledgeAcquisitionEngine initialized.');
    }

    /**
     * Processes new incoming knowledge, typically from the Knowledge Chunker.
     * This is the entry point for a character to learn new information.
     * @param {string} characterId - The hex ID of the character acquiring the knowledge.
     * @param {string} rawContent - The raw text content from which knowledge is derived (e.g., user message, document).
     * @param {string} sourceType - The method of acquisition (e.g., 'conversation', 'observation', 'documentation').
     * @returns {Promise<Array<Object>>} - An array of processed knowledge items.
     */
    async ingestNewKnowledge(characterId, rawContent, sourceType) {
        try {
            console.log(`Ingesting new knowledge for character ${characterId} from source: ${sourceType}`);

            // 1. Call Python Knowledge Chunker to get structured knowledge items
            const chunkerResponse = await chunkerBridge.callKnowledgeChunker(rawContent);
            // FIX: Chunker returns 'chunks' property, not 'knowledge_items'
            const knowledgeChunks = chunkerResponse.chunks; // CORRECTED PROPERTY ACCESS

            if (!knowledgeChunks || knowledgeChunks.length === 0) {
                console.log('No new knowledge chunks identified by the chunker.');
                return [];
            }

            const acquiredKnowledgeItems = [];
            // FIX: Ensure getTraitVector exists on TraitManager.
            // TraitManager.js has been updated to include this method.
            const characterTraitScores = await this.traitManager.getTraitVector(characterId);

            for (const chunk of knowledgeChunks) {
                const knowledgeId = await generateHexId('knowledge_items'); // Generate unique hex ID for new knowledge item
                // Assuming chunk.domain exists from chunker output, e.g., {"domain": "tanuki_mythology"}
                const domainId = await this.getOrCreateKnowledgeDomain(chunk.domain || "general_knowledge"); // Ensure domain exists and get its ID

                // Check for cognitive load before processing
                const currentCognitiveLoad = await this.cognitiveLoadManager.getCharacterCognitiveLoad(characterId);
                const effectiveWMCapacity = this.cognitiveLoadManager.getEffectiveWorkingMemoryCapacity(characterTraitScores);

                if (currentCognitiveLoad.activeChunks.length >= effectiveWMCapacity * knowledgeConfig.cognitiveLoad.overloadThresholdFactor) {
                    console.warn(`Character ${characterId} is experiencing cognitive overload. Learning rate reduced.`);
                    // Optionally, skip learning or significantly reduce initial strength
                    // For now, we'll let the learning rate formula handle it.
                }

                // Calculate initial strength based on character traits and source type
                const learningRate = this.calculateLearningRate(characterTraitScores, currentCognitiveLoad.loadFactor);
                const initialStrength = knowledgeConfig.memory.baseInitialStrength * learningRate; // Apply learning rate to initial strength

                // 2. Store knowledge item if new
                // Check if a similar knowledge item already exists to prevent redundancy
                // For simplicity, we'll assume new chunks are unique for now.
                // In a real system, you'd perform a semantic similarity search here.
                await knowledgeQueries.insertKnowledgeItem({
                    knowledge_id: knowledgeId,
                    content: chunk.text_content, // FIX: Access 'text_content' from chunk
                    domain_id: domainId,
                    source_type: sourceType,
                    initial_character_id: characterId,
                    initial_strength: Math.min(1.0, Math.max(0.01, initialStrength)), // Clamp between 0.01 and 1
                    complexity_score: chunk.metadata ? chunk.metadata.confidence || 0.5 : 0.5 // FIX: Access 'complexity_score' from 'metadata'
                });

                // 3. Update character's knowledge state
                const now = new Date();
                const nextReview = this.spacedRepetitionScheduler.calculateNextReviewInterval(
                    knowledgeConfig.fsrs.defaultStability,
                    knowledgeConfig.fsrs.defaultDifficulty,
                    knowledgeConfig.fsrs.defaultRetrievability,
                    knowledgeConfig.fsrs.initialReviewIntervalDays
                );

                await knowledgeQueries.upsertCharacterKnowledgeState({
                    character_id: characterId,
                    knowledge_id: knowledgeId,
                    current_retrievability: initialStrength, // Initial retrievability is the initial strength
                    stability: knowledgeConfig.fsrs.defaultStability,
                    difficulty: knowledgeConfig.fsrs.defaultDifficulty,
                    last_review_timestamp: now,
                    next_review_timestamp: new Date(now.getTime() + nextReview * 24 * 60 * 60 * 1000), // Convert days to ms
                    acquisition_method: sourceType,
                    current_expertise_score: initialStrength * 100 // Scale to 0-100
                });

                acquiredKnowledgeItems.push({ knowledgeId, domainId, content: chunk.text_content }); // FIX: Use text_content here too

                // 4. Update cognitive load (add chunk to active WM)
                await this.cognitiveLoadManager.addChunkToWorkingMemory(characterId, knowledgeId, chunk.text_content); // FIX: Use text_content here too

                // 5. Update character's domain expertise
                await this.updateCharacterDomainExpertise(characterId, domainId, initialStrength * 100);

                // 6. Attempt to populate empty slots
                await this.emptySlotPopulator.attemptPopulateEmptySlot(characterId, domainId, characterTraitScores);

                console.log(`Character ${characterId} acquired knowledge item ${knowledgeId} in domain ${domainId}.`);
            }

            // After all chunks processed, potentially update persistent cognitive load traits
            await this.cognitiveLoadManager.updatePersistentCognitiveLoadTraits(characterId, characterTraitScores);

            return acquiredKnowledgeItems;

        } catch (error) {
            console.error('Error ingesting new knowledge:', error);
            throw error;
        }
    }

    /**
     * Retrieves relevant knowledge for a character based on conversational context.
     * This is used by the NLG pipeline.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} conversationContext - The current conversational context/query.
     * @param {number} [limit=5] - Maximum number of relevant knowledge items to retrieve.
     * @returns {Promise<Array<Object>>} - Array of relevant knowledge items.
     */
    async retrieveRelevantKnowledge(characterId, conversationContext, limit = 5) {
        try {
            console.log(`Retrieving relevant knowledge for character ${characterId} based on context: "${conversationContext.substring(0, 50)}..."`);

            // 1. Get character's current knowledge state (retrievability, expertise)
            // 2. Potentially use semantic search (if semantic_embedding is implemented and pgvector is used)
            // For now, a simpler approach: retrieve most recent, highly retrievable knowledge in relevant domains.

            // Identify relevant domains from context (e.g., using the knowledge chunker on context, or keyword matching)
            const chunkerResponse = await chunkerBridge.callKnowledgeChunker(conversationContext);
            const relevantDomains = chunkerResponse.chunks.map(item => item.domain); // FIX: Access 'chunks' property

            let knowledgeItems = [];
            if (relevantDomains.length > 0) {
                // Fetch knowledge items for these domains, ordered by retrievability and recency
                knowledgeItems = await knowledgeQueries.getCharacterKnowledgeByDomains(characterId, relevantDomains, limit);
            } else {
                // If no specific domains, fetch general highly retrievable knowledge
                knowledgeItems = await knowledgeQueries.getCharacterKnowledgeState(characterId, limit);
            }

            // Filter by retrievability and potentially trigger review events
            const relevantForNLG = [];
            for (const item of knowledgeItems) {
                // Calculate current retrievability (real-time decay check)
                const now = new Date();
                const timeElapsed = (now.getTime() - item.last_review_timestamp.getTime()) / (1000 * 60 * 60 * 24); // days
                const currentRetrievability = this.memoryDecayCalculator.calculateRetrievability(item.stability, timeElapsed);

                // Update in DB if significantly different or due for review
                if (currentRetrievability !== item.current_retrievability || now > item.next_review_timestamp) {
                    await knowledgeQueries.updateCharacterKnowledgeRetrievability(characterId, item.knowledge_id, currentRetrievability);
                    item.current_retrievability = currentRetrievability; // Update local object
                }

                // If retrievability is too low, it's effectively forgotten for this interaction
                if (currentRetrievability > knowledgeConfig.memory.forgettingThreshold) {
                    relevantForNLG.push(item);
                    // If due for review, mark for a "review event" to be handled by NLG or a separate process
                    if (now > item.next_review_timestamp) {
                        console.log(`Knowledge item ${item.knowledge_id} due for review for character ${characterId}.`);
                        // This would typically trigger a flag for NLG to prompt a review or an internal self-assessment
                        // For now, we just log it. The SpacedRepetitionScheduler will handle the actual update post-grade.
                    }
                } else {
                    // Mark as forgotten if below threshold
                    if (!item.is_forgotten) {
                        await knowledgeQueries.markKnowledgeAsForgotten(characterId, item.knowledge_id, true);
                        console.log(`Knowledge item ${item.knowledge_id} marked as forgotten for character ${characterId}.`);
                    }
                }
            }

            return relevantForNLG;

        } catch (error) {
            console.error('Error retrieving relevant knowledge:', error);
            throw error;
        }
    }

    /**
     * Handles a knowledge review event, updating FSRS parameters based on character's grade.
     * This is typically called after a character "recalls" or "fails to recall" knowledge.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} knowledgeId - The hex ID of the knowledge item.
     * @param {number} grade - The review grade (1=Forgot, 2=Hard, 3=Good, 4=Easy).
     * @returns {Promise<void>}
     */
    async handleKnowledgeReview(characterId, knowledgeId, grade) {
        try {
            console.log(`Handling review for character ${characterId}, knowledge ${knowledgeId} with grade ${grade}.`);
            const knowledgeState = await knowledgeQueries.getSingleCharacterKnowledgeState(characterId, knowledgeId);
            if (!knowledgeState) {
                console.warn(`Knowledge state not found for character ${characterId} and knowledge ${knowledgeId}. Cannot review.`);
                return;
            }

            const characterTraitScores = await this.traitManager.getTraitVector(characterId);

            // Calculate new stability, difficulty, and next review interval using FSRS
            const { newStability, newDifficulty, newIntervalDays } = this.spacedRepetitionScheduler.calculateFSRSUpdate(
                knowledgeState.stability,
                knowledgeState.difficulty,
                knowledgeState.current_retrievability,
                grade,
                characterTraitScores
            );

            const now = new Date();
            const newNextReviewTimestamp = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);

            // Update character_knowledge_state
            await knowledgeQueries.updateCharacterKnowledgeStateAfterReview({
                character_id: characterId,
                knowledge_id: knowledgeId,
                current_retrievability: 1.0, // After review, assume 100% retrievability for now
                stability: newStability,
                difficulty: newDifficulty,
                last_review_timestamp: now,
                next_review_timestamp: newNextReviewTimestamp,
                is_forgotten: false // If reviewed, it's no longer forgotten
            });

            // Log the review event
            await knowledgeQueries.insertKnowledgeReviewLog({
                log_id: await generateHexId('knowledge_review_logs'),
                character_id: characterId,
                knowledge_id: knowledgeId,
                grade: grade,
                previous_interval: (now.getTime() - knowledgeState.last_review_timestamp.getTime()) / (1000 * 60 * 60 * 24),
                new_interval: newIntervalDays,
                retrievability_at_review: knowledgeState.current_retrievability
            });

            // Update expertise score based on successful review
            const expertiseIncrease = knowledgeConfig.expertise.reviewSuccessBonus * (grade / 4); // Scale bonus by grade
            await this.updateCharacterDomainExpertise(characterId, knowledgeState.domain_id, expertiseIncrease);

            // Feed into TSE learning loop (e.g., update 'Memory Consolidation' trait)
            // This would involve calling a method in TraitManager or a dedicated TSE service
            // For example: this.traitManager.updateTrait(characterId, knowledgeConfig.traits.memoryConsolidationHex, expertiseIncrease / 2);

            console.log(`Review complete for knowledge ${knowledgeId}. New interval: ${newIntervalDays} days.`);

        } catch (error) {
            console.error('Error handling knowledge review:', error);
            throw error;
        }
    }

    /**
     * Initiates a knowledge transfer attempt between two characters.
     * @param {string} senderCharacterId - The hex ID of the character attempting to teach.
     * @param {string} receiverCharacterId - The hex ID of the character attempting to learn.
     * @param {string} knowledgeId - The hex ID of the knowledge item to transfer.
     * @param {string} [conversationId] - Optional hex ID of the conversation where transfer occurs.
     * @returns {Promise<boolean>} - True if transfer was successful, false otherwise.
     */
    async attemptKnowledgeTransfer(senderCharacterId, receiverCharacterId, knowledgeId, conversationId = null) {
        try {
            console.log(`Attempting knowledge transfer from ${senderCharacterId} to ${receiverCharacterId} for knowledge ${knowledgeId}.`);

            const senderTraitScores = await this.traitManager.getTraitVector(senderCharacterId);
            const receiverTraitScores = await this.traitManager.getTraitVector(receiverCharacterId);
            const senderExpertise = await knowledgeQueries.getCharacterKnowledgeState(senderCharacterId, 1, knowledgeId);
            const knowledgeItem = await knowledgeQueries.getKnowledgeItem(knowledgeId);

            if (!senderExpertise || !senderExpertise.length || !knowledgeItem) {
                console.warn(`Sender does not possess knowledge ${knowledgeId} or knowledge item not found.`);
                return false;
            }

            const { successRate, qualityDegradation } = this.knowledgeTransferManager.calculateTransferOutcome(
                senderTraitScores,
                receiverTraitScores,
                senderExpertise[0].current_expertise_score,
                knowledgeItem.complexity_score
            );

            console.log(`Transfer success rate: ${successRate}, Quality degradation: ${qualityDegradation}`);

            const transferSuccessful = Math.random() < successRate;

            if (transferSuccessful) {
                const initialStrengthForReceiver = knowledgeConfig.memory.baseInitialStrength * (1 - qualityDegradation);

                // Receiver acquires the knowledge (or reinforces if already known)
                const now = new Date();
                const nextReview = this.spacedRepetitionScheduler.calculateNextReviewInterval(
                    knowledgeConfig.fsrs.defaultStability,
                    knowledgeConfig.fsrs.defaultDifficulty,
                    knowledgeConfig.fsrs.defaultRetrievability,
                    knowledgeConfig.fsrs.initialReviewIntervalDays
                );

                await knowledgeQueries.upsertCharacterKnowledgeState({
                    character_id: receiverCharacterId,
                    knowledge_id: knowledgeId,
                    current_retrievability: initialStrengthForReceiver,
                    stability: knowledgeConfig.fsrs.defaultStability,
                    difficulty: knowledgeConfig.fsrs.defaultDifficulty,
                    last_review_timestamp: now,
                    next_review_timestamp: new Date(now.getTime() + nextReview * 24 * 60 * 60 * 1000),
                    acquisition_method: 'transfer',
                    current_expertise_score: initialStrengthForReceiver * 100
                });

                // Update receiver's domain expertise
                await this.updateCharacterDomainExpertise(receiverCharacterId, knowledgeItem.domain_id, initialStrengthForReceiver * 100);

                // Feed into TSE learning loop for social traits (Trust Building, Relationship Formation)
                // this.traitManager.updateTrait(senderCharacterId, knowledgeConfig.traits.trustBuildingHex, knowledgeConfig.socialLearning.trustBuildingBonus);
                // this.traitManager.updateTrait(receiverCharacterId, knowledgeConfig.traits.relationshipFormationHex, knowledgeConfig.socialLearning.relationshipFormationBonus);
            }

            // Log the transfer attempt regardless of success
            await knowledgeQueries.insertKnowledgeTransferLog({
                transfer_id: await generateHexId('knowledge_transfer_logs'),
                sender_character_id: senderCharacterId,
                receiver_character_id: receiverCharacterId,
                knowledge_id: knowledgeId,
                transfer_success_rate: successRate,
                transfer_quality_degradation: qualityDegradation,
                conversation_id: conversationId
            });

            console.log(`Knowledge transfer ${transferSuccessful ? 'successful' : 'failed'}.`);
            return transferSuccessful;

        } catch (error) {
            console.error('Error during knowledge transfer:', error);
            throw error;
        }
    }

    /**
     * Calculates the effective learning rate for a character based on their traits and cognitive load.
     * @param {Object} characterTraitScores - Map of trait_hex_id to score (0-100).
     * @param {number} cognitiveLoadFactor - The current cognitive load factor (0-1, 1=no load, 0=full overload).
     * @returns {number} - The calculated learning rate.
     */
    calculateLearningRate(characterTraitScores, cognitiveLoadFactor) {
        let traitModifiers = 1.0;

        const opennessScore = characterTraitScores[knowledgeConfig.traits.opennessHex] || 50;
        const conscientiousnessScore = characterTraitScores[knowledgeConfig.traits.conscientiousnessHex] || 50;
        const neuroticismScore = characterTraitScores[knowledgeConfig.traits.neuroticismHex] || 50;

        // Openness bonus
        traitModifiers *= (1 + (opennessScore / 100) * knowledgeConfig.learningRate.opennessLearningBonusFactor);
        // Conscientiousness bonus
        traitModifiers *= (1 + (conscientiousnessScore / 100) * knowledgeConfig.learningRate.conscientiousnessLearningBonusFactor);
        // Neuroticism penalty (multiplicative, reduces overall rate)
        traitModifiers *= (1 - (neuroticismScore / 100) * knowledgeConfig.learningRate.neuroticismLearningPenaltyFactor);

        // Clamp traitModifiers to prevent extreme values
        traitModifiers = Math.min(knowledgeConfig.learningRate.maxTraitModifier, Math.max(knowledgeConfig.learningRate.minTraitModifier, traitModifiers));

        // Personality state factor (simplified, can be expanded)
        // For example, based on Emotional Regulation, Stress Management
        const emotionalRegulation = characterTraitScores[knowledgeConfig.traits.emotionalRegulationHex] || 50;
        const stressManagement = characterTraitScores[knowledgeConfig.traits.stressManagementHex] || 50;
        const personalityStateFactor = (emotionalRegulation / 100 * 0.5) + (stressManagement / 100 * 0.5); // Example: average of two traits
        // Clamp personalityStateFactor
        const clampedPersonalityStateFactor = Math.min(1.0, Math.max(0.1, personalityStateFactor));


        let finalLearningRate = knowledgeConfig.learningRate.baseLearningRate * traitModifiers * clampedPersonalityStateFactor * cognitiveLoadFactor;

        // Ensure learning rate is within reasonable bounds
        finalLearningRate = Math.min(knowledgeConfig.learningRate.maxLearningRate, Math.max(knowledgeConfig.learningRate.minLearningRate, finalLearningRate));

        return finalLearningRate;
    }

    /**
     * Updates a character's overall expertise level within a knowledge domain.
     * @param {string} characterId - The hex ID of the character.
     * @param {string} domainId - The hex ID of the knowledge domain.
     * @param {number} scoreIncrease - The amount to increase the expertise score by.
     * @returns {Promise<void>}
     */
    async updateCharacterDomainExpertise(characterId, domainId, scoreIncrease) {
        try {
            const currentExpertise = await knowledgeQueries.getCharacterDomainExpertise(characterId, domainId);
            let newExpertiseLevel = (currentExpertise ? currentExpertise.expertise_level : 0) + scoreIncrease;
            newExpertiseLevel = Math.min(100, Math.max(0, newExpertiseLevel)); // Clamp between 0 and 100

            await knowledgeQueries.upsertCharacterDomainExpertise({
                character_id: characterId,
                domain_id: domainId,
                expertise_level: newExpertiseLevel
            });
            console.log(`Character ${characterId} expertise in domain ${domainId} updated to ${newExpertiseLevel}.`);

            // Check for expertise level progression and potentially trigger TSE updates
            // e.g., if newExpertiseLevel crosses a threshold (e.g., 75 for 'Expert'), update 'Expertise Development' trait
            // this.traitManager.updateTrait(characterId, knowledgeConfig.traits.expertiseDevelopmentHex, someBonus);

        } catch (error) {
            console.error('Error updating character domain expertise:', error);
            throw error;
        }
    }

    /**
     * Helper to get or create a knowledge domain based on its name.
     * @param {string} domainName - The human-readable name of the domain.
     * @returns {Promise<string>} - The hex ID of the knowledge domain.
     */
    async getOrCreateKnowledgeDomain(domainName) {
        let domain = await knowledgeQueries.getKnowledgeDomainByName(domainName);
        if (domain) {
            return domain.domain_id;
        } else {
            const domainId = await generateHexId('knowledge_domains');
            await knowledgeQueries.insertKnowledgeDomain({
                domain_id: domainId,
                domain_name: domainName,
                description: `Automatically created domain for ${domainName}`
            });
            console.log(`Created new knowledge domain: ${domainName} (${domainId})`);
            return domainId;
        }
    }

    /**
     * Background task to process knowledge decay and schedule reviews.
     * This function should be called periodically by a cron job or similar.
     * @returns {Promise<void>}
     */
    async runBackgroundDecayAndReviewScheduler() {
        try {
            console.log('Running background decay and review scheduler...');
            const now = new Date();
            const characterKnowledgeStates = await knowledgeQueries.getKnowledgeItemsDueForReview(now);

            for (const state of characterKnowledgeStates) {
                const timeElapsed = (now.getTime() - state.last_review_timestamp.getTime()) / (1000 * 60 * 60 * 24); // days
                const currentRetrievability = this.memoryDecayCalculator.calculateRetrievability(state.stability, timeElapsed);

                // Update retrievability in DB
                await knowledgeQueries.updateCharacterKnowledgeRetrievability(state.character_id, state.knowledge_id, currentRetrievability);

                // If below forgetting threshold, mark as forgotten
                if (currentRetrievability < knowledgeConfig.memory.forgettingThreshold && !state.is_forgotten) {
                    await knowledgeQueries.markKnowledgeAsForgotten(characterId, state.knowledge_id, true);
                    console.log(`Knowledge item ${state.knowledge_id} marked as forgotten for character ${state.character_id} due to decay.`);
                }

                // If due for review, but not yet reviewed, schedule the next review based on current state
                // This is a fallback if a review event wasn't triggered by conversation
                if (now > state.next_review_timestamp) {
                    // For simplicity, we'll just update next_review_timestamp to prevent constant re-triggering
                    // A more sophisticated system might simulate a "failed recall" and update FSRS parameters.
                    const newNextReviewInterval = this.spacedRepetitionScheduler.calculateNextReviewInterval(
                        state.stability,
                        state.difficulty,
                        currentRetrievability,
                        knowledgeConfig.fsrs.fallbackReviewIntervalDays // Shorter interval for forgotten items
                    );
                    const newNextReviewTimestamp = new Date(now.getTime() + newNextReviewInterval * 24 * 60 * 60 * 1000);
                    await knowledgeQueries.updateCharacterKnowledgeNextReview(state.character_id, state.knowledge_id, newNextReviewTimestamp);
                }
            }
            console.log('Background decay and review scheduler finished.');
        } catch (error) {
            console.error('Error in background decay and review scheduler:', error);
        }
    }
}

export default KnowledgeAcquisitionEngine;

