// backend/utils/narrativeEngine.js

import pool from '../db/pool.js';
import { validateHexId  } from './hexUtils';
import generateAokHexId from './hexIdGenerator.js'; // For initializing characters_in_narrative
import { getMultimediaAssetById  } from './narrativeAccess';

// --- Helper Functions (re-used from narrativeAccess or similar) ---

/**
 * Checks if a character profile exists.
 * @param {string} characterId - The hex ID of the character.
 * @returns {Promise<boolean>} True if character exists, false otherwise.
 */
async function characterExists(characterId) {
    if (!validateHexId(characterId)) return false;
    const result = await pool.query('SELECT 1 FROM character_profiles WHERE character_id = $1', [characterId]);
    return result.rows.length > 0;
}

/**
 * Retrieves a narrative segment by its ID.
 * @param {string} segmentId - The hex ID of the narrative segment.
 * @returns {Promise<object|null>} The segment object or null if not found.
 */
async function getNarrativeSegmentById(segmentId) {
    if (!validateHexId(segmentId)) {
        throw new Error('Invalid segment ID format.');
    }
    const result = await pool.query('SELECT * FROM narrative_segments WHERE segment_id = $1', [segmentId]);
    return result.rows[0] || null;
}

/**
 * Retrieves narrative paths originating from a given source segment.
 * @param {string} sourceSegmentId - The hex ID of the source narrative segment.
 * @returns {Promise<Array<object>>} An array of narrative path objects.
 */
async function getOutgoingNarrativePaths(sourceSegmentId) {
    if (!validateHexId(sourceSegmentId)) {
        throw new Error('Invalid source segment ID format.');
    }
    const result = await pool.query(
        'SELECT * FROM narrative_paths WHERE source_segment_id = $1 AND is_active = TRUE ORDER BY order_in_choices ASC, path_id ASC',
        [sourceSegmentId]
    );
    return result.rows;
}

// --- Core Narrative Engine Logic ---

/**
 * Initializes a character's narrative progression record if one does not exist.
 * This sets their starting point in the story.
 * @param {string} characterId - The hex ID of the character (e.g., #700002 for Claude).
 * @param {string} [initialSegmentId] - The starting narrative segment ID. If not provided,
 * it will attempt to find a default 'start' segment.
 * @returns {Promise<object>} The initialized or existing characters_in_narrative record.
 */
async function initializeCharacterNarrative(characterId, initialSegmentId = null) {
    if (!validateHexId(characterId)) {
        throw new Error('Invalid character ID format.');
    }
    if (!(await characterExists(characterId))) {
        throw new Error(`Character with ID ${characterId} not found.`);
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const result = await client.query(
            'SELECT * FROM characters_in_narrative WHERE character_id = $1 FOR UPDATE',
            [characterId]
        );
        let characterNarrative = result.rows[0];

        if (characterNarrative) {
            await client.query('COMMIT');
            return characterNarrative; // Already initialized
        }

        // Determine initial segment if not provided
        let effectiveInitialSegmentId = initialSegmentId;
        if (!effectiveInitialSegmentId) {
            // Attempt to find a segment explicitly tagged as a 'start' segment
            const startSegmentResult = await client.query(
                "SELECT segment_id FROM narrative_segments WHERE segment_type = 'narration' AND title ILIKE '%awakening%' ORDER BY created_at ASC LIMIT 1"
                // This is a heuristic. For a real system, you'd have a designated 'start_segment_id' in a config or a specific table.
                // For now, it will try to find "Piza Sukeruton Awakes" based on title.
            );
            if (startSegmentResult.rows.length > 0) {
                effectiveInitialSegmentId = startSegmentResult.rows[0].segment_id;
            } else {
                throw new Error('No initial narrative segment provided and no default "start" segment found.');
            }
        }

        if (!(await getNarrativeSegmentById(effectiveInitialSegmentId))) {
            throw new Error(`Initial narrative segment ID ${effectiveInitialSegmentId} not found.`);
        }

        const insertQuery = `
            INSERT INTO characters_in_narrative (character_id, current_narrative_segment_id, narrative_history, current_narrative_state)
            VALUES ($1, $2, '[]'::jsonb, '{}'::jsonb) RETURNING *;
        `;
        const newRecordResult = await client.query(insertQuery, [characterId, effectiveInitialSegmentId]);

        await client.query('COMMIT');
        return newRecordResult.rows[0];
    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error(`[NarrativeEngine] Error initializing narrative for ${characterId}:`, error.message);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Retrieves a character's current narrative state.
 * @param {string} characterId - The hex ID of the character.
 * @returns {Promise<object|null>} The characters_in_narrative record or null if not found.
 */
async function getCharacterCurrentNarrativeState(characterId) {
    if (!validateHexId(characterId)) {
        throw new Error('Invalid character ID format.');
    }
    const result = await pool.query('SELECT * FROM characters_in_narrative WHERE character_id = $1', [characterId]);
    return result.rows[0] || null;
}

/**
 * Evaluates conditions for a narrative path against a character's state.
 * @param {object} conditions - The JSONB conditions from narrative_paths.
 * @param {object} characterState - The current_narrative_state of the character.
 * @param {object} characterTraitScores - The character's current trait percentiles.
 * @returns {boolean} True if conditions are met, false otherwise.
 */
function evaluatePathConditions(conditions, characterState, characterTraitScores) {
    if (!conditions || Object.keys(conditions).length === 0) {
        return true; // No conditions, so path is always valid
    }

    // Example condition evaluation (can be expanded for more complex logic)
    // Conditions might look like: {"character_trait_id": "#000005", "min_percentile": 70}
    // Or: {"flag_met_pineapple_yurei": true}

    for (const key in conditions) {
        if (key === 'character_trait_id' && conditions.min_percentile !== undefined) {
            const requiredTrait = conditions[key];
            const minPercentile = conditions.min_percentile;
            const currentTraitScore = characterTraitScores[requiredTrait] || 0; // Assuming trait scores are keyed by hex ID
            if (currentTraitScore < minPercentile) {
                return false;
            }
        } else if (key.startsWith('flag_')) { // Custom flags in current_narrative_state
            const requiredFlagValue = conditions[key];
            const currentFlagValue = characterState[key];
            if (currentFlagValue !== requiredFlagValue) {
                return false;
            }
        }
        // Add more complex condition types as needed (e.g., item_in_inventory, quest_status)
    }
    return true; // All conditions met
}

/**
 * Determines the next narrative segment(s) a character can access.
 * This is the core progression logic.
 * @param {string} characterId - The hex ID of the character.
 * @returns {Promise<{segment: object, choices: Array<object>}>} The next segment and available choices.
 */
async function getNextNarrativeStep(characterId) {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN'); // Start transaction for consistency

        // 1. Get character's current narrative state
        const characterNarrativeResult = await client.query(
            'SELECT * FROM characters_in_narrative WHERE character_id = $1 FOR UPDATE',
            [characterId]
        );
        let characterNarrative = characterNarrativeResult.rows[0];

        if (!characterNarrative) {
            // If not initialized, try to initialize it.
            characterNarrative = await initializeCharacterNarrative(characterId);
            // Re-fetch with lock if initialize was in a separate transaction
            const reFetchResult = await client.query(
                'SELECT * FROM characters_in_narrative WHERE character_id = $1 FOR UPDATE',
                [characterId]
            );
            characterNarrative = reFetchResult.rows[0];
            if (!characterNarrative) {
                throw new Error(`Failed to retrieve or initialize narrative for ${characterId}`);
            }
        }

        const currentSegmentId = characterNarrative.current_narrative_segment_id;
        const currentNarrativeState = characterNarrative.current_narrative_state || {};

        // 2. Get character's current trait scores (needed for conditional paths)
        // This would involve querying character_trait_scores table
        const traitScoresResult = await client.query(
            'SELECT trait_hex_color, percentile_score FROM character_trait_scores WHERE character_hex_id = $1',
            [characterId]
        );
        const characterTraitScores = traitScoresResult.rows.reduce((acc, row) => {
            acc[row.trait_hex_color] = row.percentile;
            return acc;
        }, {});

        // 3. Get outgoing paths from the current segment
        const outgoingPaths = await getOutgoingNarrativePaths(currentSegmentId);

        let nextSegment = null;
        const availableChoices = [];

        // Filter paths based on conditions
        const validPaths = outgoingPaths.filter(path =>
            evaluatePathConditions(path.conditions, currentNarrativeState, characterTraitScores)
        );

        // Determine next step based on path types
        for (const path of validPaths) {
            if (path.path_type === 'linear_progression') {
                nextSegment = await getNarrativeSegmentById(path.target_segment_id);
                // For linear paths, we take the first valid one and stop
                await client.query('COMMIT'); // Commit before returning
                return { segment: nextSegment, choices: [] };
            } else if (path.path_type === 'choice_option') {
                availableChoices.push({
                    path_id: path.path_id,
                    choice_text: path.choice_text,
                    target_segment_id: path.target_segment_id,
                    order_in_choices: path.order_in_choices
                });
            } else if (path.path_type === 'conditional_branch') {
                // Conditional branches that are met might lead directly to a segment
                // or might influence subsequent choices. For now, if met, treat as linear if no other choices.
                // More complex logic might be needed here based on specific conditional branch behavior.
                // For simplicity, if a conditional branch is met and it's the only valid path, take it.
                // If there are also choice_options, it might just add to the context.
                // For now, if a conditional branch is met, we don't automatically take it unless it's the ONLY path.
                // The primary goal is to present choices if segment_type is 'choice_point'.
            }
        }

        // If current segment is a choice point, and we have choices, return them
        const currentSegment = await getNarrativeSegmentById(currentSegmentId);
        if (currentSegment && availableChoices.length > 0) {
            availableChoices.sort((a, b) => (a.order_in_choices || 0) - (b.order_in_choices || 0));
            await client.query('COMMIT'); // Commit before returning
            return { segment: currentSegment, choices: availableChoices };
        } else if (nextSegment) {
            // If a linear path was found and taken, it's already returned.
            // This else if is primarily for scenarios where a conditional branch might implicitly lead to a segment.
            // However, given the loop, linear paths are handled first.
            await client.query('COMMIT');
            return { segment: nextSegment, choices: [] };
        } else if (validPaths.length === 0) {
            // No valid paths from current segment, potentially an ending or dead end
            await client.query('ROLLBACK'); // No change to commit
            return { segment: currentSegment, choices: [], message: "End of narrative path." };
        } else {
            // Should not happen if logic is sound, but as a fallback
            await client.query('ROLLBACK'); // No change to commit
            throw new Error(`Narrative progression stalled for ${characterId} from segment ${currentSegmentId}.`);
        }

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error(`[NarrativeEngine] Error getting next narrative step for ${characterId}:`, error.message);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Processes a user's choice, updates the narrative state, and applies consequences.
 * @param {string} characterId - The hex ID of the character.
 * @param {string} choicePathId - The hex ID of the chosen narrative path.
 * @returns {Promise<object>} The updated characters_in_narrative record.
 */
async function processUserChoice(characterId, choicePathId) {
    if (!validateHexId(characterId) || !validateHexId(choicePathId)) {
        throw new Error('Invalid character ID or choice path ID format.');
    }

    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const characterNarrativeResult = await client.query(
            'SELECT * FROM characters_in_narrative WHERE character_id = $1 FOR UPDATE',
            [characterId]
        );
        let characterNarrative = characterNarrativeResult.rows[0];

        if (!characterNarrative) {
            throw new Error(`Narrative record not found for character ${characterId}.`);
        }

        const chosenPathResult = await client.query(
            'SELECT * FROM narrative_paths WHERE path_id = $1 AND is_active = TRUE',
            [choicePathId]
        );
        const chosenPath = chosenPathResult.rows[0];

        if (!chosenPath || chosenPath.source_segment_id !== characterNarrative.current_narrative_segment_id) {
            throw new Error(`Invalid or inactive path ID ${choicePathId} for current segment.`);
        }

        // Update current segment and narrative history
        characterNarrative.current_narrative_segment_id = chosenPath.target_segment_id;
        let narrativeHistory = characterNarrative.narrative_history || [];
        narrativeHistory.push({
            segment_id: chosenPath.source_segment_id,
            choice_made_path_id: choicePathId,
            timestamp: new Date().toISOString()
        });
        characterNarrative.narrative_history = narrativeHistory;

        // Apply consequences
        if (chosenPath.consequences && Object.keys(chosenPath.consequences).length > 0) {
            await applyConsequences(characterId, chosenPath.consequences, client); // Apply consequences within this transaction
        }

        const updateQuery = `
            UPDATE characters_in_narrative
            SET current_narrative_segment_id = $1, narrative_history = $2,
                current_narrative_state = $3, last_interacted_at = CURRENT_TIMESTAMP
            WHERE character_id = $4 RETURNING *;
        `;
        const updatedRecordResult = await client.query(updateQuery, [
            characterNarrative.current_narrative_segment_id,
            JSON.stringify(characterNarrative.narrative_history),
            JSON.stringify(characterNarrative.current_narrative_state || {}), // Pass updated state after consequences
            characterId
        ]);

        await client.query('COMMIT');
        return updatedRecordResult.rows[0];

    } catch (error) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error(`[NarrativeEngine] Error processing user choice for ${characterId}:`, error.stack || error.message);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

/**
 * Applies consequences to a character's state/traits.
 * This function should be called within a transaction.
 * @param {string} characterId - The hex ID of the character.
 * @param {object} consequences - The JSONB consequences from narrative_paths.
 * @param {object} client - The PostgreSQL client for the current transaction.
 */
async function applyConsequences(characterId, consequences, client) {
    // Example consequence: {"alter_trait_id": "#000005", "change_value": 5}
    // Example consequence: {"set_flag": "met_pineapple_yurei", "value": true}

    // Retrieve current character traits and narrative state (already locked by parent transaction)
    const characterNarrativeResult = await client.query(
        'SELECT current_narrative_state FROM characters_in_narrative WHERE character_id = $1',
        [characterId]
    );
    let currentNarrativeState = characterNarrativeResult.rows[0].current_narrative_state || {};

    // Retrieve current character trait scores (assuming they are in character_trait_scores table)
    // This would require a separate query, or passing character_trait_scores from getNextNarrativeStep if available
    // For simplicity, we'll fetch it here.
    const characterTraitScoresResult = await client.query(
        'SELECT trait_hex_color, percentile_score FROM character_trait_scores WHERE character_hex_id = $1',
        [characterId]
    );
    const currentTraitScores = characterTraitScoresResult.rows.reduce((acc, row) => {
        acc[row.trait_hex_color] = row.percentile;
        return acc;
    }, {});

    let traitScoresToUpdate = { ...currentTraitScores }; // Copy to modify

    for (const key in consequences) {
        if (key === 'alter_trait_id' && consequences.change_value !== undefined) {
            const traitToAlter = consequences[key];
            const changeValue = parseInt(consequences.change_value, 10);
            if (validateHexId(traitToAlter) && !isNaN(changeValue)) {
                let newPercentile = (traitScoresToUpdate[traitToAlter] || 0) + changeValue;
                newPercentile = Math.max(0, Math.min(100, newPercentile)); // Cap between 0 and 100
                traitScoresToUpdate[traitToAlter] = newPercentile;
            }
        } else if (key === 'set_flag' && consequences.value !== undefined) {
            const flagName = consequences[key];
            const flagValue = consequences.value;
            currentNarrativeState[flagName] = flagValue;
        }
        // Add more consequence types as needed (e.g., add_item_to_inventory, complete_quest)
    }

    // Update character_trait_scores table
    for (const traitHex in traitScoresToUpdate) {
        await client.query(
            `INSERT INTO character_trait_scores (character_hex_id, trait_hex_color, percentile)
             VALUES ($1, $2, $3)
             ON CONFLICT (character_hex_id, trait_hex_color) DO UPDATE SET percentile = EXCLUDED.percentile;`,
            [characterId, traitHex, traitScoresToUpdate[traitHex]]
        );
    }

    // Update current_narrative_state in characters_in_narrative
    await client.query(
        `UPDATE characters_in_narrative SET current_narrative_state = $1 WHERE character_id = $2;`,
        [currentNarrativeState, characterId]
    );
    console.log(`[NarrativeEngine] Applied consequences for ${characterId}:`, consequences);
}


// --- Narrative Lore Querying (for Claude's Q&A) ---

/**
 * Queries the narrative knowledge graph for lore based on a user query.
 * This function is for Claude to answer questions like "Who is Pineaple Yurei?".
 * It will search narrative segments, knowledge items, and relationships.
 * @param {string} userQuery - The user's question.
 * @param {string} [characterId] - Optional character context.
 * @returns {Promise<Array<object>>} Relevant narrative segments or knowledge items.
 */
async function queryNarrativeLore(userQuery, characterId = null) {
    // This is a simplified keyword search. For full semantic search,
    // it would integrate with aok_search_index and semantic embeddings.

    let relevantLore = [];
    const lowerQuery = userQuery.toLowerCase();

    // 1. Search narrative_segments by title or keywords
    const segmentResult = await pool.query(
        `SELECT segment_id, title, content, summary, segment_type, multimedia_asset_id
         FROM narrative_segments
         WHERE title ILIKE $1 OR keywords ILIKE $1 OR content ILIKE $1`,
        [`%${lowerQuery}%`]
    );
    relevantLore = relevantLore.concat(segmentResult.rows);

    // 2. Search knowledge_items by content or description
    // Assuming knowledge_items also has a title or keywords field for better search
    const knowledgeItemResult = await pool.query(
        `SELECT knowledge_id, content, domain_id
         FROM knowledge_items
         WHERE content ILIKE $1`,
        [`%${lowerQuery}%`]
    );
    relevantLore = relevantLore.concat(knowledgeItemResult.rows);

    // 3. (Future) Use knowledge_relationships to expand search or find related lore
    // This would involve more complex graph traversal queries.

    // Deduplicate results if necessary based on ID
    const uniqueLore = Array.from(new Map(relevantLore.map(item => [item.segment_id || item.knowledge_id, item])).values());

    return uniqueLore;
}


export {
    initializeCharacterNarrative,
    getCharacterCurrentNarrativeState,
    getNextNarrativeStep,
    processUserChoice,
    applyConsequences, // Exposed for direct use in certain scenarios if needed, but usually via processUserChoice
    queryNarrativeLore,
    getNarrativeSegmentById, // Expose segment getter for convenience
    getOutgoingNarrativePaths, // Expose for potential frontend use
    getMultimediaAssetById,
};

