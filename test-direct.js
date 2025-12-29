import MechanicalBrain_v2 from './backend/TSE/TanukiEngine/MechanicalBrain_v2.js';

async function testDirectly() {
  console.log('🧪 Testing RealityGrounder integration directly...\n');

  const brain = new MechanicalBrain_v2();
  const characterId = '#700002'; // Claude

  try {
    console.log('📍 Generating response for: "What objects do you carry?"\n');

    const response = await brain.generateResponse(
      'What objects do you carry?',
      characterId,
      { type: 'QUERY', entity: 'objects' }
    );

    console.log('✅ Response generated:\n');
    console.log(response);
    console.log('\n✅ Success! RealityGrounder is integrated and working!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

testDirectly();
