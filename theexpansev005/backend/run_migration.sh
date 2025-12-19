#!/bin/bash
cd /Users/pizasukeruton/Desktop/theexpanse/theexpansev005/backend
psql -U pizasukerutondb_user -d pizasukerutondb -f storytelling_curriculum_migration.sql
