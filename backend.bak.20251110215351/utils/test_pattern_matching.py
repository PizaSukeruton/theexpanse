#!/usr/bin/env python3
import spacy
import sys
sys.path.insert(0, '/Users/pizasukeruton/Desktop/theexpanse/backend/utils')
from qa_patterns import find_passive_constructions, find_svo

nlp = spacy.load("en_core_web_sm")

test_sentences = [
    "Created by Satoshi Tajiri",
    "The main idea behind Pokémon was conceived by Satoshi Tajiri",
    "Ishihara founded Creatures, Inc. on 8 November 1995",
    "Tajiri directed the project"
]

print("Testing pattern matching on Pokémon sentences:")
print("="*50)

for sent in test_sentences:
    doc = nlp(sent)
    print(f"\nSentence: '{sent}'")
    
    # Test SVO
    svo_matches = list(find_svo(doc))
    if svo_matches:
        print(f"  ✓ SVO match: {svo_matches[0]['verb'].text}")
    else:
        print(f"  ✗ No SVO match")
    
    # Test passive
    passive_matches = list(find_passive_constructions(doc))
    if passive_matches:
        print(f"  ✓ Passive match: {passive_matches[0]['verb'].text}")
    else:
        print(f"  ✗ No passive match")
    
    # Show dependency parse to understand why
    print(f"  Dependencies: {[(t.text, t.dep_, t.head.text) for t in doc]}")
