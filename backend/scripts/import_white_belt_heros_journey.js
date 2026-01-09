import generateHexId from '../utils/hexIdGenerator.js';
import pool from '../db/pool.js';

const DOMAIN_ID = '#AE0008';
const INITIAL_CHARACTER_ID = '#700002';

const ITEMS = [
  {
    concept: 'monomyth_definition',
    teaching: 'The monomyth is the common pattern found in hero stories across many cultures; it is also called the Hero’s Journey and was identified by Joseph Campbell.',
    testing: 'What is the monomyth?',
    answer: 'The monomyth is the common pattern found in hero stories across many cultures; it is also called the Hero’s Journey.'
  },
  {
    concept: 'campbell_identity',
    teaching: 'Joseph Campbell is the mythologist who identified and named the Hero’s Journey in his 1949 book The Hero with a Thousand Faces.',
    testing: 'Who identified the Hero’s Journey?',
    answer: 'Joseph Campbell.'
  },
  {
    concept: 'three_sections',
    teaching: 'The Hero’s Journey is divided into three major sections: Departure, Initiation, and Return.',
    testing: 'What are the three major sections of the Hero’s Journey?',
    answer: 'Departure, Initiation, and Return.'
  },
  {
    concept: 'basic_pattern',
    teaching: 'The basic pattern of the Hero’s Journey is that a hero leaves the ordinary world, faces challenges in a special world, and returns home transformed.',
    testing: 'What is the basic pattern of the Hero’s Journey?',
    answer: 'A hero leaves the ordinary world, faces challenges in a special world, and returns home transformed.'
  },
  {
    concept: 'modern_example',
    teaching: 'Star Wars: A New Hope is a modern film that clearly follows the Hero’s Journey through Luke Skywalker’s story.',
    testing: 'Name one modern movie that follows the Hero’s Journey.',
    answer: 'Star Wars: A New Hope.'
  }
];

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const item of ITEMS) {
      const knowledgeId = await generateHexId('knowledge_item_id');

      await client.query(
        `INSERT INTO knowledge_items
         (knowledge_id, domain_id, initial_character_id, concept, source_type, content)
         VALUES ($1, $2, $3, $4, 'curriculum', $5)`,
        [
          knowledgeId,
          DOMAIN_ID,
          INITIAL_CHARACTER_ID,
          item.concept,
          JSON.stringify({
            teaching_statement: item.teaching,
            testing_statement: item.testing,
            answer_statement: item.answer
          })
        ]
      );
    }

    await client.query('COMMIT');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
})();
