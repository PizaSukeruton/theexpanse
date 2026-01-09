import pool from '../db/pool.js';
import ConversationStateManager from './ConversationStateManager.js';

class AdjacencyPairHandler {
    constructor() {
        this.OBSERVE_MODE = true;
        this.pairCache = new Map();
        this.CACHE_TTL = 300000;
        this.lastCacheRefresh = 0;
    }

    async refreshCache() {
        const now = Date.now();
        if (now - this.lastCacheRefresh < this.CACHE_TTL && this.pairCache.size > 0) {
            return;
        }

        // CHANGE 1: Defensive error handling
        try {
            const result = await pool.query('SELECT * FROM adjacency_pairs');
            
            this.pairCache.clear();
            for (const row of result.rows) {
                this.pairCache.set(row.fpp_act_code, {
                    pairId: row.pair_id,
                    fppActCode: row.fpp_act_code,
                    preferredSppCode: row.preferred_spp_code,
                    dispreferredSppCodes: row.dispreferred_spp_codes || [],
                    relevanceStrength: parseFloat(row.relevance_strength),
                    expectationTimeout: row.expectation_timeout
                });
            }

            this.lastCacheRefresh = now;
            console.log(`[AdjacencyPairHandler] Cache refreshed: ${this.pairCache.size} pairs loaded`);
        } catch (err) {
            console.warn('[AdjacencyPairHandler] Cache refresh failed', err);
        }
    }

    async getExpectation(fppActCode) {
        await this.refreshCache();
        return this.pairCache.get(fppActCode) || null;
    }

    async createExpectation(conversationId, fppActCode, turnIndex) {
        await this.refreshCache();

        const pair = this.pairCache.get(fppActCode);
        if (!pair) {
            console.log(`[AdjacencyPairHandler] No adjacency pair defined for: ${fppActCode}`);
            return null;
        }

        const expectation = {
            pairId: pair.pairId,
            fppActCode: pair.fppActCode,
            preferredSppCode: pair.preferredSppCode,
            dispreferredSppCodes: pair.dispreferredSppCodes,
            relevanceStrength: pair.relevanceStrength,
            expectationTimeout: pair.expectationTimeout,
            createdAtTurn: turnIndex,
            turnsElapsed: 0
        };

        await pool.query(`
            UPDATE conversation_states
            SET pending_fpp = $1,
                expected_spp = $2,
                updated_at = NOW()
            WHERE conversation_id = $3
        `, [JSON.stringify(expectation), pair.preferredSppCode, conversationId]);

        console.log(`[AdjacencyPairHandler] Created expectation: ${fppActCode} → ${pair.preferredSppCode}`);
        return expectation;
    }

    async checkExpectation(conversationId, candidateSppCode, currentTurnIndex) {
        const state = await ConversationStateManager.getState(conversationId);
        
        if (!state || !state.pending_fpp) {
            return { hasExpectation: false };
        }

        const expectation = state.pending_fpp;
        
        // CHANGE 2: Clamp negative turn calculations
        const turnsElapsed = Math.max(0, currentTurnIndex - expectation.createdAtTurn);

        if (turnsElapsed >= expectation.expectationTimeout) {
            const result = {
                hasExpectation: true,
                status: 'expired',
                expectation: expectation,
                turnsElapsed: turnsElapsed,
                decayedStrength: this.calculateDecayedStrength(expectation.relevanceStrength, turnsElapsed, expectation.expectationTimeout)
            };

            await this.logExpectationEvent(conversationId, 'expired', expectation, candidateSppCode, turnsElapsed);
            
            if (!this.OBSERVE_MODE) {
                await this.clearExpectation(conversationId);
            }

            return result;
        }

        if (candidateSppCode === expectation.preferredSppCode) {
            const result = {
                hasExpectation: true,
                status: 'satisfied_preferred',
                expectation: expectation,
                turnsElapsed: turnsElapsed
            };

            await this.logExpectationEvent(conversationId, 'satisfied_preferred', expectation, candidateSppCode, turnsElapsed);
            
            if (!this.OBSERVE_MODE) {
                await this.clearExpectation(conversationId);
            }

            return result;
        }

        if (expectation.dispreferredSppCodes && expectation.dispreferredSppCodes.includes(candidateSppCode)) {
            const result = {
                hasExpectation: true,
                status: 'satisfied_dispreferred',
                expectation: expectation,
                turnsElapsed: turnsElapsed,
                dispreferredUsed: candidateSppCode
            };

            await this.logExpectationEvent(conversationId, 'satisfied_dispreferred', expectation, candidateSppCode, turnsElapsed);
            
            if (!this.OBSERVE_MODE) {
                await this.clearExpectation(conversationId);
            }

            return result;
        }

        const result = {
            hasExpectation: true,
            status: 'violated',
            expectation: expectation,
            turnsElapsed: turnsElapsed,
            expectedCode: expectation.preferredSppCode,
            actualCode: candidateSppCode
        };

        await this.logExpectationEvent(conversationId, 'violated', expectation, candidateSppCode, turnsElapsed);

        return result;
    }

    calculateDecayedStrength(baseStrength, turnsElapsed, timeout) {
        const excessTurns = Math.max(0, turnsElapsed - timeout);
        return baseStrength * Math.pow(0.7, excessTurns);
    }

    async clearExpectation(conversationId) {
        await pool.query(`
            UPDATE conversation_states
            SET pending_fpp = NULL,
                expected_spp = NULL,
                updated_at = NOW()
            WHERE conversation_id = $1
        `, [conversationId]);

        console.log(`[AdjacencyPairHandler] Cleared expectation for conversation ${conversationId}`);
    }

    async incrementTurnsElapsed(conversationId) {
        const state = await ConversationStateManager.getState(conversationId);
        
        if (!state || !state.pending_fpp) {
            return null;
        }

        const expectation = state.pending_fpp;
        expectation.turnsElapsed = (expectation.turnsElapsed || 0) + 1;

        await pool.query(`
            UPDATE conversation_states
            SET pending_fpp = $1,
                updated_at = NOW()
            WHERE conversation_id = $2
        `, [JSON.stringify(expectation), conversationId]);

        return expectation;
    }

    async logExpectationEvent(conversationId, eventType, expectation, actualCode, turnsElapsed) {
        const logEntry = {
            eventType: eventType,
            fppActCode: expectation.fppActCode,
            expectedSppCode: expectation.preferredSppCode,
            actualSppCode: actualCode,
            turnsElapsed: turnsElapsed,
            relevanceStrength: expectation.relevanceStrength,
            timestamp: new Date().toISOString(),
            observeMode: this.OBSERVE_MODE
        };

        console.log(`[AdjacencyPairHandler] Event: ${eventType}`, logEntry);

        await ConversationStateManager.recordMove(conversationId, {
            type: 'adjacency_event',
            ...logEntry
        });
    }

    async getPendingExpectation(conversationId) {
        const state = await ConversationStateManager.getState(conversationId);
        return state?.pending_fpp || null;
    }

    setObserveMode(enabled) {
        this.OBSERVE_MODE = enabled;
        console.log(`[AdjacencyPairHandler] OBSERVE_MODE set to: ${enabled}`);
    }

    isObserveMode() {
        return this.OBSERVE_MODE;
    }

    async getViolationStats(conversationId) {
        const state = await ConversationStateManager.getState(conversationId);
        if (!state || !state.last_moves) {
            return { total: 0, violations: 0, expirations: 0 };
        }

        const adjacencyEvents = state.last_moves.filter(m => m.type === 'adjacency_event');
        
        return {
            total: adjacencyEvents.length,
            violations: adjacencyEvents.filter(e => e.eventType === 'violated').length,
            expirations: adjacencyEvents.filter(e => e.eventType === 'expired').length,
            satisfiedPreferred: adjacencyEvents.filter(e => e.eventType === 'satisfied_preferred').length,
            satisfiedDispreferred: adjacencyEvents.filter(e => e.eventType === 'satisfied_dispreferred').length
        };
    }
}

export default new AdjacencyPairHandler();
