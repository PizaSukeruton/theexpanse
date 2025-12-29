import fetch from 'node-fetch';

(async () => {
  const res = await fetch('http://localhost:3000/api/tse/knowledgeresponse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      characterId: '#700002',
      query: 'Tell a short story about Piza Sukeruton and their friends.',
      context: { mode: 'storytelling', length: 'short' }
    })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
})();
