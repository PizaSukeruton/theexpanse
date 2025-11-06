#!/usr/bin/env python3
import re
import json
import sys

def fix_fragments(text):
    """
    Fix sentence fragments by adding periods and structure.
    """
    # Add periods before "Created by", "Directed by", etc.
    patterns = [
        (r'(\w)\s+(Created by)', r'\1. \2'),
        (r'(\w)\s+(Directed by)', r'\1. \2'),
        (r'(\w)\s+(Written by)', r'\1. \2'),
        (r'(\w)\s+(Produced by)', r'\1. \2'),
        (r'(\w)\s+(Founded by)', r'\1. \2'),
        (r'(\w)\s+(Developed by)', r'\1. \2'),
        (r'(\w)\s+(Owned by)', r'\1. \2'),
        (r'(\w)\s+(Original)', r'\1. \2'),
        (r'(\d{4})\s+([A-Z])', r'\1. \2'),  # Add period after years
    ]
    
    result = text
    for pattern, replacement in patterns:
        result = re.sub(pattern, replacement, result)
    
    # Add "It was" before fragments starting with past participle
    if re.match(r'^(Created|Directed|Written|Founded|Developed|Produced)', result):
        result = 'It was ' + result.lower()
    
    return result

# Test it
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Process a refined JSON file
        with open(sys.argv[1], 'r') as f:
            data = json.load(f)
        
        fixed_data = []
        changes = 0
        for para in data:
            original = para['text']
            fixed = fix_fragments(original)
            if fixed != original:
                changes += 1
                print(f"Fixed: {original[:50]}... → {fixed[:50]}...")
            para['text'] = fixed
            fixed_data.append(para)
        
        output_file = sys.argv[1].replace('.json', '_fixed.json')
        with open(output_file, 'w') as f:
            json.dump(fixed_data, f, indent=2)
        
        print(f"\n✅ Fixed {changes} paragraphs")
        print(f"💾 Saved to {output_file}")
    else:
        # Test mode
        tests = [
            "International franchise logo, designed by Chris Maple in 1998 Created by Satoshi Tajiri Original work",
            "Created by Satoshi Tajiri",
            "Directed by George Lucas"
        ]
        
        for test in tests:
            fixed = fix_fragments(test)
            print(f"Original: {test}")
            print(f"Fixed:    {fixed}")
            print()
