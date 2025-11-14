#!/usr/bin/env python3
"""
Simple sentence filter - STRUCTURE ONLY.
Keep complete sentences, discard fragments and noise.
"""

import json
import sys
import spacy
import re

def is_complete_sentence(sent, sent_text):
    """
    Check if this is a structurally complete sentence.
    No intent checking, just grammar structure.
    """
    # Must have a verb
    has_verb = any(token.pos_ == "VERB" for token in sent)
    if not has_verb:
        return False, "no_verb"
    
    # Must have a subject (something doing the verb)
    has_subject = any(token.dep_ in ["nsubj", "nsubjpass"] for token in sent)
    if not has_subject:
        return False, "no_subject"
    
    # Word count check (not too short, not too long)
    word_count = len(sent_text.split())
    if word_count < 5:
        return False, "too_short"
    if word_count > 50:
        return False, "too_long"
    
    # Check for sentence ending punctuation
    if not sent_text[-1] in '.!?':
        return False, "no_punctuation"
    
    # That's it! It's a complete sentence structurally
    return True, "complete"

def extract_clean_sentences(refined_json):
    """
    Extract only structurally complete sentences.
    """
    
    # Load spaCy
    nlp = spacy.load("en_core_web_sm")
    
    # Load paragraphs
    with open(refined_json, 'r') as f:
        paragraphs = json.load(f)
    
    all_sentences = []
    complete_sentences = []
    discarded_count = 0
    
    print("\n" + "="*60)
    print("EXTRACTING STRUCTURALLY COMPLETE SENTENCES")
    print("="*60)
    
    for para_id, para in enumerate(paragraphs):
        # Split into sentences
        doc = nlp(para['text'])
        
        for sent in doc.sents:
            sent_text = sent.text.strip()
            all_sentences.append(sent_text)
            
            # Check if complete
            is_complete, reason = is_complete_sentence(sent, sent_text)
            
            if is_complete:
                complete_sentences.append({
                    'id': len(complete_sentences),
                    'text': sent_text,
                    'para_id': para_id,
                    'word_count': len(sent_text.split())
                })
            else:
                discarded_count += 1
                if discarded_count <= 5:  # Show first 5 discards as examples
                    print(f"❌ Discarded ({reason}): {sent_text[:50]}...")
    
    print(f"\n📊 RESULTS:")
    print(f"  Total sentences found: {len(all_sentences)}")
    print(f"  Complete sentences kept: {len(complete_sentences)}")
    print(f"  Fragments discarded: {discarded_count}")
    print(f"  Retention rate: {len(complete_sentences)*100/len(all_sentences):.1f}%")
    
    print(f"\n✅ SAMPLE COMPLETE SENTENCES:")
    for i, sent in enumerate(complete_sentences[:5], 1):
        print(f"{i}. {sent['text'][:80]}...")
    
    return complete_sentences

def save_clean_sentences(sentences, output_file):
    """
    Save the clean sentences to JSON.
    """
    with open(output_file, 'w') as f:
        json.dump(sentences, f, indent=2)
    
    print(f"\n💾 Saved {len(sentences)} complete sentences to {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: simple_sentence_filter.py <refined_json>")
        sys.exit(1)
    
    refined_json = sys.argv[1]
    
    # Extract complete sentences only
    complete_sentences = extract_clean_sentences(refined_json)
    
    # Save them
    output_file = refined_json.replace('.json', '_clean_sentences.json')
    save_clean_sentences(complete_sentences, output_file)
    
    print("\n" + "="*60)
    print("✅ SENTENCE FILTERING COMPLETE!")
    print("Next step: Run pattern detection on these clean sentences")
    print("="*60)
