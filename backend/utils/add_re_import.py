#!/usr/bin/env python3

# Read the current qa_patterns.py
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'r') as f:
    content = f.read()

# Check if 'import re' is already there
if 'import re' not in content:
    # Add it after the other imports
    lines = content.split('\n')
    
    # Find where to insert (after other imports)
    insert_pos = 0
    for i, line in enumerate(lines):
        if line.startswith('import ') or line.startswith('from '):
            insert_pos = i + 1
        elif insert_pos > 0 and not line.startswith(('import', 'from')):
            break
    
    # Insert the import
    lines.insert(insert_pos, 'import re')
    content = '\n'.join(lines)
    
    # Write back
    with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'w') as f:
        f.write(content)
    
    print("✅ Added 'import re' to qa_patterns.py")
else:
    print("✅ 'import re' already exists in qa_patterns.py")
