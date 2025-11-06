#!/usr/bin/env python3

# Read the file
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'r') as f:
    lines = f.readlines()

# Find and fix the broken docstring
fixed_lines = []
for i, line in enumerate(lines):
    if 'Fix grammatical issues in quantity questions.' in line and '"""' not in line:
        # This is the broken line - wrap it properly
        fixed_lines.append('    """Fix grammatical issues in quantity questions."""\n')
    else:
        fixed_lines.append(line)

# Write back
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'w') as f:
    f.writelines(fixed_lines)

print("✅ Fixed docstring syntax in qa_templates.py")
