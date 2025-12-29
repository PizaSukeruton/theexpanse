import pool from '../db/pool.js';

class DossierUpdater {
  constructor() {
    // Weight of new event vs. long-term history (0.1 = history is very sticky)
    this.HISTORY_ALPHA = 0.1;
  }

  /**
   * Updates the user's psychological dossier based on a new emotional event.
   * Calculates rolling averages to detect long-term temperament.
   * * @param {string} userId - The user's Hex ID
   * @param {string} characterId - The character profile ID
   * @param {object} currentPad - The new PAD state {p, a, d}
   * @param {object} delta - The change that just occurred {p, a, d}
   */
  async processUpdate(userId, characterId, currentPad, delta) {
    try {
      // 1. Fetch existing dossier data
      const res = await pool.query(
        `SELECT dossier_id, pad_snapshot, psychological_profile 
         FROM cotw_dossiers 
         WHERE user_id = $1 AND character_id = $2`,
        [userId, characterId]
      );

      if (res.rows.length === 0) {
        console.log(`[DossierUpdater] No dossier found for ${userId}. Skipping trend analysis.`);
        return;
      }

      const dossier = res.rows[0];
      const history = dossier.psychological_profile || { 
        avg_p: 0, avg_a: 0, avg_d: 0, 
        volatility: 0, 
        sample_count: 0 
      };

      // 2. Calculate Long-Term Rolling Average (Temperament)
      // New Avg = (Old Avg * (1 - Alpha)) + (Current * Alpha)
      const newHistory = {
        avg_p: (history.avg_p || 0) * (1 - this.HISTORY_ALPHA) + (currentPad.p * this.HISTORY_ALPHA),
        avg_a: (history.avg_a || 0) * (1 - this.HISTORY_ALPHA) + (currentPad.a * this.HISTORY_ALPHA),
        avg_d: (history.avg_d || 0) * (1 - this.HISTORY_ALPHA) + (currentPad.d * this.HISTORY_ALPHA),
        sample_count: (history.sample_count || 0) + 1,
        last_update: new Date().toISOString()
      };

      // 3. Calculate Volatility (How unstable is this user?)
      // Magnitude of the recent change
      const eventMagnitude = Math.sqrt(delta.p**2 + delta.a**2 + delta.d**2);
      // Rolling average of volatility
      newHistory.volatility = (history.volatility || 0) * 0.95 + (eventMagnitude * 0.05);

      // 4. Determine Classification Labels
      newHistory.labels = this.generateLabels(newHistory);

      // 5. Update Database
      // We update BOTH the instantaneous snapshot AND the long-term profile
      await pool.query(
        `UPDATE cotw_dossiers 
         SET 
           pad_snapshot = $1, 
           psychological_profile = $2,
           updated_at = NOW()
         WHERE dossier_id = $3`,
        [JSON.stringify(currentPad), JSON.stringify(newHistory), dossier.dossier_id]
      );

      console.log(`[DossierUpdater] Updated ${dossier.dossier_id}: Trend P=${newHistory.avg_p.toFixed(2)} Vol=${newHistory.volatility.toFixed(3)} [${newHistory.labels.join(', ')}]`);

    } catch (err) {
      console.error('[DossierUpdater] Error:', err.message);
    }
  }

  /**
   * Generates human-readable labels for the user's temperament
   */
  generateLabels(history) {
    const labels = [];
    
    // Temperament (Long-term averages)
    if (history.avg_p > 0.3) labels.push('Cheerful');
    if (history.avg_p < -0.3) labels.push('Melancholic');
    if (history.avg_a > 0.4) labels.push('Intense');
    if (history.avg_a < -0.2) labels.push('Calm');
    if (history.avg_d > 0.3) labels.push('Dominant');
    if (history.avg_d < -0.3) labels.push('Submissive');

    // Volatility
    if (history.volatility > 0.15) labels.push('Volatile');
    if (history.volatility < 0.05 && history.sample_count > 10) labels.push('Stable');

    return labels;
  }
}

export default new DossierUpdater();
