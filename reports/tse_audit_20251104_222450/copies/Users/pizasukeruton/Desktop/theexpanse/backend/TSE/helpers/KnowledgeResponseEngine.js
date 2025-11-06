// backend/TSE/helpers/KnowledgeResponseEngine.js
// Trait-driven knowledge response system - WEIGHTED INFLUENCE DESIGN
// Preserves character depth through emergent trait combinations (1-270 traits)

import CharacterEngine from '../../engines/CharacterEngine_TEST.js';
import CognitiveLoadManager from '../../knowledge/CognitiveLoadManager.js';
import KnowledgeAcquisitionEngine from '../../knowledge/KnowledgeAcquisitionEngine.js';
import pool from '../../db/pool.js';

class KnowledgeResponseEngine {
    constructor() {
        this.cognitiveLoadManager = new CognitiveLoadManager();
        this.knowledgeAcquisitionEngine = new KnowledgeAcquisitionEngine();
        
        this.traitInfluenceMatrix = this.buildInfluenceMatrix();
        
        console.log('[KnowledgeResponseEngine] Initialized with weighted trait system');
    }

    buildInfluenceMatrix() {
        return {
            'intellig': { cognitive_intelligence: 1.0, cognitive_analyticalThinking: 0.4, behavioral_discipline: 0.3 },
            'cognit': { cognitive_intelligence: 0.8, cognitive_processingSpeed: 0.5, cognitive_focus: 0.3 },
            'memory': { cognitive_memory: 1.0, cognitive_focus: 0.4, behavioral_discipline: 0.2 },
            'recall': { cognitive_memory: 0.9, cognitive_processingSpeed: 0.3 },
            'focus': { cognitive_focus: 1.0, behavioral_discipline: 0.5, emotional_patience: 0.3 },
            'attention': { cognitive_focus: 0.9, cognitive_processingSpeed: 0.4, emotional_patience: 0.2 },
            'concentration': { cognitive_focus: 0.95, behavioral_discipline: 0.4, emotional_patience: 0.3 },
            'analyt': { cognitive_analyticalThinking: 1.0, cognitive_intelligence: 0.6, emotional_emotionalStability: 0.3 },
            'logic': { cognitive_analyticalThinking: 0.9, cognitive_intelligence: 0.5, behavioral_discipline: 0.3 },
            'reason': { cognitive_analyticalThinking: 0.85, cognitive_intelligence: 0.5, emotional_patience: 0.3 },
            'creativ': { cognitive_creativity: 1.0, cognitive_intelligence: 0.4, behavioral_riskTaking: 0.3 },
            'imagin': { cognitive_creativity: 0.9, emotional_curiosity: 0.5, behavioral_riskTaking: 0.2 },
            'innovat': { cognitive_creativity: 0.85, behavioral_riskTaking: 0.5, behavioral_adaptability: 0.4 },
            'process': { cognitive_processingSpeed: 1.0, cognitive_focus: 0.4, behavioral_impulsivity: 0.2 },
            'speed': { cognitive_processingSpeed: 0.8, behavioral_impulsivity: 0.3 },
            'quick': { cognitive_processingSpeed: 0.7, behavioral_impulsivity: 0.4, behavioral_riskTaking: 0.2 },
            'confid': { emotional_confidence: 1.0, social_communication: 0.5, behavioral_riskTaking: 0.4 },
            'self-esteem': { emotional_confidence: 0.9, emotional_emotionalStability: 0.4, social_trust: 0.3 },
            'anxiety': { emotional_anxiety: 1.0, emotional_emotionalStability: -0.6, social_socialAnxiety: 0.7 },
            'worry': { emotional_anxiety: 0.8, emotional_patience: -0.4, emotional_emotionalStability: -0.3 },
            'nervous': { emotional_anxiety: 0.7, social_socialAnxiety: 0.6, emotional_confidence: -0.3 },
            'patience': { emotional_patience: 1.0, emotional_emotionalStability: 0.5, behavioral_discipline: 0.4 },
            'calm': { emotional_patience: 0.8, emotional_emotionalStability: 0.7, emotional_anxiety: -0.5 },
            'frustrat': { emotional_frustrationTolerance: -1.0, emotional_patience: -0.6, emotional_anxiety: 0.4 },
            'irritab': { emotional_frustrationTolerance: -0.9, emotional_emotionalStability: -0.5, social_empathy: -0.3 },
            'stable': { emotional_emotionalStability: 1.0, emotional_confidence: 0.4, emotional_anxiety: -0.5 },
            'regulat': { emotional_emotionalStability: 0.8, behavioral_discipline: 0.5, cognitive_focus: 0.3 },
            'curios': { emotional_curiosity: 1.0, cognitive_creativity: 0.5, behavioral_riskTaking: 0.3 },
            'inquis': { emotional_curiosity: 0.9, cognitive_analyticalThinking: 0.4, behavioral_persistence: 0.3 },
            'wonder': { emotional_curiosity: 0.8, cognitive_creativity: 0.5, emotional_emotionalStability: 0.2 },
            'trust': { social_trust: 1.0, emotional_confidence: 0.4, social_collaboration: 0.5 },
            'empathy': { social_empathy: 1.0, social_communication: 0.6, emotional_emotionalStability: 0.4 },
            'compassion': { social_empathy: 0.9, social_trust: 0.4, emotional_confidence: 0.3 },
            'communicat': { social_communication: 1.0, emotional_confidence: 0.5, social_collaboration: 0.4 },
            'express': { social_communication: 0.8, emotional_confidence: 0.5, cognitive_creativity: 0.3 },
            'social': { social_socialAnxiety: 0.6, social_collaboration: 0.5, social_communication: 0.4 },
            'collaborat': { social_collaboration: 1.0, social_empathy: 0.5, social_trust: 0.4 },
            'teamwork': { social_collaboration: 0.9, social_communication: 0.5, social_empathy: 0.4 },
            'cooperat': { social_collaboration: 0.85, social_trust: 0.5, social_empathy: 0.3 },
            'independ': { social_independence: 1.0, emotional_confidence: 0.5, social_collaboration: -0.3 },
            'self-relian': { social_independence: 0.9, emotional_confidence: 0.6, behavioral_persistence: 0.4 },
            'autonom': { social_independence: 0.85, emotional_confidence: 0.5, behavioral_discipline: 0.3 },
            'persist': { behavioral_persistence: 1.0, behavioral_discipline: 0.6, emotional_patience: 0.5 },
            'determin': { behavioral_persistence: 0.9, behavioral_motivation: 0.6, emotional_confidence: 0.4 },
            'tenac': { behavioral_persistence: 0.95, behavioral_discipline: 0.5, emotional_patience: 0.4 },
            'impuls': { behavioral_impulsivity: 1.0, behavioral_riskTaking: 0.6, behavioral_discipline: -0.5 },
            'spontan': { behavioral_impulsivity: 0.8, cognitive_creativity: 0.4, behavioral_adaptability: 0.3 },
            'rash': { behavioral_impulsivity: 0.9, behavioral_riskTaking: 0.6, cognitive_analyticalThinking: -0.4 },
            'risk': { behavioral_riskTaking: 1.0, emotional_confidence: 0.5, behavioral_impulsivity: 0.4 },
            'adventur': { behavioral_riskTaking: 0.8, emotional_curiosity: 0.6, behavioral_adaptability: 0.4 },
            'daring': { behavioral_riskTaking: 0.9, emotional_confidence: 0.6, behavioral_impulsivity: 0.3 },
            'adapt': { behavioral_adaptability: 1.0, cognitive_creativity: 0.5, emotional_emotionalStability: 0.4 },
            'flexib': { behavioral_adaptability: 0.9, emotional_patience: 0.4, cognitive_processingSpeed: 0.3 },
            'versatil': { behavioral_adaptability: 0.85, cognitive_intelligence: 0.4, behavioral_persistence: 0.3 },
            'disciplin': { behavioral_discipline: 1.0, behavioral_persistence: 0.6, cognitive_focus: 0.5 },
            'organized': { behavioral_discipline: 0.8, cognitive_analyticalThinking: 0.4, emotional_emotionalStability: 0.3 },
            'structure': { behavioral_discipline: 0.7, cognitive_analyticalThinking: 0.5, behavioral_adaptability: -0.2 },
            'motivat': { behavioral_motivation: 1.0, behavioral_persistence: 0.6, emotional_confidence: 0.5 },
            'driven': { behavioral_motivation: 0.9, behavioral_discipline: 0.5, behavioral_persistence: 0.6 },
            'ambitious': { behavioral_motivation: 0.85, emotional_confidence: 0.5, behavioral_riskTaking: 0.4 }
        };
    }

    async initialize() {
        await this.knowledgeAcquisitionEngine.initialize();
        console.log('[KnowledgeResponseEngine] Ready for trait-based knowledge delivery');
    }

    async generateKnowledgeResponse(characterId, query, context = {}) {
        const startTime = Date.now();
        
        try {
            console.log(`[KnowledgeResponseEngine] Generating response for ${characterId}`);
            
            const characterEngine = new CharacterEngine(characterId);
            const characterData = await characterEngine.loadCharacter();
            
            const learningProfile = await this.analyzeTraitProfile(
                characterEngine.traits,
                characterEngine.metadata
            );
            
            const knowledgeNeeds = this.determineKnowledgeNeeds(
                characterEngine.traits,
                learningProfile,
                query
            );
            
            const cognitiveState = await this.cognitiveLoadManager.getCharacterCognitiveLoad(characterId);
            const learningCapacity = this.cognitiveLoadManager.getEffectiveWorkingMemoryCapacity(
                this.traitsToScoreMap(characterEngine.traits)
            );
            
            const relevantKnowledge = await this.knowledgeAcquisitionEngine.retrieveRelevantKnowledge(
                characterId,
                query,
                Math.min(learningCapacity, 5)
            );
            
            const shapedResponse = await this.shapeKnowledgeDelivery(
                relevantKnowledge,
                learningProfile,
                knowledgeNeeds,
                cognitiveState
            );
            
            await characterEngine.cleanup();
            
            console.log(`[KnowledgeResponseEngine] Response generated in ${Date.now() - startTime}ms`);
            
            return {
                knowledge: shapedResponse.content,
                deliveryStyle: shapedResponse.style,
                cognitiveLoad: cognitiveState.loadFactor,
                learningProfile: learningProfile,
                traitInfluences: shapedResponse.traitInfluences,
                processingTime: Date.now() - startTime,
                metadata: {
                    generatedBy: 'TSE-TraitDriven-KnowledgeEngine',
                    traitsAnalyzed: characterEngine.traits.size,
                    capacityUsed: `${cognitiveState.activeChunks.length}/${learningCapacity}`
                }
            };
            
        } catch (error) {
            console.error('[KnowledgeResponseEngine] Error:', error);
            throw error;
        }
    }

    async analyzeTraitProfile(traits, metadata) {
        const dimensionScores = {
            cognitive_intelligence: { weightedSum: 0, totalWeight: 0 },
            cognitive_memory: { weightedSum: 0, totalWeight: 0 },
            cognitive_focus: { weightedSum: 0, totalWeight: 0 },
            cognitive_analyticalThinking: { weightedSum: 0, totalWeight: 0 },
            cognitive_creativity: { weightedSum: 0, totalWeight: 0 },
            cognitive_processingSpeed: { weightedSum: 0, totalWeight: 0 },
            emotional_confidence: { weightedSum: 0, totalWeight: 0 },
            emotional_anxiety: { weightedSum: 0, totalWeight: 0 },
            emotional_patience: { weightedSum: 0, totalWeight: 0 },
            emotional_frustrationTolerance: { weightedSum: 0, totalWeight: 0 },
            emotional_emotionalStability: { weightedSum: 0, totalWeight: 0 },
            emotional_curiosity: { weightedSum: 0, totalWeight: 0 },
            social_trust: { weightedSum: 0, totalWeight: 0 },
            social_empathy: { weightedSum: 0, totalWeight: 0 },
            social_communication: { weightedSum: 0, totalWeight: 0 },
            social_socialAnxiety: { weightedSum: 0, totalWeight: 0 },
            social_collaboration: { weightedSum: 0, totalWeight: 0 },
            social_independence: { weightedSum: 0, totalWeight: 0 },
            behavioral_persistence: { weightedSum: 0, totalWeight: 0 },
            behavioral_impulsivity: { weightedSum: 0, totalWeight: 0 },
            behavioral_riskTaking: { weightedSum: 0, totalWeight: 0 },
            behavioral_adaptability: { weightedSum: 0, totalWeight: 0 },
            behavioral_discipline: { weightedSum: 0, totalWeight: 0 },
            behavioral_motivation: { weightedSum: 0, totalWeight: 0 }
        };

        console.log(`[KnowledgeResponseEngine] Analyzing ${traits.size} traits with weighted influence`);

        for (const [hex, trait] of traits) {
            const score = trait.score;
            const name = trait.name.toLowerCase();
            
            for (const [keyword, influences] of Object.entries(this.traitInfluenceMatrix)) {
                if (name.includes(keyword)) {
                    for (const [dimension, weight] of Object.entries(influences)) {
                        if (dimensionScores[dimension]) {
                            const contribution = score * weight;
                            dimensionScores[dimension].weightedSum += contribution;
                            dimensionScores[dimension].totalWeight += Math.abs(weight);
                        }
                    }
                }
            }
        }

        const profile = {
            characterId: metadata.character_id,
            characterName: metadata.character_name,
            category: metadata.category,
            totalTraitsAnalyzed: traits.size,
            cognitive: {},
            emotional: {},
            social: {},
            behavioral: {},
            emergentPatterns: [],
            dominantTraits: [],
            uniqueSignature: null
        };

        for (const [dimension, accumulator] of Object.entries(dimensionScores)) {
            const [category, trait] = dimension.split('_');
            
            if (accumulator.totalWeight > 0) {
                const score = accumulator.weightedSum / accumulator.totalWeight;
                profile[category][trait] = Math.max(0, Math.min(100, score));
            } else {
                profile[category][trait] = 50;
            }
        }

        profile.overallLearningCapacity = this.calculateLearningCapacity(profile);
        profile.preferredLearningStyle = this.determineLearningStyle(profile);
        profile.knowledgeMotivation = this.determineKnowledgeMotivation(profile);
        profile.deliveryPreference = this.determineDeliveryPreference(profile);
        profile.emergentPatterns = this.detectEmergentPatterns(profile, traits);
        profile.dominantTraits = this.identifyDominantTraits(traits);
        profile.uniqueSignature = this.generateUniqueSignature(profile, traits);

        console.log(`[KnowledgeResponseEngine] Profile complete: ${profile.emergentPatterns.length} emergent patterns detected`);

        return profile;
    }

    calculateLearningCapacity(profile) {
        const cognitiveScore = this.averageObject(profile.cognitive);
        const emotionalScore = this.averageObject(profile.emotional);
        const emotionalStabilityFactor = profile.emotional.emotionalStability / 100;
        const anxietyPenalty = profile.emotional.anxiety / 100;
        
        return (cognitiveScore * 0.6 + emotionalScore * 0.4) * emotionalStabilityFactor * (1 - anxietyPenalty * 0.3);
    }

    detectEmergentPatterns(profile, traits) {
        const patterns = [];
        
        if (profile.cognitive.intelligence > 75 && profile.emotional.anxiety > 70) {
            patterns.push({
                name: 'anxious_genius',
                description: 'High intelligence but learning blocked by anxiety',
                impact: 'Needs reassurance and indirect teaching',
                strength: 0.8
            });
        }
        
        if (profile.cognitive.creativity > 75 && profile.behavioral.impulsivity > 70) {
            patterns.push({
                name: 'impulsive_creator',
                description: 'Creative bursts but struggles with structured learning',
                impact: 'Responds well to open-ended exploration',
                strength: 0.85
            });
        }
        
        if (profile.cognitive.analyticalThinking > 75 && profile.social.collaboration < 30) {
            patterns.push({
                name: 'analytical_isolate',
                description: 'Prefers data over social learning',
                impact: 'Seeks pure facts, avoids emotional content',
                strength: 0.9
            });
        }
        
        if (profile.emotional.curiosity > 70 && profile.social.socialAnxiety > 65) {
            patterns.push({
                name: 'curious_cautious',
                description: 'Wants knowledge but needs safe environment',
                impact: 'Indirect teaching and gentle encouragement required',
                strength: 0.75
            });
        }
        
        if (profile.behavioral.discipline > 70 && profile.behavioral.persistence > 70 && profile.cognitive.memory > 70) {
            patterns.push({
                name: 'disciplined_learner',
                description: 'Structured, methodical approach to learning',
                impact: 'Excels with systematic knowledge delivery',
                strength: 0.95
            });
        }
        
        if (profile.behavioral.discipline > 75 && profile.emotional.anxiety > 70 && profile.emotional.frustrationTolerance < 40) {
            patterns.push({
                name: 'overwhelmed_perfectionist',
                description: 'High standards create learning paralysis',
                impact: 'Needs simplified, achievable goals',
                strength: 0.7
            });
        }
        
        return patterns;
    }

    identifyDominantTraits(traits) {
        const sortedTraits = Array.from(traits.entries())
            .map(([hex, trait]) => ({ hex, name: trait.name, score: trait.score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.max(3, Math.ceil(traits.size * 0.1)));
        
        return sortedTraits;
    }

    generateUniqueSignature(profile, traits) {
        const signature = {
            learningArchetype: 'unknown',
            primaryMotivation: 'unknown',
            cognitiveStyle: 'unknown',
            emotionalPattern: 'unknown'
        };
        
        const cogAvg = this.averageObject(profile.cognitive);
        const socAvg = this.averageObject(profile.social);
        
        if (cogAvg > 70 && socAvg < 40) {
            signature.learningArchetype = 'solitary_scholar';
        } else if (socAvg > 70 && cogAvg > 60) {
            signature.learningArchetype = 'collaborative_learner';
        } else if (profile.cognitive.creativity > 75) {
            signature.learningArchetype = 'creative_explorer';
        } else if (profile.behavioral.discipline > 75) {
            signature.learningArchetype = 'systematic_practitioner';
        } else {
            signature.learningArchetype = 'adaptive_generalist';
        }
        
        return signature;
    }

    determineKnowledgeNeeds(traits, learningProfile, query) {
        const needs = {
            seekingType: 'general',
            emotionalContext: 'neutral',
            urgency: 'normal',
            depth: 'moderate',
            preferredFormat: 'balanced',
            emergentFactors: []
        };
        
        for (const pattern of learningProfile.emergentPatterns) {
            needs.emergentFactors.push(pattern.name);
            
            switch(pattern.name) {
                case 'anxious_genius':
                    needs.emotionalContext = 'reassuring';
                    needs.preferredFormat = 'indirect';
                    break;
                case 'analytical_isolate':
                    needs.seekingType = 'factual';
                    needs.emotionalContext = 'detached';
                    needs.preferredFormat = 'data-driven';
                    break;
                case 'curious_cautious':
                    needs.seekingType = 'exploration';
                    needs.emotionalContext = 'gentle';
                    needs.preferredFormat = 'exploratory';
                    break;
            }
        }
        
        if (learningProfile.dominantTraits.length > 0) {
            const topTrait = learningProfile.dominantTraits[0];
            if (topTrait.name.toLowerCase().includes('anger')) {
                needs.seekingType = 'power';
                needs.urgency = 'high';
            }
        }
        
        return needs;
    }

    async shapeKnowledgeDelivery(knowledge, learningProfile, knowledgeNeeds, cognitiveState) {
        if (!knowledge || knowledge.length === 0) {
            return {
                content: "No relevant knowledge found.",
                style: "neutral",
                traitInfluences: []
            };
        }
        
        let content = "";
        let style = "neutral";
        const traitInfluences = [];
        
        for (const pattern of learningProfile.emergentPatterns) {
            traitInfluences.push({
                pattern: pattern.name,
                impact: pattern.impact,
                strength: pattern.strength
            });
        }
        
        switch(knowledgeNeeds.emotionalContext) {
            case 'reassuring':
                style = "gentle_supportive";
                content = this.formatReasssuringStyle(knowledge);
                break;
            case 'detached':
                style = "factual_clinical";
                content = this.formatFactualStyle(knowledge);
                break;
            case 'gentle':
                style = "exploratory_inviting";
                content = this.formatGentleStyle(knowledge);
                break;
            default:
                style = "balanced";
                content = this.formatBalancedStyle(knowledge);
        }
        
        if (cognitiveState.loadFactor > 0.8) {
            content = this.simplifyForOverload(content);
            style += "_simplified";
            traitInfluences.push({
                pattern: 'cognitive_overload',
                impact: 'Content simplified due to high cognitive load',
                strength: cognitiveState.loadFactor
            });
        }
        
        return { content, style, traitInfluences };
    }

    formatReasssuringStyle(knowledge) {
        return knowledge.map(k => `You might find this helpful: ${k.content}`).join('\n\n');
    }

    formatFactualStyle(knowledge) {
        return knowledge.map((k, i) => `[Fact ${i + 1}] ${k.content}`).join('\n');
    }

    formatGentleStyle(knowledge) {
        return knowledge.map(k => `Consider exploring: ${k.content}`).join('\n\n');
    }

    formatBalancedStyle(knowledge) {
        return knowledge.map(k => k.content).join('\n\n');
    }

    simplifyForOverload(content) {
        const firstSection = content.split('\n\n')[0];
        return `${firstSection}\n\n[Cognitive capacity reached. Additional information available when ready.]`;
    }

    determineLearningStyle(profile) {
        const cogAvg = this.averageObject(profile.cognitive);
        const socAvg = this.averageObject(profile.social);
        
        if (profile.cognitive.analyticalThinking > 70 && socAvg < 40) return 'analytical_solitary';
        if (profile.cognitive.creativity > 70 && profile.behavioral.adaptability > 60) return 'creative_flexible';
        if (socAvg > 70 && profile.social.collaboration > 65) return 'collaborative_social';
        if (profile.social.independence > 70 && cogAvg > 60) return 'independent_structured';
        return 'mixed_adaptive';
    }

    determineKnowledgeMotivation(profile) {
        if (profile.emotional.curiosity > 75) return 'curiosity_driven';
        if (profile.behavioral.motivation > 75) return 'goal_oriented';
        if (profile.social.trust < 30 && profile.emotional.anxiety > 60) return 'self_protection';
        if (profile.behavioral.discipline > 70) return 'mastery_focused';
        return 'practical_application';
    }

    determineDeliveryPreference(profile) {
        if (profile.social.socialAnxiety > 70) return 'indirect_gentle';
        if (profile.social.communication > 70 && profile.social.empathy > 60) return 'conversational_empathetic';
        if (profile.cognitive.analyticalThinking > 75) return 'structured_logical';
        if (profile.cognitive.creativity > 70) return 'exploratory_open';
        return 'flexible_adaptive';
    }

    averageObject(obj) {
        const values = Object.values(obj).filter(v => typeof v === 'number');
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 50;
    }

    traitsToScoreMap(traits) {
        const scoreMap = {};
        for (const [hex, trait] of traits) {
            scoreMap[hex] = trait.score;
        }
        return scoreMap;
    }
}

export default KnowledgeResponseEngine;
