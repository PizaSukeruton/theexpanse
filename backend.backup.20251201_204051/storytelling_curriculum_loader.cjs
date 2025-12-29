const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');

class StorytellingCurriculumLoader {
    constructor(connectionConfig) {
        this.db = new Pool(connectionConfig);
    }

    generateHexId() {
        return '#' + crypto.randomBytes(3).toString('hex').toUpperCase();
    }

    async loadCurriculum(jsonFilePath) {
        try {
            const rawData = fs.readFileSync(jsonFilePath, 'utf8');
            const curriculum = JSON.parse(rawData);
            
            console.log(`Loading curriculum: ${curriculum.phase_name}`);
            console.log(`Total lessons: ${curriculum.total_lessons}`);
            console.log(`Total task types: ${curriculum.total_task_types}\n`);

            for (const lesson of curriculum.lessons) {
                await this.insertLesson(lesson);
            }

            console.log('✓ Curriculum loaded successfully');
            await this.db.end();
        } catch (error) {
            console.error('Error loading curriculum:', error);
            throw error;
        }
    }

    async insertLesson(lesson) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN');

            const lessonId = lesson.lesson_id;
            console.log(`\n→ Inserting Lesson: ${lesson.lesson_name} (${lessonId})`);

            await client.query(`
                INSERT INTO tse_storytelling_lessons (
                    lesson_id, module_id, track_name, lesson_name, level, difficulty,
                    knowledge_domain, prerequisites, character_id, unlocks_next_lesson,
                    learning_objectives, teacher_definition, teacher_micro_examples,
                    teacher_worked_example
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
                lessonId,
                lesson.module_id,
                lesson.track_name,
                lesson.lesson_name,
                lesson.level,
                lesson.difficulty,
                lesson.knowledge_domain,
                lesson.prerequisites,
                lesson.character_id,
                lesson.unlocks_next_lesson,
                lesson.learning_objectives,
                lesson.teacher_block.definition,
                lesson.teacher_block.micro_examples,
                lesson.teacher_block.worked_example
            ]);

            for (const task of lesson.task_types) {
                await this.insertTask(client, lessonId, task);
            }

            const metadataId = this.generateHexId();
            await client.query(`
                INSERT INTO tse_storytelling_metadata (
                    metadata_id, lesson_id, character_id, trait_influences,
                    spaced_repetition_profile_id, unlocks_next_lesson
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                metadataId,
                lessonId,
                lesson.character_id,
                JSON.stringify(lesson.tse_metadata.trait_influences),
                lesson.tse_metadata.spaced_repetition_profile_id,
                lesson.tse_metadata.unlocks_next_lesson
            ]);

            await client.query('COMMIT');
            console.log(`  ✓ Lesson inserted with ${lesson.task_types.length} tasks`);
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(`Error inserting lesson: ${error.message}`);
            throw error;
        } finally {
            client.release();
        }
    }

    async insertTask(client, lessonId, task) {
        const taskTypeId = task.task_type_id;
        
        await client.query(`
            INSERT INTO tse_storytelling_task_types (
                task_type_id, lesson_id, task_name, difficulty,
                prompt_template, expected_output_format, input_pool
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            taskTypeId,
            lessonId,
            task.task_name,
            task.difficulty,
            task.prompt_template,
            task.expected_output_format,
            JSON.stringify(task.input_pool)
        ]);

        const rubricId = this.generateHexId();
        await client.query(`
            INSERT INTO tse_storytelling_rubrics (
                rubric_id, task_type_id, features, total_possible_score, grade_mapping
            ) VALUES ($1, $2, $3, $4, $5)
        `, [
            rubricId,
            taskTypeId,
            JSON.stringify(task.evaluator_rubric.features),
            task.evaluator_rubric.total_possible_score,
            JSON.stringify(task.evaluator_rubric.grade_mapping)
        ]);

        for (const example of task.worked_examples) {
            const exampleId = this.generateHexId();
            await client.query(`
                INSERT INTO tse_storytelling_worked_examples (
                    example_id, task_type_id, input_text, correct_output,
                    why_correct, incorrect_output, why_incorrect
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                exampleId,
                taskTypeId,
                example.input,
                example.correct_output,
                example.why_correct,
                example.incorrect_output || null,
                example.why_incorrect || null
            ]);
        }

        console.log(`    ✓ Task: ${task.task_name} (${taskTypeId})`);
    }

    async initializeCharacterState(characterId) {
        const stateId = this.generateHexId();
        
        const firstLesson = await this.db.query(`
            SELECT lesson_id FROM tse_storytelling_lessons
            WHERE level = 1 AND track_name = 'storytelling_tanuki_v1'
            ORDER BY created_at ASC
            LIMIT 1
        `);

        if (firstLesson.rows.length === 0) {
            throw new Error('No lessons found. Curriculum not loaded.');
        }

        const currentLessonId = firstLesson.rows[0].lesson_id;

        await this.db.query(`
            INSERT INTO tse_character_storytelling_state (
                state_id, character_id, current_lesson_id, completed_lessons,
                in_progress_lessons, lesson_progress
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (character_id) DO UPDATE SET
                current_lesson_id = EXCLUDED.current_lesson_id,
                last_updated = NOW()
        `, [
            stateId,
            characterId,
            currentLessonId,
            [],
            [currentLessonId],
            JSON.stringify({ [currentLessonId]: { status: 'in_progress', score: 0, attempts: 0 } })
        ]);

        console.log(`✓ Initialized storytelling state for character: ${characterId}`);
        return stateId;
    }

    async verifyLoad() {
        const results = await this.db.query(`
            SELECT 
                (SELECT COUNT(*) FROM tse_storytelling_lessons) AS lesson_count,
                (SELECT COUNT(*) FROM tse_storytelling_task_types) AS task_count,
                (SELECT COUNT(*) FROM tse_storytelling_rubrics) AS rubric_count,
                (SELECT COUNT(*) FROM tse_storytelling_worked_examples) AS example_count;
        `);

        const counts = results.rows[0];
        console.log('\n═══════════════════════════════════════════════');
        console.log('CURRICULUM LOAD VERIFICATION');
        console.log('═══════════════════════════════════════════════');
        console.log(`Lessons:        ${counts.lesson_count}`);
        console.log(`Task Types:     ${counts.task_count}`);
        console.log(`Rubrics:        ${counts.rubric_count}`);
        console.log(`Worked Examples: ${counts.example_count}`);
        console.log('═══════════════════════════════════════════════');

        if (counts.lesson_count === 4 && counts.task_count === 12) {
            console.log('✓ VERIFICATION PASSED: All curriculum data loaded');
            return true;
        } else {
            console.log('✗ VERIFICATION FAILED: Data count mismatch');
            return false;
        }
    }

    async getSampleLessonForCharacter(characterId) {
        const result = await this.db.query(`
            SELECT 
                l.lesson_id,
                l.lesson_name,
                l.teacher_definition,
                l.teacher_micro_examples,
                l.teacher_worked_example,
                t.task_type_id,
                t.task_name,
                t.prompt_template,
                t.expected_output_format,
                r.features,
                r.grade_mapping,
                cs.state_id
            FROM tse_character_storytelling_state cs
            JOIN tse_storytelling_lessons l ON cs.current_lesson_id = l.lesson_id
            JOIN tse_storytelling_task_types t ON l.lesson_id = t.lesson_id
            JOIN tse_storytelling_rubrics r ON t.task_type_id = r.task_type_id
            WHERE cs.character_id = $1
            ORDER BY t.difficulty ASC
            LIMIT 1
        `, [characterId]);

        if (result.rows.length === 0) {
            throw new Error(`No lesson found for character: ${characterId}`);
        }

        return result.rows[0];
    }
}

async function main() {
    const connectionConfig = {
        user: process.env.DB_USER || 'pizasukerutondb_user',
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'pizasukerutondb'
    };

    const loader = new StorytellingCurriculumLoader(connectionConfig);

    try {
        const jsonPath = './GPT_PHASE1_LESSONS_COMPLETE.json';
        await loader.loadCurriculum(jsonPath);

        const verified = await loader.verifyLoad();

        if (verified) {
            const tanukiCharacterId = '#700005';
            await loader.initializeCharacterState(tanukiCharacterId);

            const sampleLesson = await loader.getSampleLessonForCharacter(tanukiCharacterId);
            console.log('\n✓ Sample lesson retrieved for Claude The Tanuki:');
            console.log(`  Lesson: ${sampleLesson.lesson_name}`);
            console.log(`  First Task: ${sampleLesson.task_name}`);
        }
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { StorytellingCurriculumLoader };
