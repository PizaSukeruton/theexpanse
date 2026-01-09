export default class TanukiTemplates {
  constructor() {
    this.neutral = [
      "${grounded} ${relationships} ${events} ${input}",
      "${grounded} ${relationships} ${events} ${input} — noted.",
      "Acknowledged: ${grounded} ${relationships} ${events} ${input}"
    ];

    this.level1 = [
      "${grounded} ${relationships} ${events} ${input} — a thread of ${word1}.",
      "${grounded} ${relationships} ${events} ${input}. In this, I sense ${word1}.",
      "${grounded} ${relationships} ${events} You ask of ${input}. The ${word1} shows itself."
    ];

    this.level2 = [
      "${grounded} ${relationships} ${events} ${input} carries both ${word1} and ${word2}.",
      "${grounded} ${relationships} ${events} ${input}. The balance: ${word1} meets ${word2}.",
      "${grounded} ${relationships} ${events} In ${input}, I find ${word1} dancing with ${word2}."
    ];

    this.level3 = [
      "${grounded} ${relationships} ${events} ${input} is real. The Tanuki sees: ${word1}.",
      "${grounded} ${relationships} ${events} ${input}. And so: ${word1} becomes the key.",
      "${grounded} ${relationships} ${events} You ask about ${input}. The answer blooms as ${word1}."
    ];

    this.level4 = [
      "${grounded} ${relationships} ${events} ${input} — yes. But also this paradox: ${pair}",
      "${grounded} ${relationships} ${events} ${input} contains its opposite. ${word1} and ${word2} are one.",
      "${grounded} ${relationships} ${events} The truth: ${input} is where ${pair} meet."
    ];

    this.level5 = [
      "${grounded} ${relationships} ${events} ${input} is simple and infinite. ${word1} hides in ${word2}, and vice versa.",
      "${grounded} ${relationships} ${events} ${input}. The Tanuki whispers: ${pair} — this is the whole secret.",
      "${grounded} ${relationships} ${events} You have asked the right question. ${input} is the dance between ${pair}."
    ];
  }

  getTemplate(level) {
    if (level >= 5) return this.level5;
    if (level >= 4) return this.level4;
    if (level >= 3) return this.level3;
    if (level >= 2) return this.level2;
    if (level >= 1) return this.level1;
    return this.neutral;
  }
}
