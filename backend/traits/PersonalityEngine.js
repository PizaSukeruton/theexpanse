// © 2025-07-21 – Piza Sukeruton Multiverse Project
// PersonalityEngine.js – Trait-to-tone and personality logic

import { getTraitVector  } from './TraitManager';

// 🧠 Utility to calculate tone scores from a trait vector
function calculateToneScores(traitVector) {
    const toneMap = {
        Calm: ['#00001A', '#00001B', '#00001D'],  // Emotional stability traits
        Curious: ['#00002A', '#00002B', '#00002C'],  // Cognitive exploration traits
        Playful: ['#00004A', '#00004B', '#00004C'],  // Behavioral chaos traits
        Wise: ['#00005A', '#00005B', '#00005C']   // Council logic traits
    };

    const scores = {};
    for (const [tone, traitList] of Object.entries(toneMap)) {
        let total = 0;
        traitList.forEach(trait => {
            if (traitVector[trait] !== undefined) {
                total += traitVector[trait];
            }
        });
        scores[tone] = parseFloat((total / traitList.length).toFixed(2));
    }

    return scores;
}

// 🎯 Utility to pick the dominant tone from tone scores
function pickDominantTone(toneScores) {
    return Object.entries(toneScores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
}

// 🚀 Main export: getToneFromTraits(character_id)
async function getToneFromTraits(character_id) {
    const traitVector = await getTraitVector(character_id);
    const toneScores = calculateToneScores(traitVector);
    const selectedTone = pickDominantTone(toneScores);

    return {
        character_id,
        selected_tone: selectedTone,
        tone_scores: toneScores
    };
}

// 🧬 Personality stub export: placeholder logic for now
function determinePersonality(traitVector) {
    // Finds traits with scores >= 0.75
    const dominantTraits = Object.entries(traitVector)
        .filter(([_, value]) => value >= 75)
        .map(([trait]) => trait);

    return {
        mood: `Personality determined from ${dominantTraits.length} dominant traits.`,
        traits_used: dominantTraits.length
    };
}

export {
    getToneFromTraits,
    determinePersonality
};

