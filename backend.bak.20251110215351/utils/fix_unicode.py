#!/usr/bin/env python3
import json
import sys

# Read the Q&A JSON file
with open(sys.argv[1], 'r') as f:
    data = json.load(f)

# Re-save with ensure_ascii=False to preserve Unicode
output_file = sys.argv[1].replace('.json', '_unicode_fixed.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"✅ Fixed Unicode in {output_file}")

# Display a sample
if data.get('qa_pairs'):
    print("\nSample fixed Q&As:")
    for qa in data['qa_pairs'][:3]:
        print(f"Q: {qa['question']}")
        print(f"A: {qa['answer_short']}\n")
