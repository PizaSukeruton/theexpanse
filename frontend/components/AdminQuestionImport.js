import { useState } from 'react';

export default function AdminQuestionImport() {
  const [jsonText, setJsonText] = useState('');
  const [topic, setTopic] = useState('Pokemon Knowledge');
  const [results, setResults] = useState([]);

  async function handleImport() {
    try {
      const response = await fetch('/api/import-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: JSON.parse(jsonText), topic })
      });
      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: 'auto' }}>
      <h2>Knowledge Batch Import</h2>
      <textarea rows={16} value={jsonText} onChange={e => setJsonText(e.target.value)} style={{ width: '100%' }} />
      <br/>
      Topic: <input value={topic} onChange={e => setTopic(e.target.value)} />
      <br/>
      <button onClick={handleImport}>Import</button>
      <ul>
        {results.map((r, i) => <li key={i}>{r.status}: {r.question}</li>)}
      </ul>
    </div>
  );
}
