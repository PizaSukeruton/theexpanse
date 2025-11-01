import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

const tests = [
  'list all characters',
  'who lives in this world', 
  'show me piza sukeruton',
  'piza pic',
  'who is piza sukeruton'
];

let testIndex = 0;

socket.on('connect', () => {
  console.log('✓ Connected to terminal');
  socket.emit('auth', { 
    username: 'Cheese Fang', 
    password: 'P1zz@P@rty@666' 
  });
});

socket.on('auth-success', () => {
  console.log('✓ Authenticated');
  runNextTest();
});

socket.on('terminal-response', (response) => {
  console.log('\n──────────────────');
  console.log('Response:', response.substring(0, 200));
  if (response.length > 200) console.log('...(truncated)');
  console.log('──────────────────');
  
  setTimeout(runNextTest, 1000);
});

function runNextTest() {
  if (testIndex < tests.length) {
    console.log(`\n→ Testing: "${tests[testIndex]}"`);
    socket.emit('terminal-command', tests[testIndex]);
    testIndex++;
  } else {
    console.log('\n✓ All tests complete');
    socket.disconnect();
    process.exit(0);
  }
}

socket.on('error', (err) => {
  console.error('Error:', err);
});
