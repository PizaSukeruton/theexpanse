#!/usr/bin/env python3
import re

# Read the current qa_templates.py
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'r') as f:
    content = f.read()

# Find the fix_quantity_question function
old_function = r'def fix_quantity_question\(noun_phrase, number_text\):.*?(?=\ndef |\nclass |\Z)'

# Use raw triple quotes to avoid escape issues
new_function = r"""def fix_quantity_question(noun_phrase, number_text):
    """r'''Fix grammatical issues in quantity questions.'''r"""
    # Remove trailing punctuation
    noun_phrase = re.sub(r'[,;:\.\!\?]+\s*$', '', noun_phrase)
    
    # Remove leading articles
    noun_phrase = re.sub(r'^(the|a|an)\s+', '', noun_phrase, flags=re.IGNORECASE)
    
    # Remove year references that aren't part of the noun
    noun_phrase = re.sub(r'\s*\d{4}\s*', '', noun_phrase)
    
    # Clean up any extra spaces
    noun_phrase = re.sub(r'\s+', ' ', noun_phrase).strip()
    
    # If noun phrase is now empty or too short, return None
    if not noun_phrase or len(noun_phrase) < 3:
        return None
    
    # Don't add 's' if already plural or special cases
    if not noun_phrase.endswith('s') and 'series' not in noun_phrase:
        # Simple pluralization (this could be enhanced)
        if noun_phrase.endswith('y') and not noun_phrase.endswith(('ay', 'ey', 'oy', 'uy')):
            noun_phrase = noun_phrase[:-1] + 'ies'
        elif noun_phrase.endswith(('s', 'x', 'z', 'ch', 'sh')):
            noun_phrase = noun_phrase + 'es'
        else:
            noun_phrase = noun_phrase + 's'
    
    return noun_phrase"""

# Escape backslashes in the new function
new_function_escaped = new_function.replace('\\', '\\\\').replace(r'"""r', '"""')

# Replace the function
content = re.sub(old_function, new_function_escaped, content, flags=re.DOTALL)

# Make sure we have re imported
if 'import re' not in content[:500]:
    # Add after other imports
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('from qa_utils'):
            lines.insert(i+1, 'import re')
            break
    content = '\n'.join(lines)

# Write back
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'w') as f:
    f.write(content)

print("✅ Fixed fix_quantity_question to remove trailing punctuation")
