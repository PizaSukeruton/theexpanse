#!/usr/bin/env python3
"""
Classify sentences into complete and incomplete categories.
Save both for different processing strategies.
"""

import json
import sys
import spacy
import re

def classify_sentence(sent, sent_text):
    """
    Classify a sentence as complete or incomplete with reason.
    Returns: (is_complete, reason, score)
    """
    score = 100
    issues = []
    
    # Check 1: Has a verb?
    has_verb = any(token.pos_ == "VERB" for token in sent)
    if not has_verb:
        score -= 40
        issues.append("no_verb")
    
    # Check 2: Has a subject?
    has_subject = any(token.dep_ in ["nsubj", "nsubjpass", "expl"] for token in sent)
    if not has_subject:
        score -= 40
        issues.append("no_subject")
    
    # Check 3: Word count
    word_count = len(sent_text.split())
    if word_count < 3:
        score -= 30
        issues.append("too_short")
    elif word_count > 60:
        score -= 20
        issues.append("too_long")
    
    # Check 4: Ends with punctuation?
    if sent_text and not sent_text[-1] in '.!?':
        score -= 20
        issues.append("no_punctuation")
    
    # Check 5: Starts with capital letter?
    if sent_text and not sent_text[0].isupper() and not sent_text[0].isdigit():
        score -= 10
        issues.append("no_capital")
    
    # Determine if complete (score >= 60 means structurally complete)
    is_complete = score >= 60
    
    return is_complete, issues, score

def extract_and_classify(refined_json):
    """
    Extract all sentences and classify them.
    """
    
    # Load spaCy
    nlp = spacy.load("en_core_web_sm")
    
    # Load paragraphs
    with open(refined_json, 'r') as f:
        paragraphs = json.load(f)
    
    complete_sentences = []
    incomplete_sentences = []
    stats = {
        'total': 0,
        'complete': 0,
        'incomplete': 0,
        'issue_counts': {}
    }
    
    print("\n" + "="*60)
    print("SENTENCE CLASSIFICATION")
    print("="*60)
    
    for para_id, para in enumerate(paragraphs):
        # Split into sentences
        doc = nlp(para['text'])
        
        for sent_num, sent in enumerate(doc.sents):
            sent_text = sent.text.strip()
            if not sent_text:
                continue
            
            stats['total'] += 1
            
            # Classify
            is_complete, issues, score = classify_sentence(sent, sent_text)
            
            # Track issues
            for issue in issues:
                stats['issue_counts'][issue] = stats['issue_counts'].get(issue, 0) + 1
            
            # Create sentence object
            sent_obj = {
                'id': stats['total'] - 1,
                'text': sent_text,
                'para_id': para_id,
                'sent_num': sent_num,
                'word_count': len(sent_text.split()),
                'score': score,
                'issues': issues
            }
            
            # Add to appropriate list
            if is_complete:
                complete_sentences.append(sent_obj)
                stats['complete'] += 1
            else:
                incomplete_sentences.append(sent_obj)
                stats['incomplete'] += 1
    
    return complete_sentences, incomplete_sentences, stats

def display_results(complete, incomplete, stats):
    """
    Display classification results.
    """
    print(f"\n📊 CLASSIFICATION RESULTS:")
    print(f"  Total sentences: {stats['total']}")
    print(f"  Complete: {stats['complete']} ({stats['complete']*100/stats['total']:.1f}%)")
    print(f"  Incomplete: {stats['incomplete']} ({stats['incomplete']*100/stats['total']:.1f}%)")
    
    print(f"\n📝 COMMON ISSUES IN INCOMPLETE SENTENCES:")
    for issue, count in sorted(stats['issue_counts'].items(), key=lambda x: -x[1])[:5]:
        print(f"  {issue}: {count} occurrences")
    
    print(f"\n✅ SAMPLE COMPLETE SENTENCES:")
    for sent in complete[:3]:
        print(f"  [{sent['score']}] {sent['text'][:60]}...")
    
    print(f"\n❌ SAMPLE INCOMPLETE SENTENCES (might still have value!):")
    for sent in incomplete[:5]:
        print(f"  [{sent['score']}] Issues: {', '.join(sent['issues'])}")
        print(f"       Text: {sent['text'][:60]}...")

def save_classified(complete, incomplete, base_filename):
    """
    Save both categories to separate JSON files.
    """
    # Save complete sentences
    complete_file = base_filename.replace('.json', '_complete.json')
    with open(complete_file, 'w') as f:
        json.dump(complete, f, indent=2)
    
    # Save incomplete sentences
    incomplete_file = base_filename.replace('.json', '_incomplete.json')
    with open(incomplete_file, 'w') as f:
        json.dump(incomplete, f, indent=2)
    
    print(f"\n💾 SAVED FILES:")
    print(f"  Complete sentences: {complete_file} ({len(complete)} sentences)")
    print(f"  Incomplete sentences: {incomplete_file} ({len(incomplete)} fragments)")
    
    return complete_file, incomplete_file

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: classify_sentences.py <refined_json>")
        sys.exit(1)
    
    refined_json = sys.argv[1]
    
    # Extract and classify
    complete, incomplete, stats = extract_and_classify(refined_json)
    
    # Display results
    display_results(complete, incomplete, stats)
    
    # Save both categories
    complete_file, incomplete_file = save_classified(complete, incomplete, refined_json)
    
    print("\n" + "="*60)
    print("✅ CLASSIFICATION COMPLETE!")
    print("\nNext steps:")
    print("  1. Run Q&A extraction on complete sentences")
    print("  2. Analyze incomplete sentences for salvageable facts")
    print("="*60)
