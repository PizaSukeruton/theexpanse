#!/usr/bin/env python3

# Read the current qa_patterns.py
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'r') as f:
    lines = f.readlines()

# Check if import re is really there and at the right place
has_re_import = False
import_line_idx = -1

for i, line in enumerate(lines):
    if 'import re' in line and not line.strip().startswith('#'):
        has_re_import = True
        import_line_idx = i
        print(f"Found 'import re' at line {i+1}: {line.strip()}")

if not has_re_import:
    # Add import re right after the first import statement
    for i, line in enumerate(lines):
        if line.startswith(('import ', 'from ')):
            lines.insert(i+1, 'import re\n')
            print(f"Added 'import re' at line {i+2}")
            break
    else:
        # If no imports found, add at the beginning
        lines.insert(0, 'import re\n')
        print("Added 'import re' at the beginning")
    
    # Write back
    with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'w') as f:
        f.writelines(lines)
    print("✅ File updated")
else:
    print(f"⚠️ 'import re' exists but still causing error")
    # Maybe the regex pattern itself has issues, let's check
    
# Show first 10 lines of the file
print("\nFirst 10 lines of qa_patterns.py:")
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'r') as f:
    for i, line in enumerate(f):
        if i >= 10:
            break
        print(f"{i+1}: {line.rstrip()}")
