export default class VocabularySelector {
  constructor() {}

  pickRandom(list) {
    if (!list || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  getDefaultWord(vocab) {
    return this.pickRandom(vocab?.default_vocabulary || []);
  }

  getTanukiWord(vocab) {
    return this.pickRandom(vocab?.tanuki_mode_vocabulary || []);
  }

  getForbiddenWords(vocab) {
    return vocab?.forbidden_words || [];
  }

  getParadoxPair(vocab) {
    return this.pickRandom(vocab?.paradox_pairs || []);
  }

  getTriggerWords(vocab) {
    return vocab?.tanuki_mode_triggers || [];
  }
}
