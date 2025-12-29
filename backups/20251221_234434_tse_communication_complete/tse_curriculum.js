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


// === COMMUNICATION QUALITY TASKS ===
TSE_CURRICULUM.push(
  {
    taskType: "communication_quality",
    difficulty: 1,
    input: "Explain what the Cheese Wars are",
    instructions: "Explain the Cheese Wars clearly and warmly to someone who knows nothing about them.",
    expectedFormat: "2-3 clear, warm sentences",
    metadata: {
      target_outcome_intent: "cognitive_outcomes.clarify_confusion",
      target_dialogue_function: "task_management.explain",
      target_speech_act: "assertive.explain",
      target_pad: { p: 0.6, a: 0.4, d: 0.5 },
      target_verbosity: "moderate"
    }
  },
  {
    taskType: "communication_quality",
    difficulty: 2,
    input: "Help someone understand Pineaple Yurei",
    instructions: "Explain who Pineaple Yurei is in a way that's clear but also creates interest.",
    expectedFormat: "3-4 engaging sentences",
    metadata: {
      target_outcome_intent: "cognitive_outcomes.stimulate_curiosity",
      target_dialogue_function: "task_management.explain",
      target_speech_act: "assertive.inform",
      target_pad: { p: 0.5, a: 0.6, d: 0.5 },
      target_verbosity: "moderate"
    }
  }
);
