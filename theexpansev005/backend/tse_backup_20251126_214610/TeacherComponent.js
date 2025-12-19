/**
 * TeacherComponent.js
 * Manages the "Teacher" phase of the TSE loop, recording the AI's internal
 * decisions, confidence, and predictions before an outcome is known.
 * Department: Teacher Records (#8A0000-#8FFFFF)
 */
class TeacherComponent {
    constructor(pool) {
        if (!pool) {
            throw new Error('Database pool is required for TeacherComponent');
        }
        this.pool = pool;
        this.isInitialized = false;
        this.hexCounter = null;
    }

    async initialize() {
        try {
            await this.initializeHexCounter();
            this.isInitialized = true;
            console.log('✅ TeacherComponent initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ TeacherComponent initialization failed:', error);
            this.isInitialized = false;
            return false;
        }
    }

    async initializeHexCounter() {
        try {
            const result = await this.pool.query(
                `SELECT record_id FROM tse_teacher_records 
                 WHERE record_id >= '#8A0000' AND record_id <= '#8FFFFF'
                 ORDER BY record_id DESC LIMIT 1`
            );
            if (result.rows.length > 0) {
                this.hexCounter = parseInt(result.rows[0].record_id.substring(1), 16) + 1;
            } else {
                this.hexCounter = 0x8A0000;
            }
            console.log(`🧑‍🏫 TeacherComponent hex counter initialized at: #${this.hexCounter.toString(16).toUpperCase()}`);
        } catch (error) {
            console.error("Error initializing TeacherComponent hex counter", error);
            this.hexCounter = 0x8A0000;
        }
    }
    
    _generateNewRecordId() {
        if (this.hexCounter === null) throw new Error('TeacherComponent hex counter not initialized.');
        const hexId = `#${this.hexCounter.toString(16).toUpperCase().padStart(6, '0')}`;
        this.hexCounter++;
        return hexId;
    }

    async recordChatDecision(cycleId, data) {
        const client = await this.pool.connect();
        try {
            const {
                algorithm_decision, confidence_score, predicted_outcomes,
                message_processing_context, character_selection_reasoning
            } = data;
            
            const record_id = this._generateNewRecordId();

            // THE FIX IS HERE: Cast the second use of $2 to ::varchar
            const query = `
                INSERT INTO tse_teacher_records (
                    record_id, cycle_id, teacher_sequence, algorithm_id, algorithm_version,
                    algorithm_decision, confidence_score, predicted_outcomes,
                    message_processing_context, character_selection_reasoning
                ) VALUES (
                    $1, $2, 
                    (SELECT COALESCE(MAX(teacher_sequence), 0) + 1 FROM tse_teacher_records WHERE cycle_id = $2::varchar), 
                    $3, $4, $5, $6, $7, $8, $9
                )
                RETURNING *;
            `;

            const values = [
                record_id,                        // $1 - VARCHAR(7)
                cycleId,                          // $2 - VARCHAR(7)
                'chat_algorithm',                 // $3 - VARCHAR(100)
                '1.0.0',                          // $4 - VARCHAR(20)
                algorithm_decision || {},         // $5 - JSONB
                confidence_score || null,         // $6 - DECIMAL
                predicted_outcomes || {},         // $7 - JSONB
                message_processing_context || {}, // $8 - JSONB
                character_selection_reasoning || null // $9 - TEXT
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("❌ Database error in TeacherComponent.recordChatDecision:", error);
            throw error;
        } finally {
            client.release();
        }
    }
}

export default TeacherComponent;
