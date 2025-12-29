import KnowledgeResponseEngine from './backend/tse/helpers/KnowledgeResponseEngine.js';

console.log('Testing KnowledgeResponseEngine initialization...');

try {
    const knowledgeEngine = new KnowledgeResponseEngine();
    console.log('Constructor succeeded');
    
    await knowledgeEngine.initialize();
    console.log('Initialize succeeded');
    
    console.log('✅ TSE initialization works!');
} catch (error) {
    console.error('❌ TSE initialization failed:', error);
    console.error(error.stack);
}

process.exit(0);
