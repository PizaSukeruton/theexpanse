CREATE TABLE psychic_frames (
  frame_id         VARCHAR(7) PRIMARY KEY CHECK (frame_id ~ '^#[0-9A-F]{6}$'),
  character_id     VARCHAR(7) REFERENCES character_profiles(character_id),
  timestamp        TIMESTAMPTZ DEFAULT NOW(),
  emotional_state  JSONB,          -- e.g. {"p":0.72,"a":0.44,"d":-0.11}
  psychological_distance JSONB,    -- e.g. {"#800102":0.4, "#801010":0.8}
  trait_influences JSONB,          -- e.g. {"#0000AA":1.15, "#0000BB":-0.3}
  metadata         JSONB
);
