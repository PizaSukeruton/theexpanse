import pool from '../db/pool.js';
import knowledgeConfig from '../../config/knowledgeConfig.js';

class CharacterPersonalityEngine {
  constructor() {
    this.big_five_labels = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  }

  async loadCharacterProfile(characterId) {
    try {
      const query = `SELECT character_id, openness, conscientiousness, extraversion, agreeableness, neuroticism, pad_baseline_p, pad_baseline_a, pad_baseline_d, idiolect_region, idiolect_education_level, idiolect_age, working_memory_capacity, trait_activation_stress_threshold FROM character_personality WHERE character_id = $1`;
      const result = await pool.query(query, [characterId]);
      if (result.rows.length === 0) {
        console.warn(`[CharacterPersonalityEngine] No personality profile for ${characterId}, using defaults`);
        return this._defaultProfile(characterId);
      }
      return result.rows[0];
    } catch (error) {
      console.error(`[CharacterPersonalityEngine] Error loading profile:`, error);
      return this._defaultProfile(characterId);
    }
  }

  calculateCognitiveLoad(context = {}) {
    const { in_combat = false, is_lying = false, multitask_count = 0, memory_retrieval_latency_ms = 0, fsrs_days_overdue = 0, neuroticism_score = 50, pad_current = { p: 0, a: 0, d: 0 } } = context;
    let cls = 0.1;
    if (in_combat) cls += 0.3;
    if (is_lying) cls += 0.2;
    if (multitask_count > 0) cls += Math.min(0.2, multitask_count * 0.1);
    if (memory_retrieval_latency_ms > 0) cls += Math.min(0.15, memory_retrieval_latency_ms / 1000);
    if (fsrs_days_overdue > 0) cls += Math.min(0.3, fsrs_days_overdue * 0.05);
    const neuroticismMultiplier = 1 + (neuroticism_score / 100) * 0.5;
    cls *= neuroticismMultiplier;
    const arousal = pad_current.a || 0;
    if (arousal > 0.5) cls += (arousal - 0.5) * 0.2;
    return { score: Math.min(1, cls), factors: { combat: in_combat ? 0.3 : 0, deception: is_lying ? 0.2 : 0, multitasking: multitask_count > 0 ? Math.min(0.2, multitask_count * 0.1) : 0, memory_latency: Math.min(0.15, memory_retrieval_latency_ms / 1000), fsrs_overdue: Math.min(0.3, fsrs_days_overdue * 0.05), neuroticism_amplification: neuroticismMultiplier - 1 }, severity: cls > 0.8 ? 'critical' : cls > 0.6 ? 'high' : cls > 0.4 ? 'medium' : 'low' };
  }

  injectDisfluency(text, cls_score) {
    if (cls_score < 0.3) return text;
    const fillers = ['um', 'uh', 'uh, like', 'I mean', 'you know', 'sort of'];
    const stutters = ['th-th-', 'l-l-', 's-s-'];
    const injectionRate = Math.min(0.5, cls_score);
    const words = text.split(/\s+/);
    let result = words.map((word, i) => {
      if (Math.random() < injectionRate && i < words.length - 1) {
        const randomFiller = fillers[Math.floor(Math.random() * fillers.length)];
        return `${randomFiller} ${word}`;
      }
      return word;
    }).join(' ');
    if (cls_score > 0.7 && Math.random() < 0.3) {
      const firstWord = result.split(/\s+/)[0];
      if (firstWord.length > 1) {
        const stutter = stutters[Math.floor(Math.random() * stutters.length)];
        result = result.replace(firstWord, stutter + firstWord.slice(1));
      }
    }
    return result;
  }

  getVocabularyTemperature(openness_score) {
    const normalized = openness_score / 100;
    return 0.3 + (normalized * 1.2);
  }

  getSyntacticDepth(conscientiousness_score) {
    const normalized = conscientiousness_score / 100;
    return normalized;
  }

  checkTraitActivation(trait_name, stress_level, base_score) {
    const activation_threshold = knowledgeConfig.cognitiveLoad?.overloadThresholdFactor || 0.85;
    if (stress_level < activation_threshold) {
      return { activated: false, multiplier: 1.0 };
    }
    if (trait_name === 'neuroticism') {
      const crackMultiplier = 1 + (stress_level - activation_threshold) * 2;
      return { activated: true, multiplier: crackMultiplier };
    }
    if (trait_name === 'extraversion') {
      const retreatMultiplier = 1 - (stress_level - activation_threshold) * 0.5;
      return { activated: true, multiplier: Math.max(0.5, retreatMultiplier) };
    }
    return { activated: false, multiplier: 1.0 };
  }

  getCharacterVoiceModifiers(profile) {
    return { vocabulary_temperature: this.getVocabularyTemperature(profile.openness), syntactic_depth: this.getSyntacticDepth(profile.conscientiousness), exclamation_rate: profile.extraversion / 100, hedging_rate: profile.neuroticism / 100, formality: profile.conscientiousness / 100, verbosity: (profile.extraversion / 100) * 0.5, working_memory: profile.working_memory_capacity || 7 };
  }

  _defaultProfile(characterId) {
    return { character_id: characterId, openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, pad_baseline_p: 0, pad_baseline_a: 0, pad_baseline_d: 0, idiolect_region: 'generic', idiolect_education_level: 'unknown', idiolect_age: 30, working_memory_capacity: 7, trait_activation_stress_threshold: 0.85 };
  }
}

export default new CharacterPersonalityEngine();
