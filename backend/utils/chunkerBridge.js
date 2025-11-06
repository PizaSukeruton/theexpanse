// backend/utils/chunkerBridge.js
// Bridge to Python Knowledge Chunker

const chunkerBridge = {
    /**
     * Call the Python Knowledge Chunker
     * @param {string} rawContent - Text to chunk
     * @returns {Promise<Object>} Chunker response with chunks array
     */
    async callKnowledgeChunker(rawContent) {
        try {
            const response = await fetch('http://localhost:8000/chunk_knowledge/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: rawContent,
                    config: {}
                })
            });

            if (!response.ok) {
                throw new Error(`Chunker API error: ${response.status}`);
            }

            const result = await response.json();
            
            // Return standardized format
            return {
                chunks: result.chunks || [],
                status: result.status || 'success',
                total_chunks: result.total_chunks_returned || 0
            };

        } catch (error) {
            console.warn('[ChunkerBridge] Chunker unavailable, returning empty chunks:', error.message);
            // Return empty chunks if chunker is down (graceful degradation)
            return {
                chunks: [],
                status: 'chunker_unavailable',
                total_chunks: 0
            };
        }
    }
};

export default chunkerBridge;
