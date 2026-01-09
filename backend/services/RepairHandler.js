/**
 * RepairHandler.js — Repair Detection Service for Claude the Tanuki
 * 
 * OBSERVE MODE ONLY - This component detects repair sequences but does not enforce them.
 * 
 * CRITICAL INTERPRETATION NOTES:
 * 
 * 1. DETECTION IS A SIGNAL, NOT TRUTH
 *    Repair detections are heuristic observations, not ground truth.
 *    Do not treat detections as certainty or use them to assign fault.
 * 
 * 2. CONFIDENCE VALUES ARE HEURISTIC WEIGHTS, NOT PROBABILITIES
 *    Values like 0.95, 0.85, 0.75 represent relative pattern strength,
 *    not empirical probability. Never threshold them as truth.
 * 
 * 3. repairType IS CA TAXONOMY, NOT RESPONSIBILITY ASSIGNMENT
 *    'other_initiated_self_repair' means:
 *      - Other (user) initiated the repair
 *      - Self (Claude) is expected to perform the repair
 *    Do not infer agent blame from this string.
 * 
 * 4. SELF-REPAIR DETECTION IS OVER-INCLUSIVE
 *    detectSelfRepairOpportunity() flags stylistic markers ("well", "actually")
 *    which may not be true self-repairs. previousClaudeMessage param is
 *    intentionally unused; reserved for future retrospective comparison.
 * 
 * Theoretical Foundation: Schegloff, Jefferson, & Sacks (1977)
 * "The Preference for Self-Correction in the Organization of Repair in Conversation"
 */

import pool from '../db/pool.js';
import ConversationStateManager from './ConversationStateManager.js';

class RepairHandler {
    constructor() {
        this.OBSERVE_MODE = true;
        
        /**
         * Repair initiation patterns (other-initiated repair)
         * These indicate the user didn't understand Claude's previous turn
         * 
         * WARNING: These patterns are intentionally broad and WILL produce
         * false positives on sarcasm, fragments, stylistic replies, and
         * poetic language. This is acceptable in OBSERVE mode.
         */
        this.otherInitiatedPatterns = {
            // Open class repairs (most general - "what?")
            openClass: [
                /^(huh|what|sorry|pardon|excuse me|come again)\??$/i,
                /^(i('m| am) sorry|beg your pardon)\??$/i,
                /^what('s| is) that\??$/i,
                /^say (that )?again\??$/i
            ],
            
            // WH-question repairs (asking for specific info)
            whQuestion: [
                /^(who|what|where|when|why|how|which)(\s+.{1,20})?\??$/i,
                /^what do you mean/i,
                /^what did you (say|mean)/i,
                /^who('s| is) that\??$/i,
                /^where('s| is) that\??$/i
            ],
            
            // Partial repeat (echoing part of previous utterance)
            // WARNING: High false positive rate on fragments
            partialRepeat: [
                /^the (.{1,30})\??$/i,
                /^(.{1,20}) what\??$/i,
                /^you (said|mean) (.{1,30})\??$/i
            ],
            
            // Candidate understanding (proposing interpretation)
            candidateUnderstanding: [
                /^(so |oh |wait ).{5,}/i,
                /^you mean .{5,}/i,
                /^do you mean .{5,}/i,
                /^are you saying .{5,}/i,
                /^is that .{5,}/i
            ]
        };
        
        // Self-repair indicators (Claude correcting itself)
        this.selfRepairPatterns = [
            /^(i mean|that is|rather|actually|well|sorry|correction)/i,
            /^(let me (rephrase|clarify|try again))/i,
            /^(what i meant (was|to say))/i
        ];
        
        // Repair preference hierarchy (Schegloff et al. 1977)
        // Lower index = more preferred
        this.repairPreferenceHierarchy = [
            'self_initiated_self_repair',
            'other_initiated_self_repair', 
            'self_initiated_other_repair',
            'other_initiated_other_repair'
        ];
    }

    /**
     * Detect other-initiated repair from user message
     * 
     * WARNING: This uses pattern matching only. It does not examine:
     * - prior utterance content
     * - QUD state  
     * - adjacency relevance
     * 
     * False positives are expected and acceptable in OBSERVE mode.
     */
    detectOtherInitiatedRepair(userMessage) {
        const normalized = userMessage.trim().toLowerCase();
        
        // Check open class first (most general)
        for (const pattern of this.otherInitiatedPatterns.openClass) {
            if (pattern.test(normalized)) {
                return {
                    isRepair: true,
                    repairType: 'other_initiated_self_repair',
                    category: 'open_class',
                    pattern: pattern.toString(),
                    originalMessage: userMessage,
                    confidence: 0.95,
                    interpretationNote: 'heuristic_signal_not_truth'
                };
            }
        }
        
        // Check WH-question repairs
        for (const pattern of this.otherInitiatedPatterns.whQuestion) {
            if (pattern.test(normalized)) {
                return {
                    isRepair: true,
                    repairType: 'other_initiated_self_repair',
                    category: 'wh_question',
                    pattern: pattern.toString(),
                    originalMessage: userMessage,
                    confidence: 0.85,
                    interpretationNote: 'heuristic_signal_not_truth'
                };
            }
        }
        
        // Check partial repeats
        for (const pattern of this.otherInitiatedPatterns.partialRepeat) {
            if (pattern.test(normalized)) {
                return {
                    isRepair: true,
                    repairType: 'other_initiated_self_repair',
                    category: 'partial_repeat',
                    pattern: pattern.toString(),
                    originalMessage: userMessage,
                    confidence: 0.75,
                    interpretationNote: 'heuristic_signal_not_truth'
                };
            }
        }
        
        // Check candidate understanding
        for (const pattern of this.otherInitiatedPatterns.candidateUnderstanding) {
            if (pattern.test(normalized)) {
                return {
                    isRepair: true,
                    repairType: 'other_initiated_self_repair',
                    category: 'candidate_understanding',
                    pattern: pattern.toString(),
                    originalMessage: userMessage,
                    confidence: 0.70,
                    interpretationNote: 'heuristic_signal_not_truth'
                };
            }
        }
        
        return {
            isRepair: false,
            originalMessage: userMessage
        };
    }

    /**
     * Detect self-repair opportunity in Claude's message
     * 
     * TODO: previousClaudeMessage is intentionally unused.
     * Reserved for future retrospective comparison to detect actual
     * corrections vs. stylistic hedging. Current implementation
     * over-detects by flagging hedges like "well", "actually".
     * 
     * @param {string} claudeMessage - Current message from Claude
     * @param {string} previousClaudeMessage - UNUSED. Reserved for future.
     */
    detectSelfRepairOpportunity(claudeMessage, previousClaudeMessage) {
        // NOTE: previousClaudeMessage intentionally unused
        // Future: implement retrospective comparison for true self-repair detection
        
        const normalized = claudeMessage.trim().toLowerCase();
        
        for (const pattern of this.selfRepairPatterns) {
            if (pattern.test(normalized)) {
                return {
                    isSelfRepair: true,
                    repairType: 'self_initiated_self_repair',
                    pattern: pattern.toString(),
                    confidence: 0.90,
                    interpretationNote: 'heuristic_signal_not_truth_may_be_stylistic_hedge'
                };
            }
        }
        
        return { isSelfRepair: false };
    }

    async initiateRepair(conversationId, repairData) {
        await ConversationStateManager.setRepairInProgress(
            conversationId,
            repairData.repairType,
            {
                category: repairData.category,
                originalMessage: repairData.originalMessage,
                confidence: repairData.confidence,
                initiatedAt: new Date().toISOString(),
                interpretationNote: 'heuristic_signal_not_truth'
            }
        );

        await ConversationStateManager.recordMove(conversationId, {
            type: 'repair_initiated',
            repairType: repairData.repairType,
            category: repairData.category,
            confidence: repairData.confidence,
            observeMode: this.OBSERVE_MODE,
            interpretationNote: 'heuristic_signal_not_truth'
        });

        console.log(`[RepairHandler] Repair initiated: ${repairData.repairType} (${repairData.category})`);
        
        return {
            actCode: 'own_communication_management.self_repair',
            requiresRepair: true,
            repairData: repairData
        };
    }

    async completeRepair(conversationId, completionData) {
        await ConversationStateManager.clearRepair(conversationId);

        await ConversationStateManager.recordMove(conversationId, {
            type: 'repair_completed',
            completionMethod: completionData.method || 'clarification',
            success: completionData.success !== false,
            observeMode: this.OBSERVE_MODE,
            interpretationNote: 'heuristic_signal_not_truth'
        });

        console.log(`[RepairHandler] Repair completed: ${completionData.method || 'clarification'}`);
    }

    async isRepairInProgress(conversationId) {
        const state = await ConversationStateManager.getState(conversationId);
        return state?.repair_in_progress || false;
    }

    async getRepairContext(conversationId) {
        const state = await ConversationStateManager.getState(conversationId);
        
        if (!state || !state.repair_in_progress) {
            return null;
        }

        return {
            repairType: state.repair_type,
            repairSource: state.repair_source,
            inProgress: true
        };
    }

    getRecommendedDialogueFunction(repairData) {
        // Map repair categories to appropriate dialogue functions
        const categoryMapping = {
            'open_class': 'own_communication_management.self_repair',
            'wh_question': 'allo_feedback.request_clarification',
            'partial_repeat': 'own_communication_management.self_correction',
            'candidate_understanding': 'partner_communication_management.confirm_partner_state'
        };

        return categoryMapping[repairData.category] || 'own_communication_management.self_repair';
    }

    getRecommendedSpeechAct(repairData) {
        // Map repair categories to appropriate speech acts
        const categoryMapping = {
            'open_class': 'assertive.explain',
            'wh_question': 'assertive.inform',
            'partial_repeat': 'assertive.correction_acceptance',
            'candidate_understanding': 'feedback_elicitation.elicit_confirmation'
        };

        return categoryMapping[repairData.category] || 'assertive.explain';
    }

    setObserveMode(enabled) {
        this.OBSERVE_MODE = enabled;
        console.log(`[RepairHandler] OBSERVE_MODE set to: ${enabled}`);
    }

    isObserveMode() {
        return this.OBSERVE_MODE;
    }

    async getRepairStats(conversationId) {
        const state = await ConversationStateManager.getState(conversationId);
        if (!state || !state.last_moves) {
            return { totalRepairs: 0, completed: 0, categories: {} };
        }

        const repairEvents = state.last_moves.filter(
            m => m.type === 'repair_initiated' || m.type === 'repair_completed'
        );

        const initiated = repairEvents.filter(e => e.type === 'repair_initiated');
        const completed = repairEvents.filter(e => e.type === 'repair_completed');

        const categories = {};
        for (const event of initiated) {
            const cat = event.category || 'unknown';
            categories[cat] = (categories[cat] || 0) + 1;
        }

        return {
            totalRepairs: initiated.length,
            completed: completed.length,
            categories: categories
        };
    }
}

export default new RepairHandler();
