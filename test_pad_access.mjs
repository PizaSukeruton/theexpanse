import knowledgeAccess from './backend/utils/knowledgeAccess.js';

const rows = await knowledgeAccess.getKnowledgeByContentKey('pad_theory_basics');
console.log('PAD Theory Basics rows:', JSON.stringify(rows, null, 2));
process.exit(0);
