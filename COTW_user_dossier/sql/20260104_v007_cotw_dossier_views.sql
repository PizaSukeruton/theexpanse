BEGIN;

SET client_min_messages TO WARNING;
SET search_path TO public;

CREATE OR REPLACE VIEW cotw_core_identity_view AS
SELECT
  d.dossier_id,
  d.user_id,
  d.character_id,
  u.created_at AS user_created_at,
  d.created_at AS dossier_created_at,
  d.updated_at AS dossier_updated_at
FROM cotw_dossiers d
JOIN users u ON u.user_id = d.user_id;

CREATE OR REPLACE VIEW cotw_relationship_state_view AS
SELECT
  d.dossier_id,
  rs.relationship_id,
  rs.character_id,
  rs.user_id,
  rs.trust_score,
  rs.perceived_ability,
  rs.perceived_benevolence,
  rs.perceived_integrity,
  rs.familiarity,
  rs.shared_topics,
  rs.communication_style,
  rs.interaction_count,
  rs.last_interaction,
  rs.created_at,
  rs.updated_at
FROM cotw_dossiers d
JOIN relationship_state rs
  ON rs.character_id = d.character_id
 AND rs.user_id = d.user_id;

CREATE OR REPLACE VIEW cotw_character_traits_view AS
SELECT
  cts.character_hex_id  AS character_id,
  cts.trait_hex_color   AS trait_hex,
  cts.percentile_score AS percentile_score,
  cts.updated_at
FROM character_trait_scores cts;

CREATE OR REPLACE VIEW cotw_knowledge_summary_view AS
SELECT
  ks.character_id,
  ks.knowledge_id,
  ks.current_expertise_score,
  ks.stability,
  ks.difficulty,
  ks.next_review_timestamp,
  ks.is_mastered,
  ks.is_forgotten
FROM character_knowledge_state ks;

CREATE OR REPLACE VIEW cotw_inventory_state_view AS
SELECT
  ci.inventory_entry_id,
  ci.character_id,
  ci.object_id,
  ci.slot_trait_hex_id,
  ci.acquired_at,
  ci.source_character_id,
  ci.acquisition_method,
  ci.binding_type
FROM character_inventory ci;

CREATE OR REPLACE VIEW cotw_narrative_state_view AS
SELECT
  uas.user_id,
  uas.arc_id,
  uas.character_id,
  uas.status,
  uas.current_beat_id,
  uas.completed_beat_ids,
  uas.arc_state,
  uas.started_at,
  uas.completed_at,
  uas.updated_at
FROM user_arc_state uas;

REVOKE ALL ON
  cotw_core_identity_view,
  cotw_relationship_state_view,
  cotw_character_traits_view,
  cotw_knowledge_summary_view,
  cotw_inventory_state_view,
  cotw_narrative_state_view
FROM PUBLIC;

GRANT SELECT ON
  cotw_core_identity_view,
  cotw_relationship_state_view,
  cotw_character_traits_view,
  cotw_knowledge_summary_view,
  cotw_inventory_state_view,
  cotw_narrative_state_view
TO app_role;

COMMIT;
