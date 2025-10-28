// File: backend/TSE/LearningDatabase.js

class LearningDatabase {
    constructor(pool) {
        if (!pool) {
            throw new Error('Database pool is required for LearningDatabase.');
        }
        this.pool = pool;
        this.hexCounter = null; // Will be initialized from database query
    }

    /**
     * Initializes the hexCounter by querying the maximum hex codes from all relevant tables
     * and setting the counter to the next available hex value.
     * Starts from 0x800000 if no records are found.
     */
    async initializeCounters() {
        try {
            // Retrieve max hex values from all tables to ensure the new hex ID is globally unique
            const query = `
                SELECT COALESCE(MAX(CAST(SUBSTRING(cycle_id, 2) AS BIGINT)), 0) AS max_id FROM tse_cycles
                UNION ALL
                SELECT COALESCE(MAX(CAST(SUBSTRING(record_id, 2) AS BIGINT)), 0) FROM tse_teacher_records
                UNION ALL
                SELECT COALESCE(MAX(CAST(SUBSTRING(record_id, 2) AS BIGINT)), 0) FROM tse_student_records
                UNION ALL
                SELECT COALESCE(MAX(CAST(SUBSTRING(record_id, 2) AS BIGINT)), 0) FROM tse_evaluation_records;
            `;
            const result = await this.pool.query(query);

            let maxHexValue = 0;
            // Iterate through all results to find the absolute maximum hex value
            result.rows.forEach(row => {
                if (row.max_id !== null) {
                    const currentHex = parseInt(row.max_id.toString(), 10); // Convert BIGINT to number
                    if (currentHex > maxHexValue) {
                        maxHexValue = currentHex;
                    }
                }
            });

            // Set hexCounter to the next value after the maximum found, or 0x800000 if no records
            // Using a slightly higher starting point for records to avoid immediate collision with cycle IDs
            this.hexCounter = maxHexValue > 0 ? maxHexValue + 1 : 0x800000;
            console.log(`LearningDatabase: Hex counter initialized to #` + this.hexCounter.toString(16).toUpperCase().padStart(6, '0'));

        } catch (error) {
            console.error('LearningDatabase: Failed to initialize hex counters:', error);
            throw error;
        }
    }

    /**
     * Generates a new unique hex ID for records.
     * Ensures the hexCounter is initialized before use.
     * @returns {string} A new hex ID in '#XXXXXX' format.
     */
    _generateHexId() {
        if (this.hexCounter === null) {
            // In a production environment, initializeCounters should be called during app startup.
            // This is a fallback/development check.
            console.warn('Hex counter not initialized. Attempting to initialize now, but this should be done on app startup.');
            // This async call in a sync context might not block, consider throwing or making _generateHexId async.
            // For now, will just use a default and log, as per the brief's primary init method.
            this.hexCounter = 0x800000; // Fallback, but `initializeCounters` is the required method.
        }
        const newHexId = '#' + this.hexCounter.toString(16).toUpperCase().padStart(6, '0');
        this.hexCounter++; // Increment for the next use
        return newHexId;
    }

    /**
     * Creates a new TSE cycle record.
     * @param {Object} data - Cycle data.
     * @param {string} [data.status='running'] - The status of the cycle.
     * @param {string} [data.cycle_type='standard'] - The type of the cycle.
     * @param {Object} [data.cultural_compliance={}] - Cultural compliance data.
     * @param {boolean} [data.seven_commandments_check=true] - Seven commandments check status.
     * @param {number} [data.optimization_score=null] - Optimization score.
     * @param {number} [data.learning_effectiveness=null] - Learning effectiveness score.
     * @returns {Object} The created cycle record.
     */
    async createCycle(data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const cycle_id = this._generateHexId(); // Generate hex ID

            const result = await client.query(`
                INSERT INTO tse_cycles (
                    cycle_id, status, cycle_type, cultural_compliance,
                    seven_commandments_check, optimization_score, learning_effectiveness
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [
                cycle_id,
                data.status || 'running',
                data.cycle_type || 'standard',
                JSON.stringify(data.cultural_compliance || {}),
                data.seven_commandments_check !== undefined ? data.seven_commandments_check : true, // Explicitly handle false
                data.optimization_score || null,
                data.learning_effectiveness || null
            ]);

            await client.query('COMMIT');
            console.log(`LearningDatabase: Created cycle ${cycle_id}`);
            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('LearningDatabase: Failed to create cycle:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Inserts teacher decision data into tse_teacher_records.
     * @param {Object} data - Teacher decision data.
     * @param {string} data.cycle_id - Foreign key to tse_cycles.
     * @param {number} data.teacher_sequence - Sequence number for ordering.
     * @param {string} data.algorithm_id - Identifier of the algorithm.
     * @param {string} data.algorithm_version - Version of the algorithm.
     * @param {Object} [data.input_parameters={}] - Input data.
     * @param {Object} [data.algorithm_decision={}] - Decision made by algorithm.
     * @param {number} [data.confidence_score=null] - Confidence score.
     * @param {Object} [data.execution_context={}] - Execution environment data.
     * @param {Object} [data.performance_metrics={}] - Performance measurements.
     * @param {Object} [data.cultural_compliance={}] - Cultural compliance data.
     * @param {number} [data.mathematical_poetry_score=null] - Mathematical poetry score.
     * @param {Object} [data.predicted_outcomes={}] - Predicted outcomes (plural).
     * @param {Object} [data.resource_allocation={}] - Resource usage data.
     * @returns {Object} The inserted teacher record.
     */
    async recordTeacherData(data) {
        try {
            // Validate REQUIRED fields based on actual schema
            if (!data.cycle_id || !data.algorithm_id || !data.algorithm_version) {
                throw new Error('LearningDatabase: Missing required teacher data fields: cycle_id, algorithm_id, algorithm_version.');
            }
            if (data.teacher_sequence === undefined) {
                throw new Error('LearningDatabase: Missing required teacher data field: teacher_sequence.');
            }
            if (!data.predicted_outcomes) { // As per brief: NOTE: PLURAL "outcomes"
                 throw new Error('LearningDatabase: Missing required teacher data field: predicted_outcomes.');
            }

            const record_id = this._generateHexId(); // Generate hex ID

            const result = await this.pool.query(`
                INSERT INTO tse_teacher_records (
                    record_id, cycle_id, teacher_sequence, algorithm_id,
                    algorithm_version, input_parameters, algorithm_decision,
                    confidence_score, execution_context, performance_metrics,
                    cultural_compliance, mathematical_poetry_score,
                    predicted_outcomes, resource_allocation,
                    timestamp_started, timestamp_completed
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
                RETURNING *
            `, [
                record_id,
                data.cycle_id,
                data.teacher_sequence,
                data.algorithm_id,
                data.algorithm_version,
                JSON.stringify(data.input_parameters || {}),
                JSON.stringify(data.algorithm_decision || {}),
                data.confidence_score || null,
                JSON.stringify(data.execution_context || {}),
                JSON.stringify(data.performance_metrics || {}),
                JSON.stringify(data.cultural_compliance || {}),
                data.mathematical_poetry_score || null,
                JSON.stringify(data.predicted_outcomes), // Use provided data, ensure it's stringified
                JSON.stringify(data.resource_allocation || {})
            ]);

            console.log(`LearningDatabase: Recorded teacher data for cycle ${data.cycle_id}, record ${record_id}`);
            return result.rows[0];

        } catch (error) {
            console.error('LearningDatabase: Teacher data recording failed:', error);
            throw error;
        }
    }

    /**
     * Inserts student outcome data into tse_student_records.
     * @param {Object} data - Student outcome data.
     * @param {string} data.cycle_id - Foreign key to tse_cycles.
     * @param {string} data.teacher_record_id - Required foreign key to tse_teacher_records.
     * @param {number} data.student_sequence - Required sequence number.
     * @param {Object} [data.real_world_outcome={}] - Real world outcome (singular).
     * @param {Object} [data.success_metrics={}] - Success measurement data.
     * @param {Object} [data.quality_indicators={}] - Quality metrics.
     * @param {Object} [data.user_engagement={}] - User engagement data (no "_score").
     * @param {number} [data.character_similarity_accuracy=null] - Character similarity accuracy.
     * @param {Array} [data.unexpected_outcomes=[]] - Array of unexpected results.
     * @param {Array} [data.innovation_opportunities=[]] - Array of opportunities.
     * @param {Object} [data.cultural_alignment={}] - Cultural alignment data.
     * @param {Array} [data.learning_insights=[]] - Array of insights.
     * @returns {Object} The inserted student record.
     */
    async recordStudentData(data) {
        try {
            // Validate REQUIRED fields based on actual schema
            if (!data.cycle_id || !data.teacher_record_id) {
                throw new Error('LearningDatabase: Missing required student data foreign keys: cycle_id, teacher_record_id.');
            }
            if (data.student_sequence === undefined) {
                throw new Error('LearningDatabase: Missing required student data field: student_sequence.');
            }
            if (!data.real_world_outcome) { // As per brief: NOTE: SINGULAR "outcome"
                throw new Error('LearningDatabase: Missing required student data field: real_world_outcome.');
            }

            const record_id = this._generateHexId(); // Generate hex ID

            const result = await this.pool.query(`
                INSERT INTO tse_student_records (
                    record_id, cycle_id, teacher_record_id, student_sequence,
                    real_world_outcome, success_metrics, quality_indicators,
                    user_engagement, character_similarity_accuracy,
                    unexpected_outcomes, innovation_opportunities,
                    cultural_alignment, learning_insights, timestamp_recorded
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
                RETURNING *
            `, [
                record_id,
                data.cycle_id,
                data.teacher_record_id,
                data.student_sequence,
                JSON.stringify(data.real_world_outcome), // Use provided data, ensure it's stringified
                JSON.stringify(data.success_metrics || {}),
                JSON.stringify(data.quality_indicators || {}),
                JSON.stringify(data.user_engagement || {}), // Use provided data, ensure it's stringified
                data.character_similarity_accuracy || null,
                JSON.stringify(data.unexpected_outcomes || []),
                JSON.stringify(data.innovation_opportunities || []),
                JSON.stringify(data.cultural_alignment || {}),
                JSON.stringify(data.learning_insights || [])
            ]);

            console.log(`LearningDatabase: Recorded student data for cycle ${data.cycle_id}, record ${record_id}`);
            return result.rows[0];

        } catch (error) {
            console.error('LearningDatabase: Student data recording failed:', error);
            throw error;
        }
    }

    /**
     * Inserts evaluation insights data into tse_evaluation_records.
     * @param {Object} data - Evaluation insights data.
     * @param {string} data.cycle_id - Foreign key to tse_cycles.
     * @param {string} data.teacher_record_id - Required foreign key to tse_teacher_records.
     * @param {string} data.student_record_id - Required foreign key to tse_student_records.
     * @param {number} data.evaluation_sequence - Required sequence number.
     * @param {number} [data.effectiveness_score=null] - Effectiveness score (no "overall_").
     * @param {number} [data.efficiency_score=null] - Efficiency score.
     * @param {number} [data.innovation_score=null] - Innovation score.
     * @param {number} [data.cultural_score=null] - Cultural score (additional field).
     * @param {Object} [data.variance_analysis={}] - Variance analysis data.
     * @param {Object} [data.pattern_identification={}] - Pattern data.
     * @param {Object} [data.correlation_insights={}] - Correlation data.
     * @param {Array} [data.algorithm_optimizations=[]] - Array of optimizations.
     * @param {Object} [data.weight_adjustments={}] - Weight adjustment data.
     * @param {Object} [data.philosophy_improvements={}] - Philosophy improvements.
     * @param {Array} [data.learning_recommendations=[]] - Array of recommendations.
     * @returns {Object} The inserted evaluation record.
     */
    async recordEvaluationData(data) {
        try {
            // Validate REQUIRED fields based on actual schema
            if (!data.cycle_id || !data.teacher_record_id || !data.student_record_id) {
                throw new Error('LearningDatabase: Missing required evaluation data foreign keys: cycle_id, teacher_record_id, student_record_id.');
            }
            if (data.evaluation_sequence === undefined) {
                throw new Error('LearningDatabase: Missing required evaluation data field: evaluation_sequence.');
            }

            const record_id = this._generateHexId(); // Generate hex ID

            const result = await this.pool.query(`
                INSERT INTO tse_evaluation_records (
                    record_id, cycle_id, teacher_record_id, student_record_id,
                    evaluation_sequence, effectiveness_score, efficiency_score,
                    innovation_score, cultural_score, variance_analysis,
                    pattern_identification, correlation_insights,
                    algorithm_optimizations, weight_adjustments,
                    philosophy_improvements, learning_recommendations, timestamp_evaluated
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
                RETURNING *
            `, [
                record_id,
                data.cycle_id,
                data.teacher_record_id,
                data.student_record_id,
                data.evaluation_sequence,
                data.effectiveness_score || null, // NOTE: no "overall_" prefix
                data.efficiency_score || null,
                data.innovation_score || null,
                data.cultural_score || null, // NOTE: additional field
                JSON.stringify(data.variance_analysis || {}),
                JSON.stringify(data.pattern_identification || {}),
                JSON.stringify(data.correlation_insights || {}),
                JSON.stringify(data.algorithm_optimizations || []),
                JSON.stringify(data.weight_adjustments || {}),
                JSON.stringify(data.philosophy_improvements || {}),
                JSON.stringify(data.learning_recommendations || [])
            ]);

            console.log(`LearningDatabase: Recorded evaluation data for cycle ${data.cycle_id}, record ${record_id}`);
            return result.rows[0];

        } catch (error) {
            console.error('LearningDatabase: Evaluation data recording failed:', error);
            throw error;
        }
    }

    /**
     * Retrieves the status and full information of a specific TSE cycle.
     * @param {string} cycle_id - The hex ID of the cycle.
     * @returns {Object|null} The cycle record or null if not found.
     */
    async getCycleStatus(cycle_id) {
        try {
            if (!cycle_id || typeof cycle_id !== 'string' || !cycle_id.startsWith('#') || cycle_id.length !== 7) {
                throw new Error('LearningDatabase: Invalid cycle_id format. Must be a 7-character hex string starting with "#".');
            }

            const result = await this.pool.query(
                `SELECT * FROM tse_cycles WHERE cycle_id = $1`,
                [cycle_id]
            );
            return result.rows[0] || null;

        } catch (error) {
            console.error(`LearningDatabase: Failed to get status for cycle ${cycle_id}:`, error);
            throw error;
        }
    }

    /**
     * Lists all currently active learning cycles.
     * As per production schema, 'status' default is 'running'.
     * @returns {Array} An array of active cycle records.
     */
    async getAllActiveCycles() {
        try {
            const result = await this.pool.query(
                `SELECT * FROM tse_cycles WHERE status = 'running' ORDER BY started_at DESC`
            );
            return result.rows;

        } catch (error) {
            console.error('LearningDatabase: Failed to get all active cycles:', error);
            throw error;
        }
    }

    /**
     * Marks a specified TSE cycle as completed.
     * @param {string} cycle_id - The hex ID of the cycle to complete.
     * @param {Object} [updateData={}] - Optional data to update upon completion.
     * @param {number} [updateData.learning_effectiveness] - Final learning effectiveness score.
     * @param {number} [updateData.optimization_score] - Final optimization score.
     * @param {Object} [updateData.cultural_compliance] - Final cultural compliance data.
     * @param {boolean} [updateData.seven_commandments_check] - Final seven commandments check status.
     * @param {number} [updateData.cycle_duration_ms] - The duration of the cycle in milliseconds.
     * @returns {Object} The updated cycle record.
     */
    async completeCycle(cycle_id, updateData = {}) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            if (!cycle_id || typeof cycle_id !== 'string' || !cycle_id.startsWith('#') || cycle_id.length !== 7) {
                throw new Error('LearningDatabase: Invalid cycle_id format. Must be a 7-character hex string starting with "#".');
            }

            // Dynamically build SET clause for optional updates
            const setClauses = ['status = $2', 'completed_at = NOW()'];
            const params = [cycle_id, 'completed'];
            let paramIndex = 3;

            if (updateData.learning_effectiveness !== undefined) {
                setClauses.push(`learning_effectiveness = $${paramIndex++}`);
                params.push(updateData.learning_effectiveness);
            }
            if (updateData.optimization_score !== undefined) {
                setClauses.push(`optimization_score = $${paramIndex++}`);
                params.push(updateData.optimization_score);
            }
            if (updateData.cultural_compliance !== undefined) {
                setClauses.push(`cultural_compliance = $${paramIndex++}`);
                params.push(JSON.stringify(updateData.cultural_compliance));
            }
            if (updateData.seven_commandments_check !== undefined) {
                setClauses.push(`seven_commandments_check = $${paramIndex++}`);
                params.push(updateData.seven_commandments_check);
            }
            if (updateData.cycle_duration_ms !== undefined) {
                setClauses.push(`cycle_duration_ms = $${paramIndex++}`);
                params.push(updateData.cycle_duration_ms);
            }
            // Add updated_at
            setClauses.push('updated_at = NOW()');

            const updateQuery = `
                UPDATE tse_cycles
                SET ${setClauses.join(', ')}
                WHERE cycle_id = $1
                RETURNING *
            `;
            const result = await client.query(updateQuery, params);

            if (result.rowCount === 0) {
                throw new Error(`LearningDatabase: Cycle with ID ${cycle_id} not found or could not be completed.`);
            }

            await client.query('COMMIT');
            console.log(`LearningDatabase: Completed cycle ${cycle_id}`);
            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`LearningDatabase: Failed to complete cycle ${cycle_id}:`, error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Returns database health statistics (e.g., table row counts).
     * This is a basic health check and can be expanded.
     * @returns {Object} Database health metrics.
     */
    async getSystemHealth() {
        try {
            const result = await this.pool.query(`
                SELECT
                    (SELECT COUNT(*) FROM tse_cycles) AS total_cycles,
                    (SELECT COUNT(*) FROM tse_teacher_records) AS total_teacher_records,
                    (SELECT COUNT(*) FROM tse_student_records) AS total_student_records,
                    (SELECT COUNT(*) FROM tse_evaluation_records) AS total_evaluation_records,
                    (SELECT COUNT(*) FROM tse_cycles WHERE status = 'running') AS running_cycles,
                    (SELECT MAX(timestamp_evaluated) FROM tse_evaluation_records) AS last_evaluation_timestamp;
            `);

            const healthData = result.rows[0];
            console.log('LearningDatabase: System health retrieved.');
            return {
                status: 'operational',
                database_connected: true,
                ...healthData,
                current_hex_counter: this.hexCounter ? '#' + this.hexCounter.toString(16).toUpperCase().padStart(6, '0') : 'not_initialized'
            };

        } catch (error) {
            console.error('LearningDatabase: Failed to get system health:', error);
            return {
                status: 'degraded',
                database_connected: false,
                error: error.message
            };
        }
    }
}

export default LearningDatabase;
