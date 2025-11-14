sed -i.bak '101,115s/.*/            const query = `\
                (\
                    SELECT \
                        ki.knowledge_id,\
                        ki.content,\
                        ki.domain_id,\
                        kd.domain_name,\
                        ki.source_type,\
                        ki.complexity_score,\
                        ki.acquisition_timestamp\
                    FROM knowledge_items ki\
                    LEFT JOIN knowledge_domains kd ON ki.domain_id = kd.domain_id\
                    WHERE (${searchConditions})\
                )\
                UNION ALL\
                (\
                    SELECT \
                        ae.entry_id as knowledge_id,\
                        ae.content,\
                        ae.category_id as domain_id,\
                        ac.name as domain_name,\
                        '"'"'aok_entry'"'"' as source_type,\
                        ae.difficulty_level as complexity_score,\
                        ae.created_at as acquisition_timestamp\
                    FROM aok_entries ae\
                    LEFT JOIN aok_categories ac ON ae.category_id = ac.category_id\
                    WHERE (${searchConditions.replace(\/ki\\.\/g, '"'"'ae.'"'"')})\
                )\
                ORDER BY acquisition_timestamp DESC\
                LIMIT ${limit * 3};\
            `;/' backend/knowledge/KnowledgeAcquisitionEngine.js
