#!/usr/bin/env python3

# Read qa_templates.py and show lines around 330-340
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'r') as f:
    lines = f.readlines()

print("Lines 330-340 of qa_templates.py:")
print("="*50)
for i in range(329, min(340, len(lines))):
    print(f"{i+1}: {lines[i].rstrip()}")
