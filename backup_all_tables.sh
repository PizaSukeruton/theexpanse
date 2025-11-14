#!/bin/bash
DATE=$(date +%Y%m%d_%H%M)
BACKUP_DIR=~/Desktop/theexpanse/backups_$DATE
mkdir -p $BACKUP_DIR

echo "Backing up all tables to $BACKUP_DIR..."

tables="knowledge_items knowledge_domains character_knowledge_state character_claimed_knowledge_slots character_knowledge_slot_mappings knowledge_access_requirements knowledge_dependencies knowledge_relationships knowledge_review_logs knowledge_transfer_logs knowledge_transfer_log trait_knowledge_modifiers tse_algorithm_knowledge character_profiles tse_cycles tse_teacher_records tse_student_records"

for table in $tables; do
    echo "Backing up $table..."
    PGPASSWORD=Srd0ECwQ4GeulQxTFhdDUYirRwxp71G6 psql -h dpg-d1l7cr7diees73fag97g-a.oregon-postgres.render.com -U pizasukerutondb_user pizasukerutondb -c "COPY $table TO STDOUT WITH CSV HEADER" > $BACKUP_DIR/${table}.csv
done

echo "Backup complete!"
ls -la $BACKUP_DIR/
