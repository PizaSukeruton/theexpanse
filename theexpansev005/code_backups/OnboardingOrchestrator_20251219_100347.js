import pool from '../db/pool.js';
import generateHexId from '../utils/hexIdGenerator.js';
import { StateDataSchemas } from './onboardingSchemas.js';

class InvalidTransitionError extends Error {
  constructor(fromState, toState, validStates) {
    super(`Invalid transition: ${fromState} → ${toState}. Valid: ${validStates.join(', ')}`);
    this.name = 'InvalidTransitionError';
    this.fromState = fromState;
    this.toState = toState;
    this.validStates = validStates;
  }
}

class OptimisticLockError extends Error {
  constructor(userId, expectedVersion) {
    super(`Optimistic lock failure for ${userId}: state was modified (expected v${expectedVersion})`);
    this.name = 'OptimisticLockError';
    this.userId = userId;
    this.expectedVersion = expectedVersion;
  }
}

class OnboardingNotInitializedError extends Error {
  constructor(userId) {
    super(`User ${userId} not found in onboarding_state`);
    this.name = 'OnboardingNotInitializedError';
    this.userId = userId;
  }
}

class OnboardingOrchestrator {
  constructor() {
    this.validTransitions = {
      'new': ['welcomed'],
      'welcomed': ['awaiting_ready'],
      'awaiting_ready': ['omiyage_offered'],
      'omiyage_offered': ['onboarded'],
      'onboarded': []
    };

    this.beforeTransitionHooks = [];
    this.afterTransitionHooks = [];

    this.validateConfiguration();
  }

  validateConfiguration() {
    const stateNames = Object.keys(this.validTransitions);
    const schemaNames = Object.keys(StateDataSchemas);

    const missingSchemas = stateNames.filter(state => !schemaNames.includes(state));
    if (missingSchemas.length > 0) {
      throw new Error(
        `[OnboardingOrchestrator] Configuration error: Missing schemas for states: ${missingSchemas.join(', ')}`
      );
    }

    const extraSchemas = schemaNames.filter(schema => !stateNames.includes(schema));
    if (extraSchemas.length > 0) {
      console.warn(
        `[OnboardingOrchestrator] Warning: Extra schemas defined for non-existent states: ${extraSchemas.join(', ')}`
      );
    }

    console.log('[OnboardingOrchestrator] Configuration validated:', {
      states: stateNames.length,
      schemas: schemaNames.length,
      status: 'OK'
    });
  }

  registerBeforeTransitionHook(hookFn) {
    if (typeof hookFn !== 'function') {
      throw new Error('Hook must be a function');
    }
    this.beforeTransitionHooks.push(hookFn);
  }

  registerAfterTransitionHook(hookFn) {
    if (typeof hookFn !== 'function') {
      throw new Error('Hook must be a function');
    }
    this.afterTransitionHooks.push(hookFn);
  }

  async executeBeforeHooks(userId, fromState, toState, stateData) {
    for (const hook of this.beforeTransitionHooks) {
      try {
        await hook(userId, fromState, toState, stateData);
      } catch (err) {
        console.error('[OnboardingOrchestrator] beforeTransition hook failed:', {
          userId,
          transition: `${fromState} → ${toState}`,
          error: err.message
        });
        throw err;
      }
    }
  }

  async executeAfterHooks(userId, fromState, toState, newState) {
    for (const hook of this.afterTransitionHooks) {
      try {
        await hook(userId, fromState, toState, newState);
      } catch (err) {
        console.error('[OnboardingOrchestrator] afterTransition hook failed:', {
          userId,
          transition: `${fromState} → ${toState}`,
          error: err.message
        });
      }
    }
  }

  getValidNextStates(fromState) {
    return this.validTransitions[fromState] || [];
  }

  async getCurrentState(userId) {
    try {
      const result = await pool.query(
        `SELECT user_id, current_state, state_version, state_data, entered_at, updated_at
         FROM user_onboarding_state
         WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (err) {
      console.error('[OnboardingOrchestrator] Error getting state:', {
        userId,
        error: err.message
      });
      throw err;
    }
  }

  isValidTransition(fromState, toState) {
    const allowedStates = this.validTransitions[fromState] || [];
    return allowedStates.includes(toState);
  }

  async transitionTo(userId, toState, stateData = {}, reason = null) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const currentResult = await client.query(
        `SELECT user_id, current_state, state_version, state_data
         FROM user_onboarding_state
         WHERE user_id = $1`,
        [userId]
      );

      if (currentResult.rows.length === 0) {
        throw new OnboardingNotInitializedError(userId);
      }

      const current = currentResult.rows[0];
      const fromState = current.current_state;
      const fromVersion = current.state_version;

      if (!this.isValidTransition(fromState, toState)) {
        throw new InvalidTransitionError(
          fromState, 
          toState, 
          this.validTransitions[fromState] || []
        );
      }

      const schema = StateDataSchemas[toState];
      if (schema) {
        const parseResult = schema.safeParse(stateData);
        if (!parseResult.success) {
          const errorMsg = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
          throw new Error(`Invalid state_data for ${toState}: ${errorMsg}`);
        }
      }

      await this.executeBeforeHooks(userId, fromState, toState, stateData);

      const mergedStateData = { ...current.state_data, ...stateData };

      const updateResult = await client.query(
        `UPDATE user_onboarding_state
         SET 
           current_state = $1,
           state_version = state_version + 1,
           state_data = $2,
           entered_at = NOW(),
           updated_at = NOW()
         WHERE user_id = $3 AND state_version = $4
         RETURNING *`,
        [toState, JSON.stringify(mergedStateData), userId, fromVersion]
      );

      if (updateResult.rows.length === 0) {
        throw new OptimisticLockError(userId, fromVersion);
      }

      const newState = updateResult.rows[0];
      const toVersion = newState.state_version;

      const auditId = await generateHexId('onboarding_audit_id');
      await client.query(
        `INSERT INTO onboarding_state_audit 
         (audit_id, user_id, from_state, to_state, from_version, to_version, state_data, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          auditId, 
          userId, 
          fromState, 
          toState, 
          fromVersion, 
          toVersion, 
          JSON.stringify(mergedStateData), 
          reason
        ]
      );

      await client.query('COMMIT');

      console.log('[OnboardingOrchestrator] Transition:', {
        userId,
        transition: `${fromState} → ${toState}`,
        version: `v${fromVersion} → v${toVersion}`,
        reason
      });

      await this.executeAfterHooks(userId, fromState, toState, newState);

      return newState;

    } catch (err) {
      await client.query('ROLLBACK');
      
      console.error('[OnboardingOrchestrator] Transition failed:', {
        userId,
        error: err.name || err.message,
        details: err.message
      });
      
      throw err;
    } finally {
      client.release();
    }
  }

  async initializeUser(userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existing = await client.query(
        'SELECT user_id, current_state, state_version, state_data FROM user_onboarding_state WHERE user_id = $1',
        [userId]
      );

      if (existing.rows.length > 0) {
        await client.query('COMMIT');
        console.log('[OnboardingOrchestrator] User already initialized:', { userId });
        return existing.rows[0];
      }

      const result = await client.query(
        `INSERT INTO user_onboarding_state 
         (user_id, current_state, state_version, state_data)
         VALUES ($1, 'new', 1, '{}')
         RETURNING *`,
        [userId]
      );

      const auditId = await generateHexId('onboarding_audit_id');
      await client.query(
        `INSERT INTO onboarding_state_audit 
         (audit_id, user_id, from_state, to_state, from_version, to_version, state_data, reason)
         VALUES ($1, $2, NULL, 'new', NULL, 1, '{}', 'user_initialization')`,
        [auditId, userId]
      );

      await client.query('COMMIT');

      console.log('[OnboardingOrchestrator] User initialized:', { 
        userId, 
        state: 'new' 
      });

      return result.rows[0];

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[OnboardingOrchestrator] Initialization failed:', {
        userId,
        error: err.message
      });
      throw err;
    } finally {
      client.release();
    }
  }

  async getHistory(userId) {
    try {
      const result = await pool.query(
        `SELECT audit_id, from_state, to_state, from_version, to_version, 
                state_data, reason, transitioned_at
         FROM onboarding_state_audit
         WHERE user_id = $1
         ORDER BY transitioned_at ASC`,
        [userId]
      );

      return result.rows;
    } catch (err) {
      console.error('[OnboardingOrchestrator] Error getting history:', {
        userId,
        error: err.message
      });
      throw err;
    }
  }

  async isOnboarded(userId) {
    const state = await this.getCurrentState(userId);
    return state && state.current_state === 'onboarded';
  }

  async getUsersInState(stateName) {
    try {
      const result = await pool.query(
        `SELECT user_id, entered_at, state_data, state_version
         FROM user_onboarding_state
         WHERE current_state = $1
         ORDER BY entered_at DESC`,
        [stateName]
      );

      return result.rows;
    } catch (err) {
      console.error('[OnboardingOrchestrator] Error getting users in state:', {
        stateName,
        error: err.message
      });
      throw err;
    }
  }

  async getStuckUsers(stateName, minutesThreshold = 10) {
    try {
      const result = await pool.query(
        `SELECT user_id, current_state, entered_at, state_version,
                EXTRACT(EPOCH FROM (NOW() - entered_at))/60 AS minutes_in_state
         FROM user_onboarding_state
         WHERE current_state = $1
           AND entered_at < NOW() - INTERVAL '1 minute' * $2
         ORDER BY entered_at ASC`,
        [stateName, minutesThreshold]
      );

      return result.rows;
    } catch (err) {
      console.error('[OnboardingOrchestrator] Error getting stuck users:', {
        stateName,
        minutesThreshold,
        error: err.message
      });
      throw err;
    }
  }

  async forceTransition(userId, toState, adminReason) {
    if (!adminReason) {
      throw new Error('Admin reason required for forced transitions');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const currentResult = await client.query(
        'SELECT current_state, state_version, state_data FROM user_onboarding_state WHERE user_id = $1',
        [userId]
      );

      if (currentResult.rows.length === 0) {
        throw new OnboardingNotInitializedError(userId);
      }

      const current = currentResult.rows[0];
      const fromState = current.current_state;
      const fromVersion = current.state_version;

      const updateResult = await client.query(
        `UPDATE user_onboarding_state
         SET 
           current_state = $1,
           state_version = state_version + 1,
           entered_at = NOW(),
           updated_at = NOW()
         WHERE user_id = $2
         RETURNING *`,
        [toState, userId]
      );

      const newState = updateResult.rows[0];
      const toVersion = newState.state_version;

      const auditId = await generateHexId('onboarding_audit_id');
      await client.query(
        `INSERT INTO onboarding_state_audit 
         (audit_id, user_id, from_state, to_state, from_version, to_version, state_data, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          auditId,
          userId,
          fromState,
          toState,
          fromVersion,
          toVersion,
          JSON.stringify(current.state_data),
          `ADMIN_OVERRIDE: ${adminReason}`
        ]
      );

      await client.query('COMMIT');

      console.warn('[OnboardingOrchestrator] Admin override:', {
        userId,
        transition: `${fromState} → ${toState}`,
        reason: adminReason
      });

      return newState;

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[OnboardingOrchestrator] Force transition failed:', {
        userId,
        error: err.message
      });
      throw err;
    } finally {
      client.release();
    }
  }
}

const onboardingOrchestrator = new OnboardingOrchestrator();
export default onboardingOrchestrator;

export { 
  InvalidTransitionError, 
  OptimisticLockError, 
  OnboardingNotInitializedError 
};
