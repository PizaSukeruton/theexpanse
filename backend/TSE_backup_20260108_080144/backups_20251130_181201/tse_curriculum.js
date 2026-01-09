export const TSE_CURRICULUM = [
  {
    taskType: "cause_effect_rewrite",
    difficulty: 1,
    input:
      "The hero found a map and then they walked into the forest and then they saw a tower.",
    instructions:
      "Rewrite the sequence using causal links. Replace 'and then' with cause–effect structures like 'because', 'so', 'therefore', or 'as a result'.",
    expectedFormat:
      "1–3 sentences using explicit causal connectors."
  },
  {
    taskType: "sentence_clarity_rewrite",
    difficulty: 1,
    input:
      "The wizard was powerful and mysterious and confusing and nobody knew what he wanted.",
    instructions:
      "Rewrite to improve clarity and remove unnecessary repetition.",
    expectedFormat:
      "1–2 clear sentences with concise meaning."
  },
  {
    taskType: "summarize_core_point",
    difficulty: 1,
    input:
      "The village was destroyed by a dragon who came down from the mountains because the villagers had unknowingly taken the dragon’s sacred stone.",
    instructions:
      "Summarize the core point in one sentence.",
    expectedFormat:
      "A single concise summary sentence."
  }
];

TSE_CURRICULUM.push(
  {
    taskType: "cause_effect_rewrite",
    difficulty: 2,
    input:
      "The inventor built a strange machine and then activated it and then the sky cracked open.",
    instructions:
      "Rewrite with causal structure and clarify the chain of events.",
    expectedFormat: "2–4 sentences showing clear cause–effect reasoning."
  },
  {
    taskType: "cause_effect_rewrite",
    difficulty: 3,
    input:
      "The council denied the traveler entry and then the ancient wards failed and then a forgotten god stirred beneath the capital.",
    instructions:
      "Rewrite with strong, explicit causal logic that connects political, magical, and narrative consequences.",
    expectedFormat:
      "3–5 sentences with layered causal relationships."
  }
);

