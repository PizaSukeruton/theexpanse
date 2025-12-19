CREATE TABLE IF NOT EXISTS tse_storytelling_lessons (
    lesson_id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) NOT NULL,
    track_name VARCHAR(100) NOT NULL,
    lesson_name VARCHAR(255) NOT NULL,
    level SMALLINT NOT NULL,
    difficulty SMALLINT NOT NULL,
    knowledge_domain VARCHAR(100) NOT NULL,
    prerequisites TEXT[] DEFAULT '{}',
    character_id VARCHAR(64) NOT NULL,
    unlocks_next_lesson VARCHAR(64),
    learning_objectives TEXT[] NOT NULL,
    teacher_definition TEXT NOT NULL,
    teacher_micro_examples TEXT[] NOT NULL,
    teacher_worked_example TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_next_lesson FOREIGN KEY (unlocks_next_lesson) REFERENCES tse_storytelling_lessons(lesson_id)
);

CREATE INDEX idx_storytelling_lessons_track ON tse_storytelling_lessons(track_name);
CREATE INDEX idx_storytelling_lessons_level ON tse_storytelling_lessons(level);
CREATE INDEX idx_storytelling_lessons_character ON tse_storytelling_lessons(character_id);

CREATE TABLE IF NOT EXISTS tse_storytelling_task_types (
    task_type_id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    difficulty SMALLINT NOT NULL,
    prompt_template TEXT NOT NULL,
    expected_output_format TEXT NOT NULL,
    input_pool JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_lesson FOREIGN KEY (lesson_id) REFERENCES tse_storytelling_lessons(lesson_id) ON DELETE CASCADE
);

CREATE INDEX idx_storytelling_tasks_lesson ON tse_storytelling_task_types(lesson_id);
CREATE INDEX idx_storytelling_tasks_difficulty ON tse_storytelling_task_types(difficulty);

CREATE TABLE IF NOT EXISTS tse_storytelling_rubrics (
    rubric_id VARCHAR(64) PRIMARY KEY,
    task_type_id VARCHAR(64) NOT NULL,
    features JSONB NOT NULL,
    total_possible_score INTEGER NOT NULL,
    grade_mapping JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_task_type FOREIGN KEY (task_type_id) REFERENCES tse_storytelling_task_types(task_type_id) ON DELETE CASCADE
);

CREATE INDEX idx_storytelling_rubrics_task ON tse_storytelling_rubrics(task_type_id);

CREATE TABLE IF NOT EXISTS tse_storytelling_worked_examples (
    example_id VARCHAR(64) PRIMARY KEY,
    task_type_id VARCHAR(64) NOT NULL,
    input_text TEXT NOT NULL,
    correct_output TEXT NOT NULL,
    why_correct TEXT NOT NULL,
    incorrect_output TEXT,
    why_incorrect TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_task_type FOREIGN KEY (task_type_id) REFERENCES tse_storytelling_task_types(task_type_id) ON DELETE CASCADE
);

CREATE INDEX idx_storytelling_examples_task ON tse_storytelling_worked_examples(task_type_id);

CREATE TABLE IF NOT EXISTS tse_storytelling_metadata (
    metadata_id VARCHAR(64) PRIMARY KEY,
    lesson_id VARCHAR(64) NOT NULL UNIQUE,
    character_id VARCHAR(64) NOT NULL,
    trait_influences JSONB NOT NULL,
    spaced_repetition_profile_id VARCHAR(64) NOT NULL,
    unlocks_next_lesson VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_lesson FOREIGN KEY (lesson_id) REFERENCES tse_storytelling_lessons(lesson_id) ON DELETE CASCADE
);

CREATE INDEX idx_storytelling_metadata_lesson ON tse_storytelling_metadata(lesson_id);
CREATE INDEX idx_storytelling_metadata_character ON tse_storytelling_metadata(character_id);

CREATE TABLE IF NOT EXISTS tse_storytelling_performance (
    performance_id VARCHAR(64) PRIMARY KEY,
    character_id VARCHAR(64) NOT NULL,
    lesson_id VARCHAR(64) NOT NULL,
    task_type_id VARCHAR(64) NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    student_response TEXT NOT NULL,
    score INTEGER NOT NULL,
    fsrs_grade SMALLINT NOT NULL,
    rubric_details JSONB NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_lesson FOREIGN KEY (lesson_id) REFERENCES tse_storytelling_lessons(lesson_id),
    CONSTRAINT fk_task_type FOREIGN KEY (task_type_id) REFERENCES tse_storytelling_task_types(task_type_id)
);

CREATE INDEX idx_storytelling_perf_character ON tse_storytelling_performance(character_id);
CREATE INDEX idx_storytelling_perf_lesson ON tse_storytelling_performance(lesson_id);
CREATE INDEX idx_storytelling_perf_completed ON tse_storytelling_performance(completed_at);

CREATE TABLE IF NOT EXISTS tse_character_storytelling_state (
    state_id VARCHAR(64) PRIMARY KEY,
    character_id VARCHAR(64) NOT NULL UNIQUE,
    current_lesson_id VARCHAR(64),
    completed_lessons VARCHAR(64)[] DEFAULT '{}',
    in_progress_lessons VARCHAR(64)[] DEFAULT '{}',
    lesson_progress JSONB DEFAULT '{}',
    total_score FLOAT DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_current_lesson FOREIGN KEY (current_lesson_id) REFERENCES tse_storytelling_lessons(lesson_id)
);

CREATE INDEX idx_char_storytelling_state_character ON tse_character_storytelling_state(character_id);
CREATE INDEX idx_char_storytelling_state_current_lesson ON tse_character_storytelling_state(current_lesson_id);

SELECT 'Tables created successfully' AS status;
