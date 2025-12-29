//
// Simple JS embedding + cosine similarity
// ZERO external APIs — deterministic and fast
//

// Convert text → fixed vector of 256 dims (hash-based embedding)
export function embedText(text) {
    const vec = new Array(256).fill(0);

    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        const idx = code % 256;
        vec[idx] += 1;
    }

    // Normalize
    const norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0));
    return vec.map(v => v / (norm || 1));
}

// Cosine similarity between two vectors
export function cosineSimilarity(a, b) {
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}
