import pool from './backend/db/pool.js';
import TeacherComponent from './backend/TSE/TeacherComponent.js';

async function runTest() {
    console.log('Testing handleKnowledgeCycle...');
    
    try {
        const teacherComponent = new TeacherComponent(pool);
        await teacherComponent.initialize();
        
        console.log('Calling handleKnowledgeCycle for Claude...');
        const result = await teacherComponent.handleKnowledgeCycle(
            '#800000',
            '#700002',
            null,
            'storytelling_tanuki_v1'
        );

        console.log('SUCCESS: Method returned data');
        console.log('Lesson:', result.instruction_data.lessonName);
        console.log('Task:', result.instruction_data.taskName);
        console.log('Prompt:', result.instruction_data.promptTemplate);
        console.log('Input Pool Item:', result.instruction_data.selectedInput);
        
    } catch (error) {
        console.error('ERROR:', error.message);
    }
    
    await pool.end();
    process.exit(0);
}

runTest();
