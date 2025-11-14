#!/usr/bin/env python3

# Read qa_templates.py
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'r') as f:
    content = f.read()

# Replace line 338 - change noun_phrase to fixed_noun for subject_surface
content = content.replace(
    '"subject_surface": noun_phrase,',
    '"subject_surface": fixed_noun,'
)

# Write back
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_templates.py', 'w') as f:
    f.write(content)

print("✅ Fixed subject_surface to use fixed_noun instead of noun_phrase")
