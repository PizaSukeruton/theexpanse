#!/usr/bin/env python3

# Read qa_templates.py and show lines around 320
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'r') as f:
    lines = f.readlines()

# Show lines 310-330 to see the context
print("Lines 310-330 of qa_templates.py:")
print("="*50)
for i in range(309, min(330, len(lines))):
    print(f"{i+1}: {lines[i].rstrip()}")
