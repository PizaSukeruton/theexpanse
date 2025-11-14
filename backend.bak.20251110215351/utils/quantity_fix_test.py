import spacy
from qa_utils import is_clean_sentence, np_text_with_modifiers
import re

def find_meaningful_quantities_fixed(doc):
    """
    Fixed to avoid matching years as quantities.
    """
    if not is_clean_sentence(doc.text):
        return []
    
    GENERIC_BLACKLIST = {
        "item", "items", "thing", "things", "object", "objects",
        "entity", "entities", "element", "elements", "piece", "pieces",
        "part", "parts", "unit", "units", "section", "sections",
        "component", "components", "entry", "entries"
    }
    
    facts = []
    
    for tok in doc:
        if tok.pos_ == "NUM":
            # Skip if this is a year (4 digits between 1900-2099)
            if re.match(r'^(19|20)\d{2}$', tok.text):
                print(f"  Skipping year: {tok.text}")
                continue
            
            # Check if next token is a noun
            if tok.i + 1 < len(doc):
                next_tok = doc[tok.i + 1]
                if next_tok.pos_ == "NOUN" and next_tok.text.lower() not in GENERIC_BLACKLIST:
                    # Check dependency: number should modify the noun
                    if tok.head == next_tok or tok in next_tok.children:
                        noun_phrase = np_text_with_modifiers(next_tok)
                        
                        # Only if we have a meaningful phrase
                        if len(noun_phrase.split()) >= 2:
                            print(f"  Found quantity: {tok.text} {noun_phrase}")
                            facts.append({
                                "type": "quantity_simple",
                                "number_tok": tok,
                                "noun_head": next_tok,
                                "noun_phrase": noun_phrase,
                                "doc": doc
                            })
    
    return facts

# Test it
nlp = spacy.load("en_core_web_sm")

print("TEST 1: Should NOT extract year as quantity")
test1 = "The original 1977 film was groundbreaking."
doc1 = nlp(test1)
results1 = find_meaningful_quantities_fixed(doc1)
print(f"Result: {len(results1)} quantities found")
print(f"✅ PASS" if len(results1) == 0 else f"❌ FAIL - should find 0 quantities")

print("\nTEST 2: Should extract real quantities")
test2 = "All nine films were successful."
doc2 = nlp(test2)
results2 = find_meaningful_quantities_fixed(doc2)
print(f"Result: {len(results2)} quantities found")
if results2:
    print(f"  Number: {results2[0]['number_tok'].text}")
    print(f"  Noun: {results2[0]['noun_phrase']}")
print(f"✅ PASS" if len(results2) == 1 else f"❌ FAIL - should find 1 quantity")

print("\nTEST 3: Mixed years and quantities")
test3 = "The 1977 film had three sequels by 2019."
doc3 = nlp(test3)
results3 = find_meaningful_quantities_fixed(doc3)
print(f"Result: {len(results3)} quantities found")
if results3:
    for r in results3:
        print(f"  {r['number_tok'].text} {r['noun_phrase']}")
print(f"✅ PASS" if len(results3) == 1 and results3[0]['number_tok'].text == "three" else f"❌ FAIL - should only find 'three sequels'")
