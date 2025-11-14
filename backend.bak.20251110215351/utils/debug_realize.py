#!/usr/bin/env python3
import sys
sys.path.insert(0, '/Users/pizasukeruton/Desktop/theexpanse/backend/utils')

# Check the realize_qa function for quantity_simple
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'r') as f:
    content = f.read()
    
# Find the quantity_simple handling
import re
match = re.search(r'if fact_type == "quantity_simple":(.*?)(?=\n    if fact_type ==|\n    return|\Z)', content, re.DOTALL)
if match:
    print("Found quantity_simple handler:")
    print(match.group(0)[:500])
else:
    print("Could not find quantity_simple handler")
    
# Look for where fix_quantity_question is called
if 'fix_quantity_question' in content:
    print("\n\nfix_quantity_question is mentioned in the file")
    # Find all occurrences
    for i, line in enumerate(content.split('\n')):
        if 'fix_quantity_question' in line:
            print(f"Line {i+1}: {line.strip()}")
else:
    print("\n\nfix_quantity_question is NOT being called!")
