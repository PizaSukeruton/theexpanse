#!/usr/bin/env python3
import sys
sys.path.insert(0, '/Users/pizasukeruton/Desktop/theexpanse/backend/utils')

from qa_templates import realize_qa
import spacy

# Create a mock quantity fact to test
test_fact = {
    "type": "quantity_simple",
    "number_tok": type('obj', (), {'text': 'nine'}),
    "noun_head": type('obj', (), {'text': 'films'}),
    "noun_phrase": "All nine films,",  # With comma
    "doc": None
}

print("Testing quantity question generation:")
print(f"Input noun_phrase: '{test_fact['noun_phrase']}'")

result = realize_qa(test_fact)
if result:
    print(f"Generated question: '{result['question']}'")
    print(f"Subject surface: '{result.get('subject_surface', '')}'")
else:
    print("Failed to generate QA")

# Test another one
test_fact2 = {
    "type": "quantity_simple",
    "number_tok": type('obj', (), {'text': 'three'}),
    "noun_head": type('obj', (), {'text': 'releases'}),
    "noun_phrase": "the first three releases",  # No comma
    "doc": None
}

print("\nTest 2:")
print(f"Input noun_phrase: '{test_fact2['noun_phrase']}'")
result2 = realize_qa(test_fact2)
if result2:
    print(f"Generated question: '{result2['question']}'")
