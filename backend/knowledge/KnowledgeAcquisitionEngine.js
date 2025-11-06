// backend/knowledge/KnowledgeAcquisitionEngine.js

import knowledgeQueries from '../db/knowledgeQueries.js';
import MemoryDecayCalculator from './MemoryDecayCalculator.js';
import CognitiveLoadManager from './CognitiveLoadManager.js';
import SpacedRepetitionScheduler from './SpacedRepetitionScheduler.js';
import KnowledgeTransferManager from './KnowledgeTransferManager.js';
import EmptySlotPopulator from './EmptySlotPopulator.js';
import TraitManager from '../traits/TraitManager.js';
import knowledgeConfig from '../../config/knowledgeConfig.js';
import generateHexId from '../utils/hexIdGenerator.js';
import pool from '../db/pool.js';

class KnowledgeAcquisitionEngine {
    constructor() {
        this.memoryDecayCalculator = new MemoryDecayCalculator();
        this.cognitiveLoadManager = new CognitiveLoadManager();
        this.spacedRepetitionScheduler = new SpacedRepetitionScheduler();
        this.knowledgeTransferManager = new KnowledgeTransferManager();
        this.emptySlotPopulator = new EmptySlotPopulator();
        this.traitManager = TraitManager;
        
        this.stopWords = new Set([
            'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
            'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
            'can', 'could', 'did', 'do', 'does', 'doing', 'down', 'during',
            'each', 'few', 'for', 'from', 'further',
            'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
            'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
            'just', 'me', 'more', 'most', 'my', 'myself',
            'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
            'same', 'she', 'should', 'so', 'some', 'such',
            'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
            'under', 'until', 'up', 'very',
            'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would',
            'you', 'your', 'yours', 'yourself', 'yourselves'
        ]);
        
        console.log('[KnowledgeAcquisitionEngine] Initialized with JavaScript semantic search');
    }

    async initialize() {
        console.log('KnowledgeAcquisitionEngine initialized.');
    }

    extractKeywords(text) {
        if (!text || typeof text !== 'string') return [];
        
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !this.stopWords.has(word));
        
        const uniqueKeywords = [...new Set(words)];
        
        console.log(`[KnowledgeAcquisitionEngine] Extracted keywords: ${JSON.stringify(uniqueKeywords)}`);
        
        return uniqueKeywords;
    }

    calculateRelevanceScore(item, keywords) {
        if (!keywords || keywords.length === 0) return 0;
        
        let score = 0;
        const content = (item.content || '').toLowerCase();
        const domain = (item.domain_name || '').toLowerCase();
        
        for (const keyword of keywords) {
            const contentMatches = (content.match(new RegExp(keyword, 'gi')) || []).length;
            score += Math.min(50, contentMatches * 25);
            
            if (domain.includes(keyword)) {
                score += 30;
            }
        }
        
        return Math.min(100, score);
    }

    async retrieveRelevantKnowledge(characterId, conversationContext, limit = 5) {
        try {
            console.log(`[KnowledgeAcquisitionEngine] Retrieving knowledge for ${characterId}: "${conversationContext.substring(0, 50)}..."`);
            
            const keywords = this.extractKeywords(conversationContext);
            
            if (keywords.length === 0) {
                console.warn('[KnowledgeAcquisitionEngine] No keywords extracted, returning empty results');
                return [];
            }
            
            const searchConditions = keywords.map((keyword, index) => {
                return `(
                    ki.content ILIKE $${index + 1} OR
                    kd.domain_name ILIKE $${index + 1}
                )`;
            }).join(' OR ');
            
            const searchValues = keywords.map(kw => `%${kw}%`);
            
            const query = `
                SELECT 
                    ki.knowledge_id,
                    ki.content,
                    ki.domain_id,
                    kd.domain_name,
                    ki.source_type,
                    ki.complexity_score,
                    ki.acquisition_timestamp
                FROM knowledge_items ki
                LEFT JOIN knowledge_domains kd ON ki.domain_id = kd.domain_id
                WHERE (${searchConditions})
                ORDER BY ki.acquisition_timestamp DESC
                LIMIT ${limit * 3};
            `;
            
            console.log(`[KnowledgeAcquisitionEngine] Searching knowledge_items with ${keywords.length} keywords`);
            
            const result = await pool.query(query, searchValues);
            
            if (result.rows.length === 0) {
                console.log('[KnowledgeAcquisitionEngine] No matching knowledge items found');
                return [];
            }
            
            console.log(`[KnowledgeAcquisitionEngine] Found ${result.rows.length} potential matches`);
            
            const scoredItems = result.rows.map(item => {
                const relevanceScore = this.calculateRelevanceScore(item, keywords);
                return {
                    ...item,
                    relevanceScore
                };
            });
            
            scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);
            
            const relevantItems = scoredItems
                .filter(item => item.relevanceScore >= 20)
                .slice(0, limit);
            
            console.log(`[KnowledgeAcquisitionEngine] Returning ${relevantItems.length} relevant items`);
            relevantItems.forEach(item => {
                const preview = item.content.substring(0, 50);
                console.log(`  - "${preview}..." (score: ${item.relevanceScore})`);
            });
            
            await this.persistLearningEvent(characterId, relevantItems);
            
            return relevantItems;
            
        } catch (error) {
            console.error('[KnowledgeAcquisitionEngine] Error retrieving knowledge:', error);
            throw error;
        }
    }

    async persistLearningEvent(characterId, knowledgeItems) {
        try {
            const now = new Date();
            
            for (const item of knowledgeItems) {
                const initialRetrievability = item.relevanceScore / 100;
                
                const nextReviewDays = this.spacedRepetitionScheduler.calculateNextReviewInterval(
                    knowledgeConfig.fsrs.defaultStability,
                    knowledgeConfig.fsrs.defaultDifficulty,
                    initialRetrievability,
                    knowledgeConfig.fsrs.initialReviewIntervalDays || 1
                );
                
                const nextReviewTimestamp = new Date(now.getTime() + nextReviewDays * 24 * 60 * 60 * 1000);
                
                await knowledgeQueries.upsertCharacterKnowledgeState({
                    character_id: characterId,
                    knowledge_id: item.knowledge_id,
                    current_retrievability: initialRetrievability,
                    stability: knowledgeConfig.fsrs.defaultStability,
                    difficulty: knowledgeConfig.fsrs.defaultDifficulty,
                    last_review_timestamp: now,
                    next_review_timestamp: nextReviewTimestamp,
                    acquisition_method: 'retrieval',
                    current_expertise_score: initialRetrievability * 100
                });
                
                await knowledgeQueries.insertKnowledgeReviewLog({
                    log_id: await generateHexId('aok_review'),
                    character_id: characterId,
                    knowledge_id: item.knowledge_id,
                    grade: 3,
                    previous_interval: 0,
                    new_interval: nextReviewDays,
                    retrievability_at_review: initialRetrievability
                });
            }
            
            console.log(`[KnowledgeAcquisitionEngine] Persisted ${knowledgeItems.length} learning events for ${characterId}`);
            
        } catch (error) {
            console.error('[KnowledgeAcquisitionEngine] Error persisting learning event:', error);
        }
    }

    async ingestNewKnowledge(characterId, rawContent, sourceType) {
        try {
            console.log(`Ingesting new knowledge for character ${characterId} from source: ${sourceType}`);
            console.warn('[KnowledgeAcquisitionEngine] ingestNewKnowledge requires migration');
            return [];
        } catch (error) {
            console.error('Error ingesting new knowledge:', error);
            throw error;
        }
    }

    async handleKnowledgeReview(characterId, knowledgeId, grade) {
        try {
            console.log(`Handling review for character ${characterId}, knowledge ${knowledgeId} with grade ${grade}.`);
            const knowledgeState = await knowledgeQueries.getSingleCharacterKnowledgeState(characterId, knowledgeId);
            if (!knowledgeState) {
                console.warn(`Knowledge state not found for character ${characterId} and knowledge ${knowledgeId}. Cannot review.`);
                return;
            }

            // const characterTraitScores = await this.traitManager.getTraitVector(characterId);

            const { newStability, newDifficulty, newIntervalDays } = this.spacedRepetitionScheduler.calculateFSRSUpdate(
                knowledgeState.stability,
                knowledgeState.difficulty,
                knowledgeState.current_retrievability,
                grade,
                null
            );

            const now = new Date();
            const newNextReviewTimestamp = new Date(now.getTime() + newIntervalDays * 24 * 60 * 60 * 1000);

            await knowledgeQueries.updateCharacterKnowledgeStateAfterReview({
                character_id: characterId,
                knowledge_id: knowledgeId,
                current_retrievability: 1.0,
                stability: newStability,
                difficulty: newDifficulty,
                last_review_timestamp: now,
                next_review_timestamp: newNextReviewTimestamp,
                is_forgotten: false
            });

            await knowledgeQueries.insertKnowledgeReviewLog({
                log_id: await generateHexId('aok_review'),
                character_id: characterId,
                knowledge_id: knowledgeId,
                grade: grade,
                previous_interval: (now.getTime() - knowledgeState.last_review_timestamp.getTime()) / (1000 * 60 * 60 * 24),
                new_interval: newIntervalDays,
                retrievability_at_review: knowledgeState.current_retrievability
            });

            const expertiseIncrease = knowledgeConfig.expertise.reviewSuccessBonus * (grade / 4);
            await this.updateCharacterDomainExpertise(characterId, knowledgeState.domain_id, expertiseIncrease);

            console.log(`Review complete for knowledge ${knowledgeId}. New interval: ${newIntervalDays} days.`);

        } catch (error) {
            console.error('Error handling knowledge review:', error);
            throw error;
        }
    }

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

                await this.updateCharacterDomainExpertise(receiverCharacterId, knowledgeItem.domain_id, initialStrengthForReceiver * 100);
            }

            await knowledgeQueries.insertKnowledgeTransferLog({
                transfer_id: await generateHexId('transfer_id'),
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

    calculateLearningRate(characterTraitScores, cognitiveLoadFactor) {
        let traitModifiers = 1.0;

        const opennessScore = characterTraitScores[knowledgeConfig.traits.opennessHex] || 50;
        const conscientiousnessScore = characterTraitScores[knowledgeConfig.traits.conscientiousnessHex] || 50;
        const neuroticismScore = characterTraitScores[knowledgeConfig.traits.neuroticismHex] || 50;

        traitModifiers *= (1 + (opennessScore / 100) * knowledgeConfig.learningRate.opennessLearningBonusFactor);
        traitModifiers *= (1 + (conscientiousnessScore / 100) * knowledgeConfig.learningRate.conscientiousnessLearningBonusFactor);
        traitModifiers *= (1 - (neuroticismScore / 100) * knowledgeConfig.learningRate.neuroticismLearningPenaltyFactor);

        traitModifiers = Math.min(knowledgeConfig.learningRate.maxTraitModifier, Math.max(knowledgeConfig.learningRate.minTraitModifier, traitModifiers));

        const emotionalRegulation = characterTraitScores[knowledgeConfig.traits.emotionalRegulationHex] || 50;
        const stressManagement = characterTraitScores[knowledgeConfig.traits.stressManagementHex] || 50;
        const personalityStateFactor = (emotionalRegulation / 100 * 0.5) + (stressManagement / 100 * 0.5);
        const clampedPersonalityStateFactor = Math.min(1.0, Math.max(0.1, personalityStateFactor));

        let finalLearningRate = knowledgeConfig.learningRate.baseLearningRate * traitModifiers * clampedPersonalityStateFactor * cognitiveLoadFactor;

        finalLearningRate = Math.min(knowledgeConfig.learningRate.maxLearningRate, Math.max(knowledgeConfig.learningRate.minLearningRate, finalLearningRate));

        return finalLearningRate;
    }

    async updateCharacterDomainExpertise(characterId, domainId, scoreIncrease) {
        try {
            const currentExpertise = await knowledgeQueries.getCharacterDomainExpertise(characterId, domainId);
            let newExpertiseLevel = (currentExpertise ? currentExpertise.expertise_level : 0) + scoreIncrease;
            newExpertiseLevel = Math.min(100, Math.max(0, newExpertiseLevel));

            await knowledgeQueries.upsertCharacterDomainExpertise({
                character_id: characterId,
                domain_id: domainId,
                expertise_level: newExpertiseLevel
            });
            console.log(`Character ${characterId} expertise in domain ${domainId} updated to ${newExpertiseLevel}.`);

        } catch (error) {
            console.error('Error updating character domain expertise:', error);
            throw error;
        }
    }

    async getOrCreateKnowledgeDomain(domainName) {
        let domain = await knowledgeQueries.getKnowledgeDomainByName(domainName);
        if (domain) {
            return domain.domain_id;
        } else {
            const domainId = await generateHexId('domain_id');
            await knowledgeQueries.insertKnowledgeDomain({
                domain_id: domainId,
                domain_name: domainName,
                description: `Automatically created domain for ${domainName}`
            });
            console.log(`Created new knowledge domain: ${domainName} (${domainId})`);
            return domainId;
        }
    }

    async runBackgroundDecayAndReviewScheduler() {
        try {
            console.log('Running background decay and review scheduler...');
            const now = new Date();
            const characterKnowledgeStates = await knowledgeQueries.getKnowledgeItemsDueForReview(now);

            for (const state of characterKnowledgeStates) {
                const timeElapsed = (now.getTime() - state.last_review_timestamp.getTime()) / (1000 * 60 * 60 * 24);
                const currentRetrievability = this.memoryDecayCalculator.calculateRetrievability(state.stability, timeElapsed);

                await knowledgeQueries.updateCharacterKnowledgeRetrievability(state.character_id, state.knowledge_id, currentRetrievability);

                if (currentRetrievability < knowledgeConfig.memory.forgettingThreshold && !state.is_forgotten) {
                    await knowledgeQueries.markKnowledgeAsForgotten(state.character_id, state.knowledge_id, true);
                    console.log(`Knowledge item ${state.knowledge_id} marked as forgotten for character ${state.character_id} due to decay.`);
                }

                if (now > state.next_review_timestamp) {
                    const newNextReviewInterval = this.spacedRepetitionScheduler.calculateNextReviewInterval(
                        state.stability,
                        state.difficulty,
                        currentRetrievability,
                        knowledgeConfig.fsrs.fallbackReviewIntervalDays
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
