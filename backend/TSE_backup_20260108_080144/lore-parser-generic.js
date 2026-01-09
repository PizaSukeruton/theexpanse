let tempEntityCounter = 0;

function generateTempEntityId() {
  tempEntityCounter += 1;
  return `ent_${tempEntityCounter}`;
}

function inferEntityType(name, contextSentence = '') {
  const lowerName = name.toLowerCase();
  const lowerCtx = contextSentence.toLowerCase();

  if (/realm|city|village|planet|world|kingdom|forest|mountain|castle|region|area|zone|territory/.test(lowerName)) {
    return 'location';
  }
  if (/sword|shield|ring|artifact|relic|staff|wand|tool|weapon|item|object|device/.test(lowerName)) {
    return 'artifact';
  }
  if (/battle|war|event|rebellion|uprising|siege|incident|ceremony|discovery|creation/.test(lowerName) ||
      /took place|happened|occurred|unfolded|began|ended/.test(lowerCtx)) {
    return 'event';
  }
  if (/curse|magic|force|energy|concept|law|rule|principle|mechanic|system|process/.test(lowerName)) {
    return 'concept';
  }
  if (/\s/.test(name) && /^[A-Z]/.test(name)) {
    return 'character';
  }
  return 'unknown';
}

function extractEntityNameCandidates(markdown) {
  const lines = markdown.split(/\r?\n/);
  const headingNames = [];
  const titleCaseCandidates = {};

  for (const line of lines) {
    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      headingNames.push(headingMatch[2].trim());
      continue;
    }

    const phraseRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\b/g;
    let match;
    while ((match = phraseRegex.exec(line)) !== null) {
      const phrase = match[1].trim();
      if (phrase.length < 3) continue;
      titleCaseCandidates[phrase] = (titleCaseCandidates[phrase] || 0) + 1;
    }
  }

  const repeatedTitleCase = Object.entries(titleCaseCandidates)
    .filter(([, count]) => count >= 2)
    .map(([phrase]) => phrase);

  return Array.from(new Set([...headingNames, ...repeatedTitleCase]));
}

function extractFactsForEntity(markdown, entityName) {
  const sentences = markdown
    .replace(/\r?\n/g, ' ')
    .split(/(?<=[.!?])\s+/);
  const facts = [];
  const nameRegex = new RegExp(`\\b${entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);

  for (const sentence of sentences) {
    if (nameRegex.test(sentence)) {
      const cleaned = sentence.trim();
      if (cleaned.length > 0) {
        facts.push(cleaned);
      }
    }
  }
  return Array.from(new Set(facts));
}

function extractRelationshipsForEntity(markdown, entityName) {
  const relationships = {
    enemy: [],
    ally: [],
    associated_with: []
  };

  const sentences = markdown
    .replace(/\r?\n/g, ' ')
    .split(/(?<=[.!?])\s+/);

  const nameRegex = new RegExp(`\\b${entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');

  for (const sentence of sentences) {
    if (!nameRegex.test(sentence)) continue;

    if (/enemy|arch[-\s]?nemesis|foe|rival|opponent|adversary/.test(sentence)) {
      const others = extractOtherNamesFromSentence(sentence, entityName);
      relationships.enemy.push(...others);
    }

    if (/ally|allies|friend|companion|partner|comrade|supporter|associate/.test(sentence)) {
      const others = extractOtherNamesFromSentence(sentence, entityName);
      relationships.ally.push(...others);
    }

    const others = extractOtherNamesFromSentence(sentence, entityName);
    relationships.associated_with.push(...others);
  }

  for (const key of Object.keys(relationships)) {
    const unique = Array.from(new Set(relationships[key]));
    if (unique.length === 0) {
      delete relationships[key];
    } else {
      relationships[key] = unique;
    }
  }

  return relationships;
}

function extractOtherNamesFromSentence(sentence, entityName) {
  const result = [];
  const phraseRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\b/g;
  let match;
  while ((match = phraseRegex.exec(sentence)) !== null) {
    const phrase = match[1].trim();
    if (phrase === entityName) continue;
    result.push(phrase);
  }
  return result;
}

export function parseMultiverseLoreDocuments(documents, universeId) {
  tempEntityCounter = 0;
  const entitiesByName = new Map();
  const allMarkdown = documents.join('\n\n');
  const nameCandidates = extractEntityNameCandidates(allMarkdown);

  for (const name of nameCandidates) {
    const tempId = generateTempEntityId();
    entitiesByName.set(name, {
      tempId,
      type: 'unknown',
      name,
      aliases: [],
      canonical_facts: [],
      relationships: {}
    });
  }

  for (const doc of documents) {
    for (const [name, entity] of entitiesByName.entries()) {
      const facts = extractFactsForEntity(doc, name);
      if (facts.length > 0) {
        entity.canonical_facts.push(...facts);
        if (entity.type === 'unknown' && facts[0]) {
          entity.type = inferEntityType(name, facts[0]);
        }
        const rels = extractRelationshipsForEntity(doc, name);
        for (const [relType, targets] of Object.entries(rels)) {
          if (!entity.relationships[relType]) {
            entity.relationships[relType] = [];
          }
          entity.relationships[relType].push(...targets);
        }
      }
    }
  }

  for (const entity of entitiesByName.values()) {
    entity.canonical_facts = Array.from(new Set(entity.canonical_facts));
    for (const key of Object.keys(entity.relationships)) {
      entity.relationships[key] = Array.from(new Set(entity.relationships[key]));
    }
  }

  const entities = Array.from(entitiesByName.values());
  const sqlInserts = entities.map((entity, idx) => {
    const knowledgeIdPlaceholder = `$knowledge_id_${idx + 1}`;
    const canonicalFactsJson = JSON.stringify(entity.canonical_facts);
    const relationshipsJson = JSON.stringify(entity.relationships);

    return `
      INSERT INTO lore_knowledge_graph (
        knowledge_id, universe_id, knowledge_type, entity_name,
        canonical_facts, relationships, properties, metadata
      ) VALUES (
        ${knowledgeIdPlaceholder}, $universe_id, '${entity.type}',
        ${escapeSqlString(entity.name)},
        '${canonicalFactsJson.replace(/'/g, "''")}'::jsonb,
        '${relationshipsJson.replace(/'/g, "''")}'::jsonb,
        '{}'::jsonb, '{}'::jsonb
      );
    `.trim();
  });

  return { entities, sqlInserts };
}

function escapeSqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

export default {
  parseMultiverseLoreDocuments
};
