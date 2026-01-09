// BeltProgressionManager.js – Phase 108 consolidated fixes applied
// Changes applied:
// - Cycle requirement reduced from 500 → 100 per stripe (as requested)
// - Syntax fixes for total_tse_cycles etc.
// - Belt order in single const BELT_ORDER
// - Non-score criteria properly checked from tseEvaluationResult
// - KNOWLEDGE_DOMAINS empty + hex validation only
// - Reset total_tse_cycles only on belt change (not per stripe)

import { validateHexId } from '../utils/hexUtils.js';
import generateHexId from '../utils/hexIdGenerator.js';

// Single source of truth for belt order
const BELT_ORDER = [
  'white_belt',
  'blue_belt',
  'purple_belt',
  'brown_belt',
  'black_belt'
];

// Belt Advancement Criteria – cycles reduced to 100 per stripe
const BELT_REQUIREMENTS = {
  white_belt: {
    stripe_0: { cycles: 100, effectiveness: 0.00, efficiency: 0.00, cultural: 0.00 },
    stripe_1: { cycles: 100, effectiveness: 0.30, efficiency: 0.25, cultural: 0.90 },
    stripe_2: { cycles: 100, effectiveness: 0.35, efficiency: 0.30, cultural: 0.92 },
    stripe_3: { cycles: 100, effectiveness: 0.40, efficiency: 0.35, cultural: 0.94 },
    stripe_4: { cycles: 100, effectiveness: 0.45, efficiency: 0.40, cultural: 0.95 }
  },
  blue_belt: {
    stripe_0: { cycles: 100, effectiveness: 0.50, efficiency: 0.45, cultural: 0.95 },
    stripe_1: { cycles: 100, effectiveness: 0.55, efficiency: 0.50, cultural: 0.95 },
    stripe_2: { cycles: 100, effectiveness: 0.60, efficiency: 0.55, cultural: 0.95 },
    stripe_3: { cycles: 100, effectiveness: 0.65, efficiency: 0.60, cultural: 0.95 },
    stripe_4: { cycles: 100, effectiveness: 0.70, efficiency: 0.65, cultural: 0.95 }
  },
  purple_belt: {
    stripe_0: { cycles: 100, effectiveness: 0.72, efficiency: 0.67, cultural: 0.96 },
    stripe_1: { cycles: 100, effectiveness: 0.74, efficiency: 0.69, cultural: 0.96 },
    stripe_2: { cycles: 100, effectiveness: 0.76, efficiency: 0.71, cultural: 0.96 },
    stripe_3: { cycles: 100, effectiveness: 0.78, efficiency: 0.73, cultural: 0.96 },
    stripe_4: { cycles: 100, effectiveness: 0.80, efficiency: 0.75, cultural: 0.96 }
  },
  brown_belt: {
    stripe_0: { cycles: 100, effectiveness: 0.82, efficiency: 0.77, cultural: 0.97 },
    stripe_1: { cycles: 100, effectiveness: 0.84, efficiency: 0.79, cultural: 0.97 },
    stripe_2: { cycles: 100, effectiveness: 0.86, efficiency: 0.81, cultural: 0.97 },
    stripe_3: { cycles: 100, effectiveness: 0.88, efficiency: 0.83, cultural: 0.97 },
    stripe_4: { cycles: 100, effectiveness: 0.90, efficiency: 0.85, cultural: 0.97 }
  },
  black_belt: {
    stripe_0: { cycles: 100, effectiveness: 0.92, efficiency: 0.87, cultural: 0.98 },
    stripe_1: { cycles: 100, effectiveness: 0.93, efficiency: 0.88, cultural: 0.98 },
    stripe_2: { cycles: 100, effectiveness: 0.94, efficiency: 0.89, cultural: 0.98 },
    stripe_3: { cycles: 100, effectiveness: 0.95, efficiency: 0.90, cultural: 0.99 },
    stripe_4: { cycles: 100, effectiveness: 0.96, efficiency: 0.91, cultural: 0.99 }
  }
};

// Placeholder – remains empty as per instructions
const KNOWLEDGE_DOMAINS = {};

export default class BeltProgressionManager {
  constructor(pool) {
    this.pool = pool;
  }

  getBeltRequirements(belt, stripe) {
    return BELT_REQUIREMENTS[belt]?.[`stripe_${stripe}`] || null;
  }

  async initializeBeltProgression(characterId) {
    if (!validateHexId(characterId)) {
      throw new Error('Invalid character ID format.');
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
        [characterId]
      );

      if (res.rows.length > 0) {
        await client.query('COMMIT');
        return res.rows[0];
      }

      const progressionId = await generateHexId('belt_progression_id');
      const initialCriteria = this.getBeltRequirements('white_belt', 0);

      const insertRes = await client.query(
        `INSERT INTO character_belt_progression (
          progression_id, character_id, current_belt, current_stripes,
          total_tse_cycles, successful_cycles, current_success_rate,
          advancement_progress, belt_history, knowledge_domain_scores,
          last_evaluation_score, advancement_criteria, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING *`,
        [
          progressionId,
          characterId,
          'white_belt',
          0,
          0,
          0,
          0.0,
          {},
          [],
          {},
          0.0,
          initialCriteria
        ]
      );

      await client.query('COMMIT');
      return insertRes.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Failed to initialize belt progression for ${characterId}:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  async updateProgressionAfterTSE(characterId, tseEvaluationResult) {
    if (!validateHexId(characterId)) return;
    if (!tseEvaluationResult?.score) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      let progression = await client.query(
        'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
        [characterId]
      ).then(r => r.rows[0]);

      if (!progression) {
        progression = await this.initializeBeltProgression(characterId);
        progression = await client.query(
          'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
          [characterId]
        ).then(r => r.rows[0]);
      }

      progression.total_tse_cycles = (progression.total_tse_cycles || 0) + 1;
      progression.last_evaluation_score = tseEvaluationResult.score;

      const threshold = progression.advancement_criteria?.effectiveness ?? 0.5;
      if (tseEvaluationResult.score >= threshold) {
        progression.successful_cycles = (progression.successful_cycles || 0) + 1;
      }

      progression.current_success_rate =
        progression.total_tse_cycles > 0
          ? progression.successful_cycles / progression.total_tse_cycles
          : 0.0;

      let advProgress = progression.advancement_progress || {};
      advProgress.cycles_completed = (advProgress.cycles_completed || 0) + 1;
      progression.advancement_progress = advProgress;

      if (tseEvaluationResult.domain_scores) {
        let domainScores = progression.knowledge_domain_scores || {};
        for (const domainId in tseEvaluationResult.domain_scores) {
          if (validateHexId(domainId)) {
            domainScores[domainId] = tseEvaluationResult.domain_scores[domainId];
          }
        }
        progression.knowledge_domain_scores = domainScores;
      }

      await client.query(
        `UPDATE character_belt_progression
         SET total_tse_cycles = $1,
             successful_cycles = $2,
             current_success_rate = $3,
             advancement_progress = $4,
             knowledge_domain_scores = $5,
             last_evaluation_score = $6,
             updated_at = NOW()
         WHERE character_id = $7`,
        [
          progression.total_tse_cycles,
          progression.successful_cycles,
          progression.current_success_rate,
          progression.advancement_progress,
          progression.knowledge_domain_scores,
          progression.last_evaluation_score,
          characterId
        ]
      );

      await client.query('COMMIT');

      await this.checkAdvancementCriteria(characterId, tseEvaluationResult);

    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Progression update failed for ${characterId}:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  async checkAdvancementCriteria(characterId, tseEvaluationResult = null) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
        [characterId]
      );
      const progression = res.rows[0];
      if (!progression) {
        await client.query('ROLLBACK');
        return;
      }

      const currentBelt = progression.current_belt;
      const currentStripes = progression.current_stripes;
      const advProgress = progression.advancement_progress || {};
      const successRate = progression.current_success_rate || 0.0;

      let nextBelt = currentBelt;
      let nextStripes = currentStripes + 1;
      let reqs = this.getBeltRequirements(currentBelt, nextStripes);

      if (!reqs) {
        const idx = BELT_ORDER.indexOf(currentBelt);
        if (idx !== -1 && idx < BELT_ORDER.length - 1) {
          nextBelt = BELT_ORDER[idx + 1];
          nextStripes = 0;
          reqs = this.getBeltRequirements(nextBelt, nextStripes);
        }
      }

      if (!reqs) {
        await client.query('ROLLBACK');
        return;
      }

      const cyclesMet = (advProgress.cycles_completed || 0) >= (reqs.cycles || 0);
      const effMet   = successRate >= (reqs.effectiveness || 0.0);

      const effScore   = tseEvaluationResult?.efficiency_score  ?? 1.0;
      const cultScore  = tseEvaluationResult?.cultural_score    ?? 1.0;
      const innovScore = tseEvaluationResult?.innovation_score  ?? 1.0;

      const efficiencyMet = effScore   >= (reqs.efficiency  || 0.0);
      const culturalMet   = cultScore  >= (reqs.cultural    || 0.0);
      const innovationMet = innovScore >= (reqs.innovation  || 0.0);

      if (cyclesMet && effMet && efficiencyMet && culturalMet && innovationMet) {
        await this.advanceBelt(characterId, nextBelt, nextStripes, client);
        await client.query('COMMIT');
      } else {
        await client.query('ROLLBACK');
      }

    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Advancement check failed for ${characterId}:`, err.message);
      throw err;
    } finally {
      client.release();
    }
  }

  async advanceBelt(characterId, newBelt, newStripes, client = null) {
    const ownClient = !client;
    if (ownClient) {
      client = await this.pool.connect();
      await client.query('BEGIN');
    }

    try {
      const res = await client.query(
        'SELECT * FROM character_belt_progression WHERE character_id = $1 FOR UPDATE',
        [characterId]
      );
      const prog = res.rows[0];
      if (!prog) throw new Error(`No progression record for ${characterId}`);

      const wasBeltChange = prog.current_belt !== newBelt;

      prog.current_belt    = newBelt;
      prog.current_stripes = newStripes;

      prog.belt_history = prog.belt_history || [];
      prog.belt_history.push({
        belt: newBelt,
        stripes: newStripes,
        date: new Date().toISOString(),
        reason: `Advanced to ${newBelt} stripe ${newStripes}`
      });

      // Reset only on belt change
      if (wasBeltChange) {
        prog.total_tse_cycles    = 0;
        prog.successful_cycles   = 0;
        prog.current_success_rate = 0.0;
      }

      prog.advancement_progress = {};

      let nextReqs = this.getBeltRequirements(newBelt, newStripes + 1);
      if (!nextReqs) {
        const idx = BELT_ORDER.indexOf(newBelt);
        if (idx !== -1 && idx < BELT_ORDER.length - 1) {
          nextReqs = this.getBeltRequirements(BELT_ORDER[idx + 1], 0);
        }
      }
      prog.advancement_criteria = nextReqs || {};

      await client.query(
        `UPDATE character_belt_progression
         SET current_belt = $1, current_stripes = $2, belt_history = $3,
             total_tse_cycles = $4, successful_cycles = $5, current_success_rate = $6,
             advancement_progress = $7, advancement_criteria = $8, updated_at = NOW()
         WHERE character_id = $9`,
        [
          prog.current_belt,
          prog.current_stripes,
          JSON.stringify(prog.belt_history),
          prog.total_tse_cycles,
          prog.successful_cycles,
          prog.current_success_rate,
          prog.advancement_progress,
          prog.advancement_criteria,
          characterId
        ]
      );

      if (ownClient) await client.query('COMMIT');

    } catch (err) {
      if (ownClient) await client.query('ROLLBACK');
      throw err;
    } finally {
      if (ownClient) client.release();
    }
  }

  async getProgressionStatus(characterId) {
    if (!validateHexId(characterId)) return null;

    const res = await this.pool.query(
      'SELECT * FROM character_belt_progression WHERE character_id = $1',
      [characterId]
    );
    const prog = res.rows[0];
    if (!prog) return null;

    const currentBelt   = prog.current_belt;
    const currentStripes = prog.current_stripes;
    const nextStripes   = currentStripes + 1;
    let nextBelt        = currentBelt;
    let nextReqs        = this.getBeltRequirements(currentBelt, nextStripes);

    if (!nextReqs) {
      const idx = BELT_ORDER.indexOf(currentBelt);
      if (idx !== -1 && idx < BELT_ORDER.length - 1) {
        nextBelt = BELT_ORDER[idx + 1];
        nextReqs = this.getBeltRequirements(nextBelt, 0);
      }
    }

    const cyclesReq = nextReqs?.cycles ?? 0;
    const cyclesDone = (prog.advancement_progress?.cycles_completed ?? 0);

    return {
      character_id: characterId,
      current_belt: currentBelt,
      current_stripes: currentStripes,
      total_tse_cycles: prog.total_tse_cycles ?? 0,
      successful_cycles: prog.successful_cycles ?? 0,
      success_rate: ((prog.current_success_rate ?? 0) * 100).toFixed(1) + '%',
      progress_to_next: cyclesReq > 0 ? `${cyclesDone} / ${cyclesReq} TSE cycles` : 'N/A',
      next_milestone: nextReqs ? `${nextBelt.replace('_belt', ' Belt')} - ${nextStripes} Stripe(s)` : 'Max Rank',
      last_evaluation_score: prog.last_evaluation_score ?? 0.0,
      advancement_criteria: prog.advancement_criteria || {}
    };
  }

  async getKnowledgeDomainProgress(characterId) {
    if (!validateHexId(characterId)) return {};

    const res = await this.pool.query(
      'SELECT knowledge_domain_scores FROM character_belt_progression WHERE character_id = $1',
      [characterId]
    );
    const scores = res.rows[0]?.knowledge_domain_scores || {};

    const result = {};
    for (const domainId in scores) {
      if (validateHexId(domainId)) {
        result[domainId] = parseFloat(scores[domainId]).toFixed(2);
      }
    }
    return result;
  }
}
