export default class TanukiModeDetector {
  constructor() {}

  computeLevel(baseLevel, intent, triggerWords, inputText, modeOverrides) {
    if (!inputText) inputText = "";
    const text = inputText.toLowerCase();

    console.log('[TanukiModeDetector] DEBUG:', { inputText, triggerWordsCount: triggerWords?.length, triggerWordsType: typeof triggerWords });

    let level = baseLevel || 0.0;

    if (modeOverrides?.forceTanukiMode === true) {
      return 5.0;
    }

    if (intent === "playful") {
      level += 0.5;
    }

    if (triggerWords && triggerWords.length > 0) {
      for (const w of triggerWords) {
        if (text.includes(w.toLowerCase())) {
          level += 0.3;
        }
      }
    }

    if (level < 0) level = 0;
    if (level > 5) level = 5;

    return Number(level.toFixed(2));
  }
}
