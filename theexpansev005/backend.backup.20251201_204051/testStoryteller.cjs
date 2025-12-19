const http = require('http');

// Test character ID (Claude)
const characterId = '#700002';

// Make the API request
const options = {
    hostname: 'localhost',
    port: 3000, // Adjust if your server runs on different port
    path: `/api/narrative/storyteller/${characterId}`,
    method: 'GET',
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
            const response = JSON.parse(data);
            console.log('\n✅ STORYTELLER RESPONSE:\n');
            console.log(JSON.stringify(response, null, 2));
            
            // Verify key fields
            if (response.status === 'success') {
                console.log('\n✅ SUCCESS! Fields present:');
                console.log('  - segment_id:', response.segment_id);
                console.log('  - title:', response.title);
                console.log('  - narrative_text:', response.narrative_text ? '✓' : '✗ (MISSING)');
                console.log('  - mood:', response.mood);
                console.log('  - choices:', response.choices?.length || 0, 'available');
            } else {
                console.log('\n❌ Status:', response.status);
            }
        } catch (e) {
            console.error('Failed to parse response:', e.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Your server is running on port 3000');
    console.log('2. Database is connected');
    console.log('3. Character #700002 exists');
});

req.end();
