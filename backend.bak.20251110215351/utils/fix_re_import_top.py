#!/usr/bin/env python3

# Read the current qa_patterns.py
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'r') as f:
    content = f.read()

# Remove any existing 'import re' lines
lines = content.split('\n')
cleaned_lines = []
for line in lines:
    if not (line.strip() == 'import re' or line.strip().startswith('import re ')):
        cleaned_lines.append(line)

# Rebuild content
content = '\n'.join(cleaned_lines)

# Add 'import re' at the top, after the first group of imports
lines = content.split('\n')
inserted = False
for i, line in enumerate(lines):
    if i > 0 and line.startswith('from '):
        # Insert before the from imports
        lines.insert(i, 'import re')
        inserted = True
        break

if not inserted:
    # Just add after line 1
    lines.insert(1, 'import re')

# Write back
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'w') as f:
    f.write('\n'.join(lines))

print("✅ Moved 'import re' to the top of qa_patterns.py")

# Verify
print("\nFirst 10 lines now:")
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'r') as f:
    for i, line in enumerate(f):
        if i >= 10:
            break
        print(f"{i+1}: {line.rstrip()}")
