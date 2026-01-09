const QUESTION_TEMPLATES = [
  {
    difficulty: 'easy',
    category: 'factual_recall',
    apply: (entity) => {
      if (!entity.canonical_facts || entity.canonical_facts.length === 0) return null;
      const fact = pickRandom(entity.canonical_facts);
      return {
        question_text: `What is true about ${entity.name}?`,
        correct_answer: fact,
        acceptable_variations: [fact]
      };
    }
  },
  {
    difficulty: 'easy',
    category: 'definition',
    apply: (entity) => {
      if (!entity.canonical_facts || entity.canonical_facts.length === 0) return null;
      const fact = pickRandom(entity.canonical_facts);
      return {
        question_text: `Who or what is ${entity.name}?`,
        correct_answer: fact,
        acceptable_variations: [fact]
      };
    }
  },
  {
    difficulty: 'medium',
    category: 'relationship_mapping',
    apply: (entity) => {
      if (!entity.relationships) return null;
      const relTypes = Object.keys(entity.relationships);
      if (relTypes.length === 0) return null;
      const relType = pickRandom(relTypes);
      const targets = entity.relationships[relType];
      if (!targets || targets.length === 0) return null;
      const targetName = pickRandom(targets);
      return {
        question_text: `How are ${entity.name} and ${targetName} related?`,
        correct_answer: `${entity.name} has a "${relType}" relationship with ${targetName}.`,
        acceptable_variations: []
      };
    }
  },
  {
    difficulty: 'medium',
    category: 'causal_chain',
    apply: (entity) => {
      if (entity.type !== 'event') return null;
      if (!entity.canonical_facts || entity.canonical_facts.length === 0) return null;
      const fact = pickRandom(entity.canonical_facts);
      return {
        question_text: `What happened when ${entity.name} occurred?`,
        correct_answer: fact,
        acceptable_variations: [fact]
      };
    }
  },
  {
    difficulty: 'hard',
    category: 'mechanic_explanation',
    apply: (entity) => {
      if (entity.type !== 'concept') return null;
      const fact = entity.canonical_facts && entity.canonical_facts[0]
        ? entity.canonical_facts[0]
        : `It is an important concept in this universe.`;
      return {
        question_text: `Explain how ${entity.name} works in this universe.`,
        correct_answer: fact,
        acceptable_variations: [fact]
      };
    }
  }
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateUniverseAgnosticQuestions(knowledgeRows, universeId, count = 50) {
  const questions = [];
  let questionCounter = 0;
  let guard = 0;
  const maxGuard = count * 10;

  while (questions.length < count && guard < maxGuard) {
    guard += 1;

    const entity = pickRandom(knowledgeRows);
    const template = pickRandom(QUESTION_TEMPLATES);

    const result = template.apply(entity);
    if (!result) continue;

    questionCounter += 1;
    const questionId = `#Q${questionCounter.toString(16).toUpperCase().padStart(6, '0')}`;

    questions.push({
      id: questionId,
      universe_id: universeId,
      difficulty: template.difficulty,
      category: template.category,
      question_text: result.question_text,
      correct_answer: result.correct_answer,
      acceptable_variations: result.acceptable_variations || [],
      knowledge_areas: [entity.knowledge_id],
      sql_ready: true
    });
  }

  const sqlInserts = questions.map((q) => {
    const acceptableJson = JSON.stringify(q.acceptable_variations);
    const knowledgeAreasJson = JSON.stringify(q.knowledge_areas);

    return `
      INSERT INTO lore_questions (
        question_id, universe_id, difficulty, category, question_text,
        correct_answer, acceptable_variations, knowledge_areas
      ) VALUES (
        '${q.id}', '${q.universe_id}', '${q.difficulty}', '${q.category}',
        ${escapeSqlString(q.question_text)},
        ${escapeSqlString(q.correct_answer)},
        '${acceptableJson.replace(/'/g, "''")}'::jsonb,
        '${knowledgeAreasJson.replace(/'/g, "''")}'::jsonb
      );
    `.trim();
  });

  return { questions, sqlInserts };
}

function escapeSqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

export default {
  generateUniverseAgnosticQuestions
};
