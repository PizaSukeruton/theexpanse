#!/usr/bin/env python3
"""
Analyze the complete pipeline performance
"""
import json

print("\n" + "="*60)
print("🎯 COMPLETE PIPELINE ANALYSIS")
print("="*60)

# Load the Q&A results
with open('pokemon_qa.json', 'r') as f:
    qa_data = json.load(f)

qa_pairs = qa_data.get('qa_pairs', [])

print(f"\n📊 EXTRACTION STATS:")
print(f"  Total Q&A pairs: {len(qa_pairs)}")

# Analyze question types
question_types = {}
for qa in qa_pairs:
    q_type = qa.get('question_type', 'unknown')
    question_types[q_type] = question_types.get(q_type, 0) + 1

print(f"\n❓ QUESTION TYPES:")
for q_type, count in sorted(question_types.items(), key=lambda x: -x[1]):
    print(f"  {q_type}: {count}")

# Look for key facts
print(f"\n✅ KEY FACTS FOUND:")
key_facts = [
    ("Tajiri created/conceived", any("Tajiri" in qa['answer_short'] for qa in qa_pairs)),
    ("Pokémon definition found", any("Pocket Monsters" in qa.get('answer_short', '') for qa in qa_pairs)),
    ("Company founding facts", any("founded" in qa.get('question', '') for qa in qa_pairs)),
    ("Game Freak mentioned", any("Game Freak" in str(qa) for qa in qa_pairs))
]

for fact, found in key_facts:
    status = "✓" if found else "✗"
    print(f"  {status} {fact}")

# Show best Q&As
print(f"\n🌟 BEST Q&A PAIRS (about key topics):")
best_qa = [
    qa for qa in qa_pairs 
    if any(word in qa['question'].lower() for word in ['conceived', 'created', 'founded', 'original'])
]

for qa in best_qa[:5]:
    print(f"\n  Q: {qa['question']}")
    print(f"  A: {qa['answer_short'][:50]}...")

print("\n" + "="*60)
