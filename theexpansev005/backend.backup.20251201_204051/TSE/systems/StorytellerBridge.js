import pool from '../../db/pool.js';
import narrativeEngine from '../../utils/narrativeEngine.js';
import { getMultimediaAssetById, getLocationById } from '../../utils/narrativeAccess.js';
import NaturalLanguageGenerator from '../helpers/NaturalLanguageGenerator.js';

/**
 * StorytellerBridge
 * 
 * Bridges narrative state engine with NLG voice synthesis to create
 * fully-voiced, emotionally-aware story experiences.
 */
export class StorytellerBridge {

    async getNextStoryBeat(characterId) {
        try {
            // 1. Get raw narrative step
            const rawStep = await narrativeEngine.getNextNarrativeStep(characterId);
            
            if (!rawStep.segment) {
                return { status: 'end_of_story' };
            }

            // 2. Enrich with media, personality, and emotional state
            const [mediaAsset, personalityProfile, padState, location] = await Promise.all([
                this._resolveMedia(rawStep.segment.multimedia_asset_id),
                this._buildCharacterProfile(characterId),
                this._getCurrentPadState(characterId),
                rawStep.segment.associated_location_id 
                    ? getLocationById(rawStep.segment.associated_location_id)
                    : null
            ]);

            // 3. Generate narration
            const narratedContent = await this._synthesizeNarration(
                rawStep.segment,
                personalityProfile,
                padState
            );

            // 4. Return enriched beat
            return {
                status: 'success',
                segment_id: rawStep.segment.segment_id,
                title: rawStep.segment.title,
                narrative_text: narratedContent,
                original_content: rawStep.segment.content,
                media: mediaAsset,
                mood: rawStep.segment.sentiment_tags,
                location: location,
                choices: rawStep.choices,
                character_context: {
                    personality_profile: personalityProfile,
                    emotional_state: padState
                }
            };

        } catch (error) {
            console.error('StorytellerBridge.getNextStoryBeat error:', error);
            return { status: 'error', message: error.message };
        }
    }

    async _resolveMedia(assetId) {
        if (!assetId) return null;
        try {
            return await getMultimediaAssetById(assetId);
        } catch (error) {
            console.warn(`Failed to resolve media ${assetId}:`, error);
            return null;
        }
    }

    async _buildCharacterProfile(characterId) {
        try {
            const charResult = await pool.query(
                `SELECT character_id, character_name, category, description
                FROM character_profiles
                WHERE character_id = $1`,
                [characterId]
            );

            const charData = charResult.rows[0] || {};

            return {
                character_id: characterId,
                name: charData.character_name,
                category: charData.category,
                description: charData.description,
                traits: {}
            };

        } catch (error) {
            console.warn(`Failed to build profile for ${characterId}:`, error);
            return { character_id: characterId, traits: {} };
        }
    }

    async _getCurrentPadState(characterId) {
        try {
            const moodResult = await pool.query(
                `SELECT p as pleasure, a as arousal, d as dominance, updated_at
                FROM psychic_moods
                WHERE character_id = $1
                LIMIT 1`,
                [characterId]
            );

            if (moodResult.rows.length > 0) {
                const mood = moodResult.rows[0];
                return {
                    pleasure: parseFloat(mood.pleasure) || 0.5,
                    arousal: parseFloat(mood.arousal) || 0.5,
                    dominance: parseFloat(mood.dominance) || 0.5,
                    timestamp: mood.updated_at
                };
            }

            return { pleasure: 0.5, arousal: 0.5, dominance: 0.5 };

        } catch (error) {
            console.warn(`Failed to fetch PAD state for ${characterId}:`, error);
            return { pleasure: 0.5, arousal: 0.5, dominance: 0.5 };
        }
    }

    async _synthesizeNarration(segment, personalityProfile, padState) {
        try {
            const nlg = new NaturalLanguageGenerator();
            const result = await nlg.generate(
                [{ content: segment.content, type: 'narrative_segment' }],
                personalityProfile,
                {
                    detailLevel: 'high',
                    tone: segment.sentiment_tags?.mood || 'balanced',
                    format: 'narrative_prose'
                },
                segment.title,
                padState
            );

            return result || segment.content;

        } catch (error) {
            console.warn('Failed to synthesize narration:', error);
            return segment.content;
        }
    }
}

export default new StorytellerBridge();
