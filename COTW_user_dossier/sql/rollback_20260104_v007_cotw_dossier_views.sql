BEGIN;

DROP VIEW IF EXISTS
  cotw_narrative_state_view,
  cotw_inventory_state_view,
  cotw_knowledge_summary_view,
  cotw_character_traits_view,
  cotw_relationship_state_view,
  cotw_core_identity_view
CASCADE;

COMMIT;
