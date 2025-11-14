#!/usr/bin/env python3
"""
Extract Q&A pairs from clean, individual sentences.
Much simpler and more accurate than paragraph-level extraction.
"""

import json
import sys
import spacy
import logging
sys.path.insert(0, '/Users/pizasukeruton/Desktop/theexpanse/backend/utils')

from qa_patterns import find_svo, find_passive_constructions, find_release_dates, find_copular_defs, find_meaningful_quantities
from qa_templates import realize_qa

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_qa_from_sentences(sentences_json, topics, max_qa=25):
    """
    Extract Q&A pairs from clean sentences.
    """
    # Load sentences
    with open(sentences_json, 'r') as f:
        sentences = json.load(f)
    
    # Load spaCy
    nlp = spacy.load("en_core_web_sm")
    
    # Convert topics to lowercase for matching
    topics_lower = [t.lower() for t in topics]
    
    logger.info("="*60)
    logger.info("Q&A EXTRACTION FROM CLEAN SENTENCES")
    logger.info("="*60)
    logger.info(f"\n📄 INPUT:")
    logger.info(f"  Clean sentences: {len(sentences)}")
    logger.info(f"  Topics: {', '.join(topics)}")
    
    # Process sentences
    all_facts = []
    topic_matched = 0
    patterns_found = {
        'svo': 0,
        'passive': 0,
        'copular': 0,
        'dates': 0,
        'quantities': 0
    }
    
    for sent_obj in sentences:
        sent_text = sent_obj['text']
        
        # Check if sentence contains any topic
        has_topic = any(topic in sent_text.lower() for topic in topics_lower)
        
        if not has_topic:
            continue
            
        topic_matched += 1
        
        # Process with spaCy
        doc = nlp(sent_text)
        
        # Try each pattern type
        # SVO patterns
        for fact in find_svo(doc):
            patterns_found['svo'] += 1
            fact['sentence_id'] = sent_obj['id']
            fact['sentence'] = sent_text
            all_facts.append(fact)
        
        # Passive constructions
        for fact in find_passive_constructions(doc):
            patterns_found['passive'] += 1
            fact['sentence_id'] = sent_obj['id']
            fact['sentence'] = sent_text
            all_facts.append(fact)
        
        # Copular definitions
        for fact in find_copular_defs(doc):
            patterns_found['copular'] += 1
            fact['sentence_id'] = sent_obj['id']
            fact['sentence'] = sent_text
            all_facts.append(fact)
        
        # Release dates
        for fact in find_release_dates(doc):
            patterns_found['dates'] += 1
            fact['sentence_id'] = sent_obj['id']
            fact['sentence'] = sent_text
            all_facts.append(fact)
        
        # Quantities
        for fact in find_meaningful_quantities(doc):
            patterns_found['quantities'] += 1
            fact['sentence_id'] = sent_obj['id']
            fact['sentence'] = sent_text
            all_facts.append(fact)
    
    logger.info(f"\n🔍 PATTERN MATCHING:")
    logger.info(f"  Sentences with topics: {topic_matched}")
    logger.info(f"  Total patterns found: {len(all_facts)}")
    for pattern_type, count in patterns_found.items():
        if count > 0:
            logger.info(f"    {pattern_type}: {count}")
    
    # Generate Q&A pairs
    qa_pairs = []
    failed = 0
    
    for fact in all_facts[:max_qa*2]:  # Process more than needed
        qa = realize_qa(fact)
        if qa:
            qa['evidence_span'] = fact.get('sentence', '')
            qa_pairs.append(qa)
        else:
            failed += 1
    
    logger.info(f"\n✍️ Q&A REALIZATION:")
    logger.info(f"  Successfully created: {len(qa_pairs)}")
    logger.info(f"  Failed to create: {failed}")
    
    # Deduplicate
    seen_questions = set()
    unique_qa = []
    for qa in qa_pairs[:max_qa]:
        if qa['question'] not in seen_questions:
            seen_questions.add(qa['question'])
            unique_qa.append(qa)
    
    logger.info(f"\n🎯 FINAL OUTPUT:")
    logger.info(f"  Unique Q&A pairs: {len(unique_qa)}")
    
    # Display samples
    for i, qa in enumerate(unique_qa[:10], 1):
        logger.info(f"    {i}. Q: {qa['question']}")
        logger.info(f"       A: {qa['answer_short']}...")
    
    return unique_qa

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: qa_from_sentences.py <sentences_json> <topics_json> [max_qa]")
        sys.exit(1)
    
    sentences_json = sys.argv[1]
    topics_json = json.loads(sys.argv[2])
    max_qa = int(sys.argv[3]) if len(sys.argv) > 3 else 25
    
    # Extract Q&A
    qa_pairs = extract_qa_from_sentences(sentences_json, topics_json, max_qa)
    
    # Output as JSON
    output = {
        "status": "success",
        "total_extracted": len(qa_pairs),
        "qa_pairs": qa_pairs
    }
    
    print(json.dumps(output, indent=2))
