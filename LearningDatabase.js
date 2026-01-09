
  /**
   * Fetch the knowledge state for a character and specific knowledge item
   * Returns null if no record exists yet
   * @param {string} characterId hex ID
   * @param {string} knowledgeId hex ID
   * @returns {Promise<object|null>}
   */
  async getCharacterKnowledgeState(characterId, knowledgeId) {
    try {
      const result = await this.pool.query(`
        SELECT *
        FROM character_knowledge_state
        WHERE character_id = $1
          AND knowledge_id = $2
      `, [characterId, knowledgeId]);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error("[LearningDatabase] getCharacterKnowledgeState failed:", err.message);
      return null;
    }
  }

  /**
   * Mark acquisition as completed for this knowledge item
   * Idempotent (safe to call multiple times)
   * @param {string} characterId
   * @param {string} knowledgeId
   * @returns {Promise<boolean>} true on success
   */
  async markAcquisitionCompleted(characterId, knowledgeId) {
    try {
      await this.pool.query(`
        INSERT INTO character_knowledge_state 
          (character_id, knowledge_id, acquisition_completed, practice_count)
        VALUES ($1, $2, TRUE, 0)
        ON CONFLICT (character_id, knowledge_id)
        DO UPDATE SET acquisition_completed = TRUE
      `, [characterId, knowledgeId]);
      return true;
    } catch (err) {
      console.error("[LearningDatabase] markAcquisitionCompleted failed:", err.message);
      return false;
    }
  }


  /**
   * Fetch the knowledge state for a character and specific knowledge item
   * Returns null if no record exists yet
   * @param {string} characterId hex ID
   * @param {string} knowledgeId hex ID
   * @returns {Promise<object|null>}
   */
  async getCharacterKnowledgeState(characterId, knowledgeId) {
    try {
      const result = await this.pool.query(`
        SELECT *
        FROM character_knowledge_state
        WHERE character_id = $1
          AND knowledge_id = $2
      `, [characterId, knowledgeId]);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error("[LearningDatabase] getCharacterKnowledgeState failed:", err.message);
      return null;
    }
  }

  /**
   * Mark acquisition as completed for this knowledge item
   * Idempotent (safe to call multiple times)
   * @param {string} characterId
   * @param {string} knowledgeId
   * @returns {Promise<boolean>} true on success
   */
  async markAcquisitionCompleted(characterId, knowledgeId) {
    try {
      await this.pool.query(`
        INSERT INTO character_knowledge_state 
          (character_id, knowledge_id, acquisition_completed, practice_count)
        VALUES ($1, $2, TRUE, 0)
        ON CONFLICT (character_id, knowledge_id)
        DO UPDATE SET acquisition_completed = TRUE
      `, [characterId, knowledgeId]);
      return true;
    } catch (err) {
      console.error("[LearningDatabase] markAcquisitionCompleted failed:", err.message);
      return false;
    }
  }


  /**
   * Fetch the knowledge state for a character and specific knowledge item
   * Returns null if no record exists yet
   * @param {string} characterId hex ID
   * @param {string} knowledgeId hex ID
   * @returns {Promise<object|null>}
   */
  async getCharacterKnowledgeState(characterId, knowledgeId) {
    try {
      const result = await this.pool.query(`
        SELECT *
        FROM character_knowledge_state
        WHERE character_id = $1
          AND knowledge_id = $2
      `, [characterId, knowledgeId]);

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
      console.error("[LearningDatabase] getCharacterKnowledgeState failed:", err.message);
      return null;
    }
  }

  /**
   * Mark acquisition as completed for this knowledge item
   * Idempotent (safe to call multiple times)
   * @param {string} characterId
   * @param {string} knowledgeId
   * @returns {Promise<boolean>} true on success
   */
  async markAcquisitionCompleted(characterId, knowledgeId) {
    try {
      await this.pool.query(`
        INSERT INTO character_knowledge_state 
          (character_id, knowledge_id, acquisition_completed, practice_count)
        VALUES ($1, $2, TRUE, 0)
        ON CONFLICT (character_id, knowledge_id)
        DO UPDATE SET acquisition_completed = TRUE
      `, [characterId, knowledgeId]);
      return true;
    } catch (err) {
      console.error("[LearningDatabase] markAcquisitionCompleted failed:", err.message);
      return false;
    }
  }

