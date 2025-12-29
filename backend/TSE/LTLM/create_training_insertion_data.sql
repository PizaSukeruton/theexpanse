-- LTLM Training Data Table
-- Stores human- or rule-labeled sentence appropriateness judgments

CREATE TABLE IF NOT EXISTS training_insertion_data (
  training_id           VARCHAR(64) PRIMARY KEY,

  -- The actual sentence being judged
  candidate_text        TEXT NOT NULL,

  -- Voice category (must match LTLM_Input.category)
  category              VARCHAR(64) NOT NULL,

  -- Who is speaking (usually Claude)
  speaker_character_id  VARCHAR(64) NOT NULL,

  -- Who the sentence is about (nullable)
  about_character_id    VARCHAR(64),

  -- PAD snapshot at time of judgment (read-only copy)
  pad_pleasure          DOUBLE PRECISION NOT NULL,
  pad_arousal           DOUBLE PRECISION NOT NULL,
  pad_dominance         DOUBLE PRECISION NOT NULL,

  -- Narrative / Tanuki level
  tanuki_level          DOUBLE PRECISION NOT NULL,

  -- Grounding presence flags
  has_reality           BOOLEAN NOT NULL DEFAULT FALSE,
  has_relationships     BOOLEAN NOT NULL DEFAULT FALSE,
  has_events            BOOLEAN NOT NULL DEFAULT FALSE,

  -- Final human / rule score
  -- Range strictly enforced
  appropriateness_score DOUBLE PRECISION NOT NULL
    CHECK (appropriateness_score >= -1.0 AND appropriateness_score <= 1.0),

  -- Provenance
  source                VARCHAR(64) NOT NULL,
  created_by            VARCHAR(64) NOT NULL,

  -- Optional human explanation (gold for audits)
  labeling_notes        TEXT,

  created_at            TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Helpful indexes for analysis
CREATE INDEX IF NOT EXISTS idx_training_category
  ON training_insertion_data(category);

CREATE INDEX IF NOT EXISTS idx_training_pad
  ON training_insertion_data(pad_pleasure, pad_arousal, pad_dominance);

CREATE INDEX IF NOT EXISTS idx_training_speaker
  ON training_insertion_data(speaker_character_id);
