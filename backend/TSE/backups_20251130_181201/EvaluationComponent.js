// backend/TSE/EvaluationComponent.js

import LearningDatabase from './LearningDatabase.js';
import PerformanceMonitor from './PerformanceMonitor.js';
import knowledgeQueries from '../db/knowledgeQueries.js';

class EvaluationComponent {
    constructor(pool, learningDatabase, performanceMonitor) {
        this.pool = pool;
        this.learningDatabase = learningDatabase;
        this.performanceMonitor = performanceMonitor;
    }

    async performAnalysis(cycle_id, teacher_record_id, student_record_id, evaluation_sequence) {
        try {
            const cycleData = await this._fetchCycleData(cycle_id);
            const teacherRecord = await this._fetchTeacherRecord(teacher_record_id);
            const studentRecord = await this._fetchStudentRecord(student_record_id);

            if (!cycleData) throw new Error(`Cycle ${cycle_id} not found`);
            if (!teacherRecord) throw new Error(`Teacher record ${teacher_record_id} not found`);
            if (!studentRecord) throw new Error(`Student record ${student_record_id} not found`);

            const effectivenessScore = this._calculateEffectivenessScore(studentRecord);
            const efficiencyScore = this._calculateEfficiencyScore(studentRecord);
            const innovationScore = this._calculateInnovationScore(studentRecord);
            const culturalScore = this._calculateCulturalScore(studentRecord);

            const varianceAnalysis = this._generateVarianceAnalysis(teacherRecord, studentRecord);
            const patternIdentification = this._generatePatternIdentification(cycleData, teacherRecord, studentRecord);

            const correlationInsights = this._generateCorrelationInsights(effectivenessScore, efficiencyScore, innovationScore, culturalScore);
            const algorithmOptimizations = this._generateAlgorithmOptimizations(effectivenessScore, efficiencyScore, innovationScore, culturalScore);
            const weightAdjustments = this._generateWeightAdjustments(effectivenessScore, efficiencyScore, innovationScore, culturalScore);
            const philosophyImprovements = this._generatePhilosophyImprovements(teacherRecord, studentRecord, culturalScore);
            const learningRecommendations = this._generateLearningRecommendations(effectivenessScore, efficiencyScore, innovationScore, culturalScore, cycleData);

            const evaluationData = {
                cycle_id: cycle_id,
                teacher_record_id: teacher_record_id,
                student_record_id: student_record_id,
                evaluation_sequence: evaluation_sequence,
                effectiveness_score: effectivenessScore,
                efficiency_score: efficiencyScore,
                innovation_score: innovationScore,
                cultural_score: culturalScore,
                variance_analysis: varianceAnalysis,
                pattern_identification: patternIdentification,
                correlation_insights: correlationInsights,
                algorithm_optimizations: algorithmOptimizations,
                weight_adjustments: weightAdjustments,
                philosophy_improvements: philosophyImprovements,
                learning_recommendations: learningRecommendations
            };

            const evaluationRecord = await this.learningDatabase.recordEvaluationData(evaluationData);
            const weightedScore = this._calculateWeightedScore(effectivenessScore, efficiencyScore, innovationScore, culturalScore);

            await this._updateKnowledgeFromEvaluation(cycleData, teacherRecord, weightedScore);

            return {
                record_id: evaluationRecord.record_id,
                cycle_id: cycle_id,
                teacher_record_id: teacher_record_id,
                student_record_id: student_record_id,
                effectiveness_score: effectivenessScore,
                efficiency_score: efficiencyScore,
                innovation_score: innovationScore,
                cultural_score: culturalScore,
                score: weightedScore,
                variance_analysis: varianceAnalysis,
                pattern_identification: patternIdentification,
                correlation_insights: correlationInsights,
                timestamp_evaluated: evaluationRecord.timestamp_evaluated
            };
        } catch (error) {
            console.error('EvaluationComponent.performAnalysis failed:', error);
            throw error;
        }
    }

    async _fetchCycleData(cycle_id) {
        const query = 'SELECT * FROM tse_cycles WHERE cycle_id = $1';
        const result = await this.pool.query(query, [cycle_id]);
        return result.rows[0] || null;
    }

    async _fetchTeacherRecord(teacher_record_id) {
        const query = 'SELECT * FROM tse_teacher_records WHERE record_id = $1';
        const result = await this.pool.query(query, [teacher_record_id]);
        return result.rows[0] || null;
    }

    async _fetchStudentRecord(student_record_id) {
        const query = 'SELECT * FROM tse_student_records WHERE record_id = $1';
        const result = await this.pool.query(query, [student_record_id]);
        return result.rows[0] || null;
    }

    async _updateKnowledgeFromEvaluation(cycleData, teacherRecord, weightedScore) {
        try {
            if (!cycleData || !teacherRecord) return;

            const metadata = cycleData.metadata || {};
            const inputParams = teacherRecord.input_parameters || {};

            const characterId = metadata.character_id || metadata.characterId || inputParams.character_id || inputParams.characterId;
            const knowledgeId = inputParams.knowledgeId || inputParams.lessonId;

            if (!characterId || !knowledgeId) return;
        
            const now = new Date();
            const nowIso = now.toISOString();

            const upsertData = {
                character_id: characterId,
                knowledge_id: knowledgeId,
                current_retrievability: 1.0,
                stability: 3.0,
                difficulty: 5.0,
                last_review_timestamp: nowIso,
                next_review_timestamp: nowIso,
                acquisition_method: 'tse_evaluation',
                current_expertise_score: weightedScore
            };

            await knowledgeQueries.upsertCharacterKnowledgeState(upsertData);

            const reviewLogData = {
                log_id: '#000000',
                character_id: characterId,
                knowledge_id: knowledgeId,
                grade: Math.round(weightedScore * 5),
                previous_interval: 0,
                new_interval: 1,
                retrievability_at_review: 1.0
            };

        } catch (error) {
            console.error('EvaluationComponent._updateKnowledgeFromEvaluation failed:', error);
        }
    }

    _calculateEffectivenessScore(studentRecord) {
        const successMetrics = studentRecord.success_metrics || {};
        const taskClarity = parseFloat(successMetrics.task_clarity) || 0.0;
        const lessonPresented = successMetrics.lesson_presented ? 1.0 : 0.0;
        const effectiveness = (taskClarity + lessonPresented) / 2;
        return Math.min(Math.max(effectiveness, 0.0), 1.0);
    }

    _calculateEfficiencyScore(studentRecord) {
        const successMetrics = studentRecord.success_metrics || {};
        const qualityIndicators = studentRecord.quality_indicators || {};
        const booleanChecks = [
            successMetrics.prompt_delivered === true,
            qualityIndicators.input_prepared === true,
            qualityIndicators.task_readiness === true,
            qualityIndicators.awaiting_character_response === true
        ];
        const trueCount = booleanChecks.filter(val => val).length;
        const efficiency = trueCount / booleanChecks.length;
        return Math.min(Math.max(efficiency, 0.0), 1.0);
    }

    _calculateInnovationScore(studentRecord) {
        const unexpectedOutcomes = Array.isArray(studentRecord.unexpected_outcomes) ? studentRecord.unexpected_outcomes : [];
        const innovationOpportunities = Array.isArray(studentRecord.innovation_opportunities) ? studentRecord.innovation_opportunities : [];
        const innovationCount = unexpectedOutcomes.length + innovationOpportunities.length;
        const innovation = innovationCount / 2;
        return Math.min(innovation, 1.0);
    }

    _calculateCulturalScore(studentRecord) {
        const characterSimilarity = parseFloat(studentRecord.character_similarity_accuracy) || 0.0;
        return Math.min(Math.max(characterSimilarity, 0.0), 1.0);
    }

    _generateVarianceAnalysis(teacherRecord, studentRecord) {
        const predictedOutcomes = teacherRecord.predicted_outcomes || {};
        const realWorldOutcome = studentRecord.real_world_outcome || {};
        return {
            predicted_vs_actual: {
                predicted_learning_impact: predictedOutcomes.learning_impact || 'unknown',
                predicted_retention: predictedOutcomes.expected_retention || 'unknown',
                actual_status: realWorldOutcome.status || 'unknown',
                actual_outcome_type: realWorldOutcome.outcome_type || 'unknown'
            },
            outcome_status: realWorldOutcome.status || 'unknown',
            alignment_observed: this._assessOutcomeAlignment(predictedOutcomes, realWorldOutcome)
        };
    }

    _assessOutcomeAlignment(predicted, actual) {
        if (predicted.learning_impact === 'positive' && actual.status !== 'awaiting_response') {
            return 'aligned_positive';
        } else if (predicted.learning_impact === 'positive' && actual.status === 'awaiting_response') {
            return 'partial_alignment';
        }
        return 'needs_assessment';
    }

    _generatePatternIdentification(cycleData, teacherRecord, studentRecord) {
        const metadata = cycleData.metadata || {};
        const algorithmDecision = teacherRecord.algorithm_decision || {};
        const userEngagement = studentRecord.user_engagement || {};
        return {
            domain: metadata.domain || 'unknown',
            module: metadata.module || 'unknown',
            engagement_type: userEngagement.engagement_type || 'unknown',
            lesson_type: userEngagement.lesson_type || 'unknown',
            task_type_id: algorithmDecision.taskTypeId || 'unknown',
            algorithm_action: algorithmDecision.action || 'unknown',
            character_id: metadata.characterId || 'unknown'
        };
    }

    _generateCorrelationInsights(effectiveness, efficiency, innovation, cultural) {
        return {
            effectiveness_efficiency_correlation: this._assessCorrelation(effectiveness, efficiency),
            innovation_in_high_clarity: innovation > 0.0 && effectiveness > 0.8 ? 'creativity_with_clarity' : 'clarity_without_innovation',
            character_alignment_impact: cultural > 0.8 ? 'strong_cultural_foundation' : 'cultural_alignment_needed',
            overall_performance_pattern: this._assessPerformancePattern(effectiveness, efficiency, innovation, cultural)
        };
    }

    _assessCorrelation(score1, score2) {
        const difference = Math.abs(score1 - score2);
        if (difference < 0.2) return 'strong_positive_correlation';
        if (difference < 0.4) return 'moderate_correlation';
        return 'weak_correlation';
    }

    _assessPerformancePattern(eff, effic, inn, cult) {
        const average = (eff + effic + inn + cult) / 4;
        if (average >= 0.8) return 'high_performing';
        if (average >= 0.6) return 'solid_performance';
        if (average >= 0.4) return 'developing_performance';
        return 'needs_improvement';
    }

    _generateAlgorithmOptimizations(effectiveness, efficiency, innovation, cultural) {
        const optimizations = [];
        if (effectiveness < 0.7) optimizations.push('Increase task clarity in lesson design');
        if (efficiency < 0.7) optimizations.push('Reduce prompt complexity for faster delivery');
        if (cultural < 0.7) optimizations.push('Review character context alignment in teacher decisions');
        if (innovation === 0.0) optimizations.push('Provide structured opportunities for creative student responses');
        if (effectiveness >= 0.8 && efficiency >= 0.8) optimizations.push('Maintain current lesson structure - strong performance observed');
        return optimizations;
    }

    _generateWeightAdjustments() {
        return {
            effectiveness_weight: 0.4,
            efficiency_weight: 0.2,
            innovation_weight: 0.1,
            cultural_weight: 0.3,
            reasoning: {
                effectiveness_weight: 'Highest priority - must match teacher intent',
                efficiency_weight: 'Medium priority - supports learning velocity',
                innovation_weight: 'Lower priority - bonus for creative thinking',
                cultural_weight: 'High priority - character context critical for immersion'
            }
        };
    }

    _generatePhilosophyImprovements(teacherRecord, studentRecord, culturalScore) {
        const algorithmDecision = teacherRecord.algorithm_decision || {};
        return {
            teaching_methodology: this._assessTeachingMethodology(algorithmDecision),
            character_interaction_quality: culturalScore > 0.8 ? 'Strong character alignment - maintain approach' : 'Review character context handling',
            engagement_strategy: this._assessEngagementStrategy(studentRecord),
            algorithm_confidence_feedback: `Teacher algorithm confidence: ${teacherRecord.confidence_score || 'N/A'}`
        };
    }

    _assessTeachingMethodology(decision) {
        const action = decision.action || '';
        if (action.includes('lesson')) return 'Structured lesson delivery - good for foundational learning';
        if (action.includes('practice')) return 'Practical application - good for skill reinforcement';
        return 'Alternative methodology - assess effectiveness';
    }

    _assessEngagementStrategy(studentRecord) {
        const engagement = studentRecord.user_engagement || {};
        const engagementType = engagement.engagement_type || '';
        if (engagementType.includes('storytelling')) return 'Narrative engagement - effective for character immersion';
        if (engagementType.includes('interactive')) return 'Interactive engagement - good for active learning';
        return 'Review engagement approach effectiveness';
    }

    _generateLearningRecommendations(effectiveness, efficiency, innovation, cultural, cycleData) {
        const recommendations = [];
        const metadata = cycleData.metadata || {};
        if (effectiveness > 0.85) recommendations.push('Continue current lesson clarity approach - student comprehension excellent');
        else if (effectiveness < 0.6) recommendations.push('Simplify task instructions in next cycle');
        if (efficiency > 0.85) recommendations.push('Lesson delivery process is streamlined - maintain current approach');
        else if (efficiency < 0.6) recommendations.push('Add preparation steps before next lesson delivery');
        if (innovation === 0.0) recommendations.push('Next cycle: explicitly encourage creative thinking and alternative approaches');
        else if (innovation > 0.5) recommendations.push('Student showing creativity - consider advanced/open-ended tasks');
        if (cultural > 0.85) recommendations.push(`Character alignment strong for ${metadata.characterId} - reinforce similar contexts`);
        else if (cultural < 0.6) recommendations.push('Review cultural/character context specificity in teacher decision');
        if (metadata.domain === 'story_sense') recommendations.push('Story domain: emphasize narrative structure and character motivation in next cycle');
        return recommendations;
    }

    _calculateWeightedScore(effectiveness, efficiency, innovation, cultural) {
        const score = (effectiveness * 0.4) + (efficiency * 0.2) + (innovation * 0.1) + (cultural * 0.3);
        return Math.min(Math.max(score, 0.0), 1.0);
    }
}

export default EvaluationComponent;
