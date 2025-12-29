import pool from '../db/pool.js';
import generateHexId from './hexIdGenerator.js';

class DossierGenerator {
  async trackEntityResearch(userId, entityName, entityType, queryCount, significanceScore) {
    const dossierThreshold = 3;
    
    if (queryCount >= dossierThreshold) {
      return await this.createDossierEntry(
        userId,
        entityName,
        entityType,
        queryCount,
        significanceScore
      );
    }

    return {
      dossierCreated: false,
      progressToward: dossierThreshold,
      currentCount: queryCount,
      remaining: dossierThreshold - queryCount
    };
  }

  async createDossierEntry(userId, entityName, entityType, researchDepth, significanceScore) {
    const dossierId = await generateHexId('conversation_id');
    
    const entry = {
      dossier_id: dossierId,
      user_id: userId,
      entity_name: entityName,
      entity_type: entityType,
      research_depth: researchDepth,
      significance_score: significanceScore,
      research_level: this.calculateResearchLevel(researchDepth),
      council_worthiness: this.calculateCouncilWorthiness(researchDepth, significanceScore),
      created_at: new Date().toISOString(),
      notes: this.generateDossierNote(entityName, researchDepth)
    };

    try {
      const insertQuery = `
        INSERT INTO tse_dossier_entries (
          dossier_id,
          user_id,
          entity_name,
          entity_type,
          research_depth,
          significance_score,
          research_level,
          council_worthiness,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

      await pool.query(insertQuery, [
        entry.dossier_id,
        entry.user_id,
        entry.entity_name,
        entry.entity_type,
        entry.research_depth,
        entry.significance_score,
        entry.research_level,
        entry.council_worthiness,
        entry.created_at
      ]);
    } catch (dbError) {
      console.error('Dossier INSERT failed:', dbError.message);
      throw dbError;
    }

    return {
      dossierCreated: true,
      entry,
      claudeResponse: this.generateClaudeResponse(entityName, researchDepth),
      councilProgressUpdate: await this.updateCouncilProgress(userId)
    };
  }

  calculateResearchLevel(queryCount) {
    if (queryCount < 3) return 'NOVICE';
    if (queryCount < 7) return 'APPRENTICE';
    if (queryCount < 12) return 'SCHOLAR';
    if (queryCount < 20) return 'ARCHIVIST';
    return 'MASTER';
  }

  calculateCouncilWorthiness(researchDepth, significanceScore) {
    const depthScore = Math.min(researchDepth / 20, 1.0) * 0.6;
    const significanceWeighting = significanceScore * 0.4;
    return Math.round((depthScore + significanceWeighting) * 100);
  }

  generateDossierNote(entityName, queryCount) {
    const notes = {
      3: `Initial research into ${entityName} completed.`,
      5: `Solid understanding of ${entityName} emerging.`,
      7: `Deep knowledge of ${entityName} documented.`,
      12: `Expert-level research on ${entityName} achieved.`,
      20: `Comprehensive mastery of ${entityName} demonstrated.`
    };

    for (const [count, note] of Object.entries(notes).reverse()) {
      if (queryCount >= parseInt(count)) {
        return note;
      }
    }
    return `Research into ${entityName} in progress.`;
  }

  generateClaudeResponse(entityName, queryCount) {
    const responses = [
      `You're really digging into this. The Council of The Wise would take notice of this kind of research. I've logged this in your **Dossier** - shows you're serious about understanding the lore.`,
      `Three solid questions about ${entityName}. You're thinking like a true Council member. I've documented what we've learned.`,
      `Your research into ${entityName} is impressive. You're building real credentials here. Council material, if you ask me.`,
      `${queryCount} questions deep on ${entityName}? That's the kind of dedication the Council needs. Noted in your Dossier.`,
      `You've become quite the expert on ${entityName}. The Council will definitely want members who know this level of detail.`
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return randomResponse.replace('${entityName}', entityName);
  }

  async updateCouncilProgress(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_dossiers,
        AVG(council_worthiness) as average_worthiness,
        MAX(research_level) as highest_level
      FROM tse_dossier_entries
      WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      if (result.rows.length > 0) {
        const stats = result.rows[0];
        return {
          totalDossiers: stats.total_dossiers,
          averageWorthiness: Math.round(stats.average_worthiness),
          highestResearchLevel: stats.highest_level,
          councilReadiness: this.assessCouncilReadiness(stats)
        };
      }
    } catch (error) {
      console.error('Error updating Council progress:', error.message);
    }

    return { councilReadiness: 'NOVICE_RESEARCHER' };
  }

  assessCouncilReadiness(stats) {
    const dossierCount = parseInt(stats.total_dossiers);
    const worthiness = stats.average_worthiness;

    if (dossierCount < 3) return 'BEGINNING_JOURNEY';
    if (dossierCount < 5 && worthiness < 50) return 'EARLY_EXPLORER';
    if (dossierCount < 8 && worthiness < 65) return 'DEDICATED_RESEARCHER';
    if (dossierCount < 12 && worthiness < 75) return 'SERIOUS_SCHOLAR';
    if (dossierCount >= 12 && worthiness >= 75) return 'COUNCIL_CANDIDATE';
    return 'COUNCIL_MATERIAL';
  }
}

export default new DossierGenerator();
