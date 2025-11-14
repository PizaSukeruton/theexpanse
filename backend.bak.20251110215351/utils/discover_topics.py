#!/usr/bin/env python3
import sys
import json
import re
from collections import Counter
import spacy

def discover_topics(json_file, top_n=20):
    """
    Discover the most important topics in a document.
    
    Args:
        json_file: Path to refined paragraphs JSON
        top_n: Number of top topics to return
    
    Returns:
        List of top topics with frequencies
    """
    
    # Load the refined paragraphs
    with open(json_file, 'r') as f:
        paragraphs = json.load(f)
    
    # Load spaCy for proper noun detection
    nlp = spacy.load("en_core_web_sm")
    
    # Combine all text
    all_text = ' '.join(p['text'] for p in paragraphs)
    
    # Process with spaCy for better entity recognition
    doc = nlp(all_text)
    
    # Count different types of terms
    word_counts = Counter()
    entity_counts = Counter()
    proper_noun_counts = Counter()
    
    # Count named entities
    for ent in doc.ents:
        if ent.label_ in ["PERSON", "ORG", "GPE", "PRODUCT", "WORK_OF_ART"]:
            entity_counts[ent.text] += 1
    
    # Count all tokens (excluding stop words and punctuation)
    for token in doc:
        if not token.is_stop and not token.is_punct and len(token.text) > 2:
            # Normalize to lowercase for general words
            word = token.text if token.pos_ == "PROPN" else token.text.lower()
            word_counts[word] += 1
            
            # Track proper nouns separately
            if token.pos_ == "PROPN":
                proper_noun_counts[token.text] += 1
    
    # Combine scores with weights
    topic_scores = Counter()
    
    # Weight entities heavily (they're usually important)
    for entity, count in entity_counts.items():
        topic_scores[entity] += count * 3
    
    # Add proper nouns
    for noun, count in proper_noun_counts.items():
        topic_scores[noun] += count * 2
    
    # Add frequent words (but with lower weight)
    for word, count in word_counts.most_common(100):
        if count > 3:  # Must appear at least 3 times
            topic_scores[word] += count
    
    # Filter out generic terms
    blacklist = {
        'the', 'and', 'that', 'this', 'with', 'from', 'also', 'which',
        'have', 'has', 'had', 'been', 'were', 'was', 'are', 'its', 'their',
        'game', 'games', 'series', 'first', 'new', 'one', 'two', 'three'
    }
    
    # Remove blacklisted terms
    for term in blacklist:
        topic_scores.pop(term, None)
        topic_scores.pop(term.capitalize(), None)
    
    # Get top topics
    top_topics = topic_scores.most_common(top_n)
    
    print("\n" + "="*60)
    print("AUTOMATIC TOPIC DISCOVERY")
    print("="*60)
    print(f"\n📄 Document: {json_file}")
    print(f"📊 Paragraphs analyzed: {len(paragraphs)}")
    print(f"📝 Total words: {len(all_text.split())}")
    
    print(f"\n🎯 TOP {top_n} DISCOVERED TOPICS:")
    print("-"*40)
    
    # Group by score ranges for better display
    for i, (topic, score) in enumerate(top_topics, 1):
        # Determine importance level
        if i <= 5:
            importance = "🔥 PRIMARY"
        elif i <= 10:
            importance = "⭐ SECONDARY"
        else:
            importance = "📌 RELATED"
        
        print(f"{i:2}. {topic:20} (score: {score:4}) {importance}")
    
    # Extract just the topic names for use in QA extraction
    topic_list = [topic for topic, _ in top_topics[:10]]  # Use top 10 for QA
    
    print(f"\n💡 SUGGESTED TOPICS FOR QA EXTRACTION:")
    print(f'["{"\", \"".join(topic_list[:6])}"]')
    
    print("="*60)
    
    return topic_list

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: discover_topics.py <refined_json> [top_n]")
        sys.exit(1)
    
    json_file = sys.argv[1]
    top_n = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    discover_topics(json_file, top_n)
