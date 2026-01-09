export default class TriggerPhraseDetector {
  constructor() {
    this.triggers = {
      claude: {
        phrases: ["tanuki mode"],
        characterId: "#700002",
        engine: "tanuki"
      }
    };
  }

  detect(input) {
    if (!input) return null;

    const lower = input.toLowerCase();

    for (const [key, config] of Object.entries(this.triggers)) {
      for (const phrase of config.phrases) {
        if (lower.includes(phrase)) {
          return {
            matched: true,
            character: key,
            characterId: config.characterId,
            engine: config.engine,
            cleanedInput: this.stripTrigger(input, phrase)
          };
        }
      }
    }

    return { matched: false };
  }

  stripTrigger(input, trigger) {
    const regex = new RegExp(trigger, "i");
    return input.replace(regex, "").replace(/^[\s!?.,]+/, "").trim();
  }

  registerTrigger(characterName, phrases, characterId, engineType) {
    this.triggers[characterName.toLowerCase()] = {
      phrases: phrases.map(p => p.toLowerCase()),
      characterId,
      engine: engineType
    };
  }
}
