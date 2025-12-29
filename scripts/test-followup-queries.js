import http from 'http';
import readline from 'readline';

const API_URL = 'http://localhost:3000';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function sendQuery(command) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/terminal/execute`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(JSON.stringify({
      command: command,
      mode: 'terminal'
    }));
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 TESTING Steps 1-3: Follow-Up Question Handling\n');
  console.log('================================================\n');

  // Test 1: Initial query
  console.log('TEST 1: Initial Query - "what is omiyage?"\n');
  try {
    const result1 = await sendQuery('what is omiyage?');
    console.log('Response:', JSON.stringify(result1, null, 2));
    console.log('\n✅ Check logs for: "[DEBUG] ENTERING knowledge-first block"\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  // Pause for user
  await new Promise(resolve => {
    rl.question('\n▶️  Press ENTER to send follow-up query...', () => resolve());
  });

  // Test 2: Follow-up query
  console.log('\nTEST 2: Follow-Up Query - "tell me more about omiyage"\n');
  try {
    const result2 = await sendQuery('tell me more about omiyage');
    console.log('Response:', JSON.stringify(result2, null, 2));
    console.log('\n✅ Check logs for:');
    console.log('   - "[DEBUG] Follow-up detected. Last entity: omiyage"');
    console.log('   - "[DEBUG] Recovered domains from context"');
    console.log('   - "[KnowledgeLayer] Using CONTEXT domains"\n');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }

  // Pause for user
  await new Promise(resolve => {
    rl.question('\n▶️  Press ENTER to check database...', () => resolve());
  });

  // Test 3: Database verification
  console.log('\nTEST 3: Database Verification\n');
  console.log('Run these SQL queries in your DB terminal:\n');
  console.log('-- Check Claude\'s domains:');
  console.log('SELECT domain_id, domain_name FROM knowledge_domains WHERE domain_id IN (SELECT domain_id FROM character_knowledge_slot_mappings WHERE character_id = \'#700002\');');
  console.log('\n-- Check if omiyage was found in knowledge_items:');
  console.log('SELECT knowledge_id, item_name FROM knowledge_items WHERE lower(item_name) LIKE \'%omiyage%\' LIMIT 5;\n');

  rl.close();
}

runTests().catch(console.error);
