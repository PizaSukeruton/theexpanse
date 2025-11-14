#!/usr/bin/env python3
import sys
import json
import re
import logging
from typing import List, Dict
from dataclasses import dataclass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class RefinedParagraph:
    text: str
    original_id: int
    split_id: int
    word_count: int
    sentence_count: int
    page: int
    quality_score: float

class ParagraphRefiner:
    def __init__(self, max_words=200, min_words=50):
        self.max_words = max_words
        self.min_words = min_words
        
        # Natural break indicators
        self.transition_patterns = [
            r'^(However|Moreover|Furthermore|Additionally|In addition|Nevertheless|Nonetheless)',
            r'^(First|Second|Third|Finally|Lastly)',
            r'^(Before|After|During|Since|While)',
            r'^(Another|Also|Besides|Meanwhile)',
            r'^(In contrast|On the other hand|Conversely)',
            r'^(For example|For instance|Such as)',
            r'^(Therefore|Thus|Hence|Consequently|As a result)',
        ]
        
        self.topic_shift_patterns = [
            r'^\w+\s+(also|additionally|furthermore)\s+',
            r'^(The|This|These|Those)\s+\w+\s+(also|has|have|was|were)',
        ]
    
    def should_split_here(self, sentence: str, prev_sentence: str = None) -> float:
        """
        Calculate probability this is a good split point (0-1).
        
        Args:
            sentence: Current sentence
            prev_sentence: Previous sentence
        
        Returns:
            Split probability score
        """
        score = 0.0
        
        # Check for transition words
        for pattern in self.transition_patterns:
            if re.match(pattern, sentence, re.IGNORECASE):
                score += 0.4
                break
        
        # Check for topic shift patterns
        for pattern in self.topic_shift_patterns:
            if re.match(pattern, sentence, re.IGNORECASE):
                score += 0.3
                break
        
        # Check if previous sentence ends with citation
        if prev_sentence and re.search(r'\[\d+\]\.?$', prev_sentence):
            score += 0.2
        
        # Check for time/date at start
        if re.match(r'^(In \d{4}|On \w+|During the)', sentence):
            score += 0.3
        
        # Check for quotes at start
        if sentence.startswith('"'):
            score += 0.2
        
        # Check for numbered points
        if re.match(r'^\d+\.?\s+', sentence):
            score += 0.5
        
        return min(score, 1.0)
    
    def split_paragraph(self, text: str) -> List[str]:
        """
        Split a long paragraph into smaller logical chunks.
        
        Args:
            text: Paragraph text
        
        Returns:
            List of paragraph chunks
        """
        # First split into sentences
        sentences = self.split_into_sentences(text)
        
        if not sentences:
            return [text]
        
        chunks = []
        current_chunk = []
        current_words = 0
        
        for i, sentence in enumerate(sentences):
            sentence_words = len(sentence.split())
            prev_sentence = sentences[i-1] if i > 0 else None
            
            # Check if we should start a new chunk
            split_score = self.should_split_here(sentence, prev_sentence)
            
            should_split = False
            
            # Force split if over max words
            if current_words + sentence_words > self.max_words and current_chunk:
                should_split = True
            
            # Consider splitting if we have enough content and good split point
            elif current_words >= self.min_words and split_score >= 0.4:
                should_split = True
            
            if should_split and current_chunk:
                # Save current chunk
                chunk_text = ' '.join(current_chunk).strip()
                if chunk_text:
                    chunks.append(chunk_text)
                current_chunk = [sentence]
                current_words = sentence_words
            else:
                current_chunk.append(sentence)
                current_words += sentence_words
        
        # Add remaining chunk
        if current_chunk:
            chunk_text = ' '.join(current_chunk).strip()
            if chunk_text:
                chunks.append(chunk_text)
        
        return chunks if chunks else [text]
    
    def split_into_sentences(self, text: str) -> List[str]:
        """
        Smart sentence splitter that handles abbreviations and citations.
        
        Args:
            text: Paragraph text
        
        Returns:
            List of sentences
        """
        # Protect abbreviations
        text = re.sub(r'\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr)\.\s*', r'\1<DOT> ', text)
        text = re.sub(r'\b(Inc|Ltd|Corp|Co)\.\s*', r'\1<DOT> ', text)
        text = re.sub(r'\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.\s*', r'\1<DOT> ', text)
        text = re.sub(r'\b(vs|etc|i\.e|e\.g|cf|al)\.\s*', r'\1<DOT> ', text)
        
        # Split on sentence endings
        sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
        
        # Restore dots
        sentences = [s.replace('<DOT>', '.') for s in sentences]
        
        # Clean up
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Merge sentences that are just citations
        merged = []
        for sent in sentences:
            if re.match(r'^\[\d+\]', sent) and merged:
                merged[-1] += ' ' + sent
            else:
                merged.append(sent)
        
        return merged
    
    def refine_paragraphs(self, paragraphs_json: str) -> List[RefinedParagraph]:
        """
        Refine a list of paragraphs by splitting large ones.
        
        Args:
            paragraphs_json: JSON string of paragraph data
        
        Returns:
            List of refined paragraphs
        """
        paragraphs = json.loads(paragraphs_json) if isinstance(paragraphs_json, str) else paragraphs_json
        
        refined = []
        
        for para in paragraphs:
            text = para['text']
            word_count = para['metadata']['word_count']
            
            # Skip if already good size
            if word_count <= self.max_words:
                refined.append(RefinedParagraph(
                    text=text,
                    original_id=para['id'],
                    split_id=0,
                    word_count=word_count,
                    sentence_count=para['metadata']['sentence_count'],
                    page=para['page'],
                    quality_score=para['score']
                ))
                logger.info(f"Kept paragraph {para['id']} as-is ({word_count} words)")
            else:
                # Split large paragraph
                chunks = self.split_paragraph(text)
                logger.info(f"Split paragraph {para['id']} ({word_count} words) into {len(chunks)} chunks")
                
                for i, chunk in enumerate(chunks):
                    chunk_words = len(chunk.split())
                    chunk_sentences = chunk.count('.') + chunk.count('!') + chunk.count('?')
                    
                    refined.append(RefinedParagraph(
                        text=chunk,
                        original_id=para['id'],
                        split_id=i,
                        word_count=chunk_words,
                        sentence_count=chunk_sentences,
                        page=para['page'],
                        quality_score=para['score'] * 0.95  # Slightly lower score for splits
                    ))
                    logger.info(f"  Chunk {i+1}: {chunk_words} words")
        
        return refined
    
    def export_refined(self, refined: List[RefinedParagraph]) -> str:
        """
        Export refined paragraphs to JSON format.
        
        Args:
            refined: List of refined paragraphs
        
        Returns:
            JSON string
        """
        export = []
        for i, para in enumerate(refined):
            export.append({
                'text': para.text,
                'id': i,
                'original_id': para.original_id,
                'split_id': para.split_id,
                'page': para.page,
                'score': para.quality_score,
                'metadata': {
                    'word_count': para.word_count,
                    'sentence_count': para.sentence_count,
                    'is_split': para.split_id > 0
                }
            })
        return json.dumps(export, indent=2)

def main():
    if len(sys.argv) < 2:
        print("Usage: paragraph_refiner.py <json_file> [max_words] [min_words]")
        sys.exit(1)
    
    json_file = sys.argv[1]
    max_words = int(sys.argv[2]) if len(sys.argv) > 2 else 200
    min_words = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    
    # Read the JSON file
    with open(json_file, 'r') as f:
        paragraphs = json.load(f)
    
    refiner = ParagraphRefiner(max_words, min_words)
    refined = refiner.refine_paragraphs(paragraphs)
    
    # Statistics
    original_count = len(paragraphs)
    refined_count = len(refined)
    
    print(f"\n{'='*60}", file=sys.stderr)
    print(f"PARAGRAPH REFINEMENT COMPLETE", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"Original paragraphs: {original_count}", file=sys.stderr)
    print(f"Refined paragraphs: {refined_count}", file=sys.stderr)
    print(f"Splits performed: {refined_count - original_count}", file=sys.stderr)
    
    word_dist = {
        "0-50": sum(1 for p in refined if p.word_count <= 50),
        "51-100": sum(1 for p in refined if 50 < p.word_count <= 100),
        "101-150": sum(1 for p in refined if 100 < p.word_count <= 150),
        "151-200": sum(1 for p in refined if 150 < p.word_count <= 200),
        "200+": sum(1 for p in refined if p.word_count > 200)
    }
    
    print(f"\nWord count distribution:", file=sys.stderr)
    for range_name, count in word_dist.items():
        print(f"  {range_name} words: {count} paragraphs", file=sys.stderr)
    
    # Output the refined JSON
    print(refiner.export_refined(refined))

if __name__ == "__main__":
    main()
