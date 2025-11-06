#!/usr/bin/env python3
import sys
import json
import spacy
import logging
from qa_patterns import (
    find_copular_defs, find_svo, find_passive_ownership, 
    find_release_dates, find_meaningful_quantities,
    find_passive_constructions, find_appositive_patterns
)
from qa_templates import realize_qa
from qa_filters import quality_pipeline, deduplicate_and_rank, QualityStats
from qa_utils import make_phrase_matcher, sentence_matches_topics_batch

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_qa_from_refined_paragraphs(refined_json_path, selected_topics, limit=25):
    """
    Extract QA pairs directly from refined paragraphs.
    
    Args:
        refined_json_path: Path to refined paragraphs JSON
        selected_topics: List of topics to focus on  
        limit: Maximum QA pairs to return
    
    Returns:
        List of QA pairs
    """
    stats = QualityStats()
    
    logger.info("="*80)
    logger.info("Q&A EXTRACTION FROM REFINED PARAGRAPHS")
    logger.info("="*80)
    
    # Load refined paragraphs
    with open(refined_json_path, 'r') as f:
        refined_paragraphs = json.load(f)
    
    logger.info(f"\n📄 INPUT:")
    logger.info(f"  Refined paragraphs: {len(refined_paragraphs)}")
    logger.info(f"  Topics: {', '.join(selected_topics)}")
    
    # Load spaCy
    nlp = spacy.load("en_core_web_sm")
    
    # Create topic matchers
    matchers = make_phrase_matcher(nlp.vocab, selected_topics)
    
    # Process each paragraph
    all_survivors = []
    pattern_counts = {
        "copular_defs": 0,
        "svo": 0,
        "passive_constructions": 0,
        "appositive": 0,
        "passive_ownership": 0,
        "release_dates": 0,
        "quantities": 0
    }
    
    paragraphs_processed = 0
    paragraphs_with_matches = 0
    
    for para in refined_paragraphs:
        text = para['text']
        
        # Check if paragraph contains topics
        doc = nlp(text)
        
        # Check topic relevance
        if not sentence_matches_topics_batch([doc], matchers)[0]:
            continue
        
        paragraphs_processed += 1
        para_had_matches = False
        
        # Extract patterns from this paragraph
        copular = list(find_copular_defs(doc))
        svo = list(find_svo(doc))
        passive_const = list(find_passive_constructions(doc))
        appos = list(find_appositive_patterns(doc))
        ownership = list(find_passive_ownership(doc))
        dates = list(find_release_dates(doc))
        quants = find_meaningful_quantities(doc)
        
        # Update counts
        if copular or svo or passive_const or appos or ownership or dates or quants:
            para_had_matches = True
            paragraphs_with_matches += 1
        
        pattern_counts["copular_defs"] += len(copular)
        pattern_counts["svo"] += len(svo)
        pattern_counts["passive_constructions"] += len(passive_const)
        pattern_counts["appositive"] += len(appos)
        pattern_counts["passive_ownership"] += len(ownership)
        pattern_counts["release_dates"] += len(dates)
        pattern_counts["quantities"] += len(quants)
        
        # Add all to survivors
        all_survivors.extend(copular)
        all_survivors.extend(svo)
        all_survivors.extend(passive_const)
        all_survivors.extend(appos)
        all_survivors.extend(ownership)
        all_survivors.extend(dates)
        all_survivors.extend(quants)
    
    logger.info(f"\n🔍 PATTERN MATCHING:")
    logger.info(f"  Paragraphs processed: {paragraphs_processed}")
    logger.info(f"  Paragraphs with matches: {paragraphs_with_matches}")
    for pattern, count in pattern_counts.items():
        if count > 0:
            logger.info(f"  {pattern}: {count}")
    logger.info(f"  TOTAL MATCHES: {len(all_survivors)}")
    
    # Realize QA pairs
    qa_pairs = []
    failed_realizations = []
    
    for fact in all_survivors:
        try:
            qa = realize_qa(fact)
            if qa is None:
                failed_realizations.append(fact.get("type"))
                continue
            qa_pairs.append(qa)
        except Exception as e:
            logger.error(f"Failed to realize {fact.get('type')}: {e}")
            failed_realizations.append(f"{fact.get('type')}: {str(e)}")
    
    logger.info(f"\n✍️  Q&A REALIZATION:")
    logger.info(f"  Successfully created: {len(qa_pairs)}")
    logger.info(f"  Failed to create: {len(failed_realizations)}")
    
    # Quality filtering
    quality_passed = []
    
    for qa in qa_pairs:
        ok, reason = quality_pipeline(qa, stats)
        if ok:
            quality_passed.append(qa)
    
    logger.info(f"\n✅ QUALITY FILTERING:")
    logger.info(f"  Total candidates: {len(qa_pairs)}")
    logger.info(f"  Passed: {len(quality_passed)}")
    logger.info(f"  Failed: {len(qa_pairs) - len(quality_passed)}")
    
    # Deduplicate and rank
    final_pairs = deduplicate_and_rank(quality_passed, target=limit)
    
    logger.info(f"\n🎯 FINAL OUTPUT:")
    logger.info(f"  After deduplication: {len(final_pairs)}")
    logger.info(f"  Final Q&A pairs:")
    for i, qa in enumerate(final_pairs, 1):
        logger.info(f"    {i}. Q: {qa['question']}")
        logger.info(f"       A: {qa['answer_short'][:60]}...")
    
    logger.info("\n" + "="*80 + "\n")
    
    return final_pairs

def main():
    if len(sys.argv) < 3:
        print("Usage: qa_from_refined.py <refined_json> '<topics_json>' [limit]")
        sys.exit(1)
    
    refined_json = sys.argv[1]
    topics = json.loads(sys.argv[2])
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 25
    
    qa_pairs = extract_qa_from_refined_paragraphs(refined_json, topics, limit)
    
    result = {
        "status": "success",
        "total_extracted": len(qa_pairs),
        "qa_pairs": qa_pairs
    }
    
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
