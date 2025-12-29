import io from 'socket.io-client';

const socket = io('http://localhost:3000/terminal');

socket.on('connect', () => {
  console.log('✅ Connected to terminal socket');
  
  socket.emit('terminal-command', {
    command: 'ask claude "Do you have any gifts?"'
  });
});

socket.on('command-response', (response) => {
  console.log('\n📬 Response received:\n');
  console.log(JSON.stringify(response, null, 2));
  socket.disconnect();
  process.exit(0);
});

socket.on('error', (err) => {
  console.error('❌ Socket error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.error('❌ Timeout - no response');
  process.exit(1);
}, 5000);
