import pool from './backend/db/pool.js';
import RealityGrounder from './backend/TSE/TanukiEngine/RealityGrounder.js';

async function testGrounding() {
  console.log('\n🧪 Testing RealityGrounder...\n');

  const grounder = new RealityGrounder();
  const CLAUDE_ID = '#700002';

  try {
    console.log(`📍 Grounding query for entity: "gifts" (Character: ${CLAUDE_ID})\n`);

    const groundedContext = await grounder.ground('gifts', CLAUDE_ID);

    console.log('✅ Grounded Context received:\n');
    console.log(JSON.stringify(groundedContext, null, 2));

    console.log('\n📊 Grounded Reality Summary:');
    if (groundedContext.groundedReality) {
      console.log(`  - Has Inventory Match: ${groundedContext.groundedReality.hasInventoryMatch}`);
      console.log(`  - Has Trait Match: ${groundedContext.groundedReality.hasTraitMatch}`);
      console.log(`  - Has Knowledge Match: ${groundedContext.groundedReality.hasKnowledgeMatch}`);
      console.log(`  - Match Confidence: ${(groundedContext.matchConfidence * 100).toFixed(1)}%`);

      console.log('\n📦 Related Inventory:');
      if (groundedContext.groundedReality.relatedInventory.length > 0) {
        groundedContext.groundedReality.relatedInventory.forEach(item => {
          console.log(`    - ${item.object_name}`);
        });
      } else {
        console.log('    (none found)');
      }

      console.log('\n💪 Relevant Traits:');
      if (groundedContext.groundedReality.relevantTraits.length > 0) {
        groundedContext.groundedReality.relevantTraits.slice(0, 3).forEach(trait => {
          console.log(`    - ${trait.trait_name} (${trait.percentile_score}%)`);
        });
      } else {
        console.log('    (none found)');
      }

      console.log('\n🧠 Accessible Knowledge:');
      if (groundedContext.groundedReality.accessibleKnowledge.length > 0) {
        groundedContext.groundedReality.accessibleKnowledge.slice(0, 3).forEach(domain => {
          console.log(`    - ${domain.domain_name} (${domain.access_percentage}% access)`);
        });
      } else {
        console.log('    (none found)');
      }
    }

    console.log('\n📝 Generated Grounded Statement:');
    const statement = grounder.generateGroundedStatement(groundedContext);
    console.log(`"${statement}"\n`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  process.exit(0);
}

testGrounding();
