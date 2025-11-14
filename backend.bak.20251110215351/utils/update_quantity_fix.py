#!/usr/bin/env python3
import re

# Read the current qa_patterns.py
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'r') as f:
    content = f.read()

# Find and replace the find_meaningful_quantities function
old_function = r'def find_meaningful_quantities\(doc\):.*?(?=\ndef |\nclass |\Z)'

new_function = '''def find_meaningful_quantities(doc):
    """Enhanced quantity finding with better noun phrase detection."""
    if not is_clean_sentence(doc.text):
        return []
    
    # Expanded generic noun blacklist
    GENERIC_BLACKLIST = {
        "item", "items", "thing", "things", "object", "objects",
        "entity", "entities", "element", "elements", "piece", "pieces",
        "part", "parts", "unit", "units", "section", "sections",
        "component", "components", "entry", "entries"
    }
    
    facts = []
    
    # Look for number + noun patterns more broadly
    for tok in doc:
        if tok.pos_ == "NUM":
            # Skip if this is a year (4 digits between 1900-2099)
            if re.match(r'^(19|20)\d{2}$', tok.text):
                continue  # Skip years
                
            # Check if next token is a noun
            if tok.i + 1 < len(doc):
                next_tok = doc[tok.i + 1]
                if next_tok.pos_ == "NOUN" and next_tok.text.lower() not in GENERIC_BLACKLIST:
                    # Check dependency: number should modify the noun
                    if tok.head == next_tok or tok in next_tok.children:
                        noun_phrase = np_text_with_modifiers(next_tok)
                        # Only if we have a meaningful phrase
                        if len(noun_phrase.split()) >= 2:
                            facts.append({
                                "type":"quantity_simple",
                                "number_tok": tok,
                                "noun_head": next_tok,
                                "noun_phrase": noun_phrase,
                                "doc": doc
                            })
    
    # Existential there patterns
    root = next((t for t in doc if t.dep_ == "ROOT"), None)
    if root and root.lemma_ == "be" and any(c.dep_ == "expl" and c.lower_ == "there" for c in root.children):
        nsubj = next((c for c in root.children if c.dep_ == "nsubj"), None)
        if nsubj:
            num = next((c for c in nsubj.children if c.dep_ == "nummod"), None)
            if num and (nsubj.tag_ in ("NNS","NNPS")):
                # Skip years here too
                if not re.match(r'^(19|20)\d{2}$', num.text):
                    noun_text = nsubj.text.lower()
                    if noun_text not in GENERIC_BLACKLIST:
                        facts.append({
                            "type":"quantity_existential",
                            "number_tok": num,
                            "noun_head": nsubj,
                            "doc": doc
                        })
    
    return facts'''

# Replace the function
content = re.sub(old_function, new_function, content, flags=re.DOTALL)

# Add re import at the top if not already there
if 'import re' not in content:
    content = 'import re\n' + content

# Write back
with open('/Users/pizasukeruton/Desktop/theexpanse/backend/utils/qa_patterns.py', 'w') as f:
    f.write(content)

print("✅ Updated find_meaningful_quantities in qa_patterns.py")
