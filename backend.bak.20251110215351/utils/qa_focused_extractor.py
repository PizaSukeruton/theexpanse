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
from pdf_sentence_extractor import extract_sentences_from_pdf, validate_sentences

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_page_selection(selection_str, total_pages):
    """
    Parse page selection string (1-indexed) into 0-indexed page list.
    
    Examples:
        "all" -> [0, 1, 2, ..., total_pages-1]
        "1-3" -> [0, 1, 2]
        "1,3,5" -> [0, 2, 4]
        "1-3,5,7-9" -> [0, 1, 2, 4, 6, 7, 8]
    
    Args:
        selection_str: User-provided 1-indexed page selection
        total_pages: Total number of pages in document
    
    Returns:
        List of 0-indexed page numbers
    """
    pages = set()
    
    if selection_str.lower() == "all":
        return list(range(total_pages))
    
    parts = selection_str.split(',')
    for part in parts:
        part = part.strip()
        if '-' in part:
            start, end = part.split('-')
            start = int(start.strip()) - 1  # Convert to 0-indexed
            end = int(end.strip())
            pages.update(range(start, end))
        else:
            pages.add(int(part) - 1)  # Convert to 0-indexed
    
    return sorted(list(pages))

def extract_qa_focused(pdf_path, selected_topics, page_selection="all", limit=25, max_sentences=None):
    """
    Extract QA pairs from PDF with topic focusing.
    
    Args:
        pdf_path: Path to PDF file
        selected_topics: List of topics to focus on
        page_selection: Page selection string (default "all")
        limit: Maximum QA pairs to return (default 25)
        max_sentences: Maximum sentences to process after topic filtering (default None = all)
    
    Returns:
        List of QA pairs
    """
    # Thread-safe statistics tracking
    stats = QualityStats()
    
    logger.info("="*80)
    logger.info("Q&A EXTRACTION - OPTIMIZED IMPLEMENTATION")
    logger.info("="*80)
    
    # Load spaCy with better pipeline
    nlp = spacy.load("en_core_web_sm")
    
    # Ensure we have POS tagging for better lemmatization
    if "tagger" not in nlp.pipe_names:
        logger.warning("Adding tagger to pipeline for better POS annotation")
        nlp.add_pipe("tagger")
    
    import fitz
    with fitz.open(pdf_path) as doc:
        total_pages = len(doc)
    
    pages_to_process = parse_page_selection(page_selection, total_pages)
    
    logger.info(f"\n📄 PDF EXTRACTION:")
    logger.info(f"  Total pages in PDF: {total_pages}")
    logger.info(f"  Pages to process: {len(pages_to_process)}")
    logger.info(f"  Page numbers: {[p+1 for p in pages_to_process[:10]]}")
    
    sentences = extract_sentences_from_pdf(pdf_path, pages_to_process)
    validation = validate_sentences(sentences)
    
    logger.info(f"\n📝 SENTENCE EXTRACTION:")
    logger.info(f"  Total sentences: {validation['count']}")
    logger.info(f"  Average length: {validation['avg_len']} chars")
    logger.info(f"  End with punctuation: {validation['end_punct_rate']*100:.1f}%")
    logger.info(f"  Start with capital: {validation['capital_rate']*100:.1f}%")
    logger.info(f"  Residual bad lines: {validation['residual_bad']}")
    logger.info(f"  First 3 clean sentences:")
    for i, sent in enumerate(sentences[:3], 1):
        logger.info(f"    {i}. {sent[:120]}...")
    
    matchers = make_phrase_matcher(nlp.vocab, selected_topics)
    
    # OPTIMIZED: Batch process sentences for topic matching
    logger.info(f"\n🎯 TOPIC FILTERING:")
    logger.info(f"  Selected topics: {', '.join(selected_topics)}")
    logger.info(f"  Processing sentences in batches...")
    
    # Batch topic matching with pre-processed docs
    focused_sentences = []
    batch_size = 100
    
    for i in range(0, len(sentences), batch_size):
        batch = sentences[i:i+batch_size]
        docs = list(nlp.pipe(batch, batch_size=50))
        matches = sentence_matches_topics_batch(docs, matchers)
        
        for sent, matched in zip(batch, matches):
            if matched:
                focused_sentences.append(sent)
    
    logger.info(f"  Sentences before: {len(sentences)}")
    logger.info(f"  Sentences after: {len(focused_sentences)}")
    logger.info(f"  Match rate: {len(focused_sentences)/max(len(sentences),1)*100:.1f}%")
    
    # Configurable sentence limit with warning
    if max_sentences is None:
        max_sentences = 500  # Default
    
    if len(focused_sentences) > max_sentences:
        logger.warning(f"  ⚠️  Truncating from {len(focused_sentences)} to {max_sentences} sentences")
        focused_sentences = focused_sentences[:max_sentences]
    
    logger.info(f"  Processing {len(focused_sentences)} sentences")
    logger.info(f"  Sample focused sentences:")
    for i, sent in enumerate(focused_sentences[:5], 1):
        logger.info(f"    {i}. {sent[:120]}...")
    
    # OPTIMIZED: Stream processing instead of creating full list
    pattern_counts = {
        "copular_defs": 0,
        "svo": 0,
        "passive_constructions": 0,
        "appositive": 0,
        "passive_ownership": 0,
        "release_dates": 0,
        "quantities": 0
    }
    
    survivors = []
    pattern_examples = {}
    
    # Process in batches to control memory
    for i in range(0, len(focused_sentences), 50):
        batch = focused_sentences[i:i+50]
        docs = nlp.pipe(batch, batch_size=50)
        
        for doc in docs:
            # Extract all pattern types
            copular = list(find_copular_defs(doc))
            svo = list(find_svo(doc))
            passive_const = list(find_passive_constructions(doc))
            appos = list(find_appositive_patterns(doc))
            ownership = list(find_passive_ownership(doc))
            dates = list(find_release_dates(doc))
            quants = find_meaningful_quantities(doc)
            
            # Update counts
            pattern_counts["copular_defs"] += len(copular)
            pattern_counts["svo"] += len(svo)
            pattern_counts["passive_constructions"] += len(passive_const)
            pattern_counts["appositive"] += len(appos)
            pattern_counts["passive_ownership"] += len(ownership)
            pattern_counts["release_dates"] += len(dates)
            pattern_counts["quantities"] += len(quants)
            
            # Store examples for logging
            if copular and "copular_defs" not in pattern_examples:
                pattern_examples["copular_defs"] = {
                    "text": doc.text[:150],
                    "subject": copular[0].get("subject_full"),
                    "attribute": copular[0].get("attribute_full")
                }
            
            if svo and "svo" not in pattern_examples:
                pattern_examples["svo"] = {
                    "text": doc.text[:150],
                    "subject": svo[0].get("subject_full"),
                    "verb": svo[0].get("verb").text,
                    "object": svo[0].get("object_full")
                }
            
            if passive_const and "passive_constructions" not in pattern_examples:
                pattern_examples["passive_constructions"] = {
                    "text": doc.text[:150],
                    "subject": passive_const[0].get("subject_full"),
                    "agent": passive_const[0].get("agent")
                }
            
            if appos and "appositive" not in pattern_examples:
                pattern_examples["appositive"] = {
                    "text": doc.text[:150],
                    "subject": appos[0].get("subject_full"),
                    "description": appos[0].get("description_full")
                }
            
            if dates and "dates" not in pattern_examples:
                pattern_examples["dates"] = {
                    "text": doc.text[:150],
                    "subject": dates[0].get("subject_full"),
                    "date": dates[0].get("time_text", "N/A")
                }
            
            if quants and "quantities" not in pattern_examples:
                pattern_examples["quantities"] = {
                    "text": doc.text[:150],
                    "number": quants[0].get("number_tok").text if quants[0].get("number_tok") else None,
                    "noun": quants[0].get("noun_head").text if quants[0].get("noun_head") else None
                }
            
            # Add all found patterns to survivors
            survivors.extend(copular)
            survivors.extend(svo)
            survivors.extend(passive_const)
            survivors.extend(appos)
            survivors.extend(ownership)
            survivors.extend(dates)
            survivors.extend(quants)
    
    logger.info(f"\n🔍 PATTERN MATCHING:")
    logger.info(f"  Copular definitions: {pattern_counts['copular_defs']}")
    if "copular_defs" in pattern_examples:
        ex = pattern_examples["copular_defs"]
        logger.info(f"    '{ex['subject']}' is '{ex['attribute'][:50]}...'")
    
    logger.info(f"  SVO patterns: {pattern_counts['svo']}")
    if "svo" in pattern_examples:
        ex = pattern_examples["svo"]
        logger.info(f"    '{ex['subject']}' {ex['verb']} '{ex['object']}'")
    
    logger.info(f"  Passive constructions: {pattern_counts['passive_constructions']}")
    if "passive_constructions" in pattern_examples:
        ex = pattern_examples["passive_constructions"]
        logger.info(f"    '{ex['subject']}' by '{ex['agent']}'")
    
    logger.info(f"  Appositive patterns: {pattern_counts['appositive']}")
    if "appositive" in pattern_examples:
        ex = pattern_examples["appositive"]
        logger.info(f"    '{ex['subject']}' is '{ex['description'][:30]}...'")
    
    logger.info(f"  Ownership: {pattern_counts['passive_ownership']}")
    logger.info(f"  Release dates: {pattern_counts['release_dates']}")
    if "dates" in pattern_examples:
        ex = pattern_examples["dates"]
        logger.info(f"    '{ex['subject']}' in '{ex['date']}'")
    
    logger.info(f"  Quantities: {pattern_counts['quantities']}")
    if "quantities" in pattern_examples:
        ex = pattern_examples["quantities"]
        logger.info(f"    {ex['number']} {ex['noun']}")
    
    logger.info(f"  TOTAL MATCHES: {len(survivors)}")
    
    qa_pairs = []
    failed_realizations = []
    
    for fact in survivors:
        try:
            qa = realize_qa(fact)
            if qa is None:
                failed_realizations.append(fact.get("type"))
                continue
            qa_pairs.append(qa)
        except Exception as e:
            logger.error(f"Failed to realize {fact.get('type')}: {e}", exc_info=True)
            failed_realizations.append(f"{fact.get('type')}: {str(e)}")
    
    logger.info(f"\n✍️  Q&A REALIZATION:")
    logger.info(f"  Successfully created: {len(qa_pairs)}")
    logger.info(f"  Failed to create: {len(failed_realizations)}")
    if failed_realizations:
        failure_summary = {}
        for f in failed_realizations:
            failure_summary[f] = failure_summary.get(f, 0) + 1
        logger.info(f"  Failure breakdown:")
        for reason, count in sorted(failure_summary.items(), key=lambda x: -x[1]):
            logger.info(f"    {reason}: {count}")
    
    quality_passed = []
    
    for qa in qa_pairs:
        ok, reason = quality_pipeline(qa, stats)
        if ok:
            quality_passed.append(qa)
    
    logger.info(f"\n✅ QUALITY FILTERING:")
    logger.info(f"  Total candidates: {len(qa_pairs)}")
    logger.info(f"  Passed: {len(quality_passed)}")
    logger.info(f"  Failed: {len(qa_pairs) - len(quality_passed)}")
    
    stats.dump_stats(max_per_reason=2)
    
    final_pairs = deduplicate_and_rank(quality_passed, target=limit)
    
    logger.info(f"\n🎯 FINAL OUTPUT:")
    logger.info(f"  After deduplication: {len(final_pairs)}")
    logger.info(f"  Final Q&A pairs:")
    for i, qa in enumerate(final_pairs, 1):
        logger.info(f"    {i}. Q: {qa['question']}")
        logger.info(f"       A: {qa['answer_short'][:60]}...")
    
    logger.info("\n" + "="*80 + "\n")
    
    return final_pairs

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "PDF path and topics required"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    topics_json = sys.argv[2]
    page_selection = sys.argv[3] if len(sys.argv) > 3 else "all"
    limit = int(sys.argv[4]) if len(sys.argv) > 4 else 25
    
    try:
        selected_topics = json.loads(topics_json)
        qa_pairs = extract_qa_focused(pdf_path, selected_topics, page_selection, limit)
        
        result = {
            "status": "success",
            "total_extracted": len(qa_pairs),
            "qa_pairs": qa_pairs
        }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        logger.error(f"Extraction failed: {e}", exc_info=True)
        print(json.dumps({"status": "error", "error": str(e)}), file=sys.stderr)
        sys.exit(1)
