#!/usr/bin/env python3
import re

# Read the current qa_utils.py
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_utils.py', 'r') as f:
    content = f.read()

# Find and replace the np_text_with_modifiers function
old_function_pattern = r'def np_text_with_modifiers\(head\):.*?(?=\ndef |\nclass |\Z)'

new_function = '''def np_text_with_modifiers(head):
    """
    Fixed version that properly preserves word boundaries and spaces.
    """
    import string
    
    # Get all tokens in the subtree
    tokens = list(head.subtree)
    
    # Add conjuncts if any
    for conj in head.conjuncts:
        tokens.extend(conj.subtree)
    
    if not tokens:
        return head.text
    
    # Sort by position
    tokens = sorted(set(tokens), key=lambda t: t.i)
    
    # Get the span from first to last token
    if tokens:
        start_idx = tokens[0].i
        end_idx = tokens[-1].i + 1
        
        # Get the span from the doc
        span = head.doc[start_idx:end_idx]
        
        # Return the text of the span (spacy handles spacing)
        return span.text
    
    return head.text'''

# Replace the function
content_updated = re.sub(old_function_pattern, new_function, content, flags=re.DOTALL)

# Write back
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_utils.py', 'w') as f:
    f.write(content_updated)

print("✅ Updated np_text_with_modifiers in qa_utils.py")
