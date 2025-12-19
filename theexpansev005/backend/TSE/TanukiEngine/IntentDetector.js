export default class IntentDetector {
  constructor() {
    this.playfulPatterns = [
      /tanuki/i,
      /trick/i,
      /paradox/i,
      /riddle/i,
      /weird/i,
      /show me/i,
      /mask/i,
      /illusion/i,
      /contradiction/i
    ];

    this.philosophicalPatterns = [
      /why/i,
      /what does it mean/i,
      /essence/i,
      /meaning/i,
      /nature of/i,
      /truth/i,
      /feel/i
    ];

    this.factualPatterns = [
      /what is/i,
      /who is/i,
      /tell me/i,
      /when/i,
      /where/i,
      /how many/i,
      /define/i
    ];
  }

  detect(input) {
    if (!input) return "unknown";

    const lower = input.toLowerCase();

    for (const p of this.playfulPatterns) {
      if (p.test(lower)) return "playful";
    }

    for (const p of this.philosophicalPatterns) {
      if (p.test(lower)) return "philosophical";
    }

    for (const p of this.factualPatterns) {
      if (p.test(lower)) return "factual";
    }

    return "factual";
  }
}
