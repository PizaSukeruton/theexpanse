import pool from '../db/pool.js';
import { validateHexId } from '../utils/hexUtils.js';
import CharacterEngine from './CharacterEngine_TEST.js';
import KnowledgeResponseEngine from '../TSE/helpers/KnowledgeResponseEngine.js';
import NaturalLanguageGenerator from '../TSE/helpers/NaturalLanguageGenerator.js';
import narrativeEngine from '../utils/narrativeEngine.js';
import narrativeAccess from '../utils/narrativeAccess.js';

class StorytellerContextAssembler {
    constructor(dbPool = null) {
        this.pool = dbPool || pool;
        this.knowledgeResponseEngine = new KnowledgeResponseEngine(this.pool);
        this.nlg = new NaturalLanguageGenerator();
        console.log('[StorytellerContextAssembler] Initialized');
    }

    async getCharacterContext(characterId) {
        if (!validateHexId(characterId)) {
            throw new Error('Invalid character ID format.');
        }

        try {
            const characterResult = await this.pool.query(
                'SELECT * FROM character_profiles WHERE character_id = $1',
                [characterId]
            );
            if (characterResult.rows.length === 0) {
                throw new Error(`Character with ID ${characterId} not found.`);
            }

            const characterProfile = characterResult.rows[0];

            const traitsResult = await this.pool.query(
                'SELECT * FROM character_personality WHERE character_id = $1',
                [characterId]
            );

            const padResult = await this.pool.query(
                'SELECT p, a, d FROM psychic_moods WHERE character_id = $1',
                [characterId]
            );
            const padState = padResult.rows[0] || { p: 0.5, a: 0.5, d: 0.5 };

            const inventoryResult = await this.pool.query(
                'SELECT * FROM character_inventory WHERE character_id = $1',
                [characterId]
            );

            const narrativeStateResult = await this.pool.query(
                'SELECT * FROM characters_in_narrative WHERE character_id = $1',
                [characterId]
            );
            const narrativeState = narrativeStateResult.rows[0] || null;

            const recentPsychicResult = await this.pool.query(
                'SELECT * FROM psychic_events WHERE target_character = $1 ORDER BY created_at DESC LIMIT 5',
                [characterId]
            );

            return {
                profile: characterProfile,
                traits: traitsResult.rows,
                padState,
                inventory: inventoryResult.rows,
                narrativeState,
                recentPsychicEvents: recentPsychicResult.rows
            };
        } catch (error) {
            console.error('[StorytellerContextAssembler] Error fetching character context:', error.message);
            throw error;
        }
    }

    async enrichNarrativeSegment(segment, characterId) {
        if (!segment) {
            throw new Error('Segment is required.');
        }

        try {
            let location = null;
            if (segment.associated_location_id) {
                location = await narrativeAccess.getLocationById(segment.associated_location_id);
            }

            let multimedia = null;
            if (segment.multimedia_asset_id) {
                multimedia = await narrativeAccess.getMultimediaAssetById(segment.multimedia_asset_id);
            }

            const associatedCharacters = segment.associated_character_ids || [];
            let characterDetails = [];
            if (Array.isArray(associatedCharacters) && associatedCharacters.length > 0) {
                const placeholders = associatedCharacters.map((_, i) => `$${i + 1}`).join(',');
                const charResult = await this.pool.query(
                    `SELECT character_id, character_name, category, description FROM character_profiles WHERE character_id IN (${placeholders})`,
                    associatedCharacters
                );
                characterDetails = charResult.rows;
            }

            return {
                segment,
                location,
                multimedia,
                associatedCharacters: characterDetails,
                sentiment: segment.sentiment_tags || {}
            };
        } catch (error) {
            console.error('[StorytellerContextAssembler] Error enriching segment:', error.message);
            throw error;
        }
    }

    async analyzeClaude(characterId) {
        try {
            const characterEngine = new CharacterEngine(characterId);
            const characterData = await characterEngine.loadCharacter();

            const learningProfile = await this.knowledgeResponseEngine.analyzeTraitProfile(
                characterEngine.traits,
                characterEngine.metadata
            );

            await characterEngine.cleanup();

            return learningProfile;
        } catch (error) {
            console.error('[StorytellerContextAssembler] Error analyzing Claude:', error.message);
            throw error;
        }
    }

    async assembleStoryContext(characterId, narrativeStep) {
        if (!characterId || !narrativeStep) {
            throw new Error('Character ID and narrative step are required.');
        }

        try {
            console.log(`[StorytellerContextAssembler] Assembling story context for ${characterId}`);

            const characterContext = await this.getCharacterContext(characterId);

            const enrichedSegment = await this.enrichNarrativeSegment(
                narrativeStep.segment,
                characterId
            );

            const learningProfile = await this.analyzeClaude(characterId);

            const voiceArchetype = this.nlg.deriveCharacterVoice(learningProfile);

            const padAdjustment = this.nlg.adjustToneForPAD(characterContext.padState);

            return {
                characterId,
                segment: enrichedSegment.segment,
                location: enrichedSegment.location,
                multimedia: enrichedSegment.multimedia,
                associatedCharacters: enrichedSegment.associatedCharacters,
                sentiment: enrichedSegment.sentiment,
                learningProfile,
                voiceArchetype,
                padState: characterContext.padState,
                padAdjustment,
                inventory: characterContext.inventory,
                narrativeHistory: characterContext.narrativeState?.narrative_history || [],
                choices: narrativeStep.choices || [],
                recentPsychicEvents: characterContext.recentPsychicEvents
            };
        } catch (error) {
            console.error('[StorytellerContextAssembler] Error assembling story context:', error.message);
            throw error;
        }
    }

    async generateStorytellerResponse(characterId) {
        try {
            console.log(`[StorytellerContextAssembler] Generating storyteller response for ${characterId}`);

            const narrativeStep = await narrativeEngine.getNextNarrativeStep(characterId);

            const storyContext = await this.assembleStoryContext(characterId, narrativeStep);

            const narrationContent = await this.nlg.generate(
                [{ content: storyContext.segment.content }],
                storyContext.learningProfile,
                {
                    emotionalContext: storyContext.voiceArchetype === 'curious_cautious' ? 'gentle' :
                                     storyContext.voiceArchetype === 'analytical_independent' ? 'detached' :
                                     storyContext.voiceArchetype === 'supportive_collaborative' ? 'reassuring' :
                                     'balanced'
                },
                storyContext.segment.title,
                storyContext.padState
            );

            return {
                success: true,
                segment_id: storyContext.segment.segment_id,
                title: storyContext.segment.title,
                narration: narrationContent,
                voice_archetype: storyContext.voiceArchetype,
                mood: storyContext.sentiment.mood || 'neutral',
                pad_state: {
                    pleasure: storyContext.padState.p,
                    arousal: storyContext.padState.a,
                    dominance: storyContext.padState.d
                },
                multimedia: storyContext.multimedia ? {
                    asset_id: storyContext.multimedia.asset_id,
                    type: storyContext.multimedia.asset_type,
                    url: storyContext.multimedia.url,
                    duration_seconds: storyContext.multimedia.duration_seconds,
                    thumbnail_url: storyContext.multimedia.thumbnail_url,
                    description: storyContext.multimedia.description
                } : null,
                location: storyContext.location ? {
                    location_id: storyContext.location.location_id,
                    name: storyContext.location.name,
                    realm: storyContext.location.realm,
                    description: storyContext.location.description
                } : null,
                associated_characters: storyContext.associatedCharacters,
                choices: storyContext.choices.map(choice => ({
                    path_id: choice.path_id,
                    choice_text: choice.choice_text,
                    target_segment_id: choice.target_segment_id
                })),
                inventory_snapshot: storyContext.inventory,
                context_metadata: {
                    learning_archetype: storyContext.learningProfile.learningArchetype,
                    delivery_preference: storyContext.learningProfile.deliveryPreference,
                    dominant_traits: storyContext.learningProfile.dominantTraits,
                    emergent_patterns: storyContext.learningProfile.emergentPatterns
                }
            };
        } catch (error) {
            console.error('[StorytellerContextAssembler] Error generating storyteller response:', error.message);
            throw error;
        }
    }
}

export default StorytellerContextAssembler;
