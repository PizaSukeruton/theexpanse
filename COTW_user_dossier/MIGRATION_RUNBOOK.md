COTW Dossier Migration Runbook v007

This file documents how to apply and verify the SQL views required
for the Council Of The Wise user dossier system.

When to run
- Before enabling the /api/cotw/dossier endpoint
- During v007 deployment or database upgrade

How to run
psql -d pizasukeruton -f COTW_user_dossier/sql/20260104_v007_cotw_dossier_views.sql

Verification
After running the migration, connect to the database and list views:
\dv cotw_*

Expected views
- cotw_core_identity_view
- cotw_relationship_state_view
- cotw_character_traits_view
- cotw_knowledge_summary_view
- cotw_inventory_state_view
- cotw_narrative_state_view

Rollback
If rollback is required:
psql -d pizasukeruton -f COTW_user_dossier/sql/rollback_20260104_v007_cotw_dossier_views.sql
