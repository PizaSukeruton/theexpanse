import LoreKnowledgeSeeder from './LoreKnowledgeSeeder.js';

const seeder = new LoreKnowledgeSeeder();
const result = await seeder.seedCharacterLore();
console.log('Seeded items:');
result.forEach(item => console.log('  -', item.character_name, '(' + item.category + ')'));

const lore = await seeder.getLoreKnowledge(5);
console.log('\nStored lore (sample):');
lore.forEach(item => console.log('  - Knowledge ID:', item.knowledge_id, 'Entity:', item.entity_name));

process.exit(0);
