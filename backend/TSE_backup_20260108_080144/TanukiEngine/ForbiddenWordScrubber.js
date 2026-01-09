export default class ForbiddenWordScrubber {
  constructor() {}

  scrub(text, forbiddenWords) {
    if (!text || !forbiddenWords || forbiddenWords.length === 0) {
      return text;
    }

    let output = text;

    for (const w of forbiddenWords) {
      const safe = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${safe}\\b`, "gi");
      output = output.replace(regex, "[redacted]");
    }

    return output;
  }
}
