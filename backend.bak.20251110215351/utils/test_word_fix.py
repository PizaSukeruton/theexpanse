import sys
sys.path.insert(0, '/Users/pizasukeruton/Desktop/theexpanse/backend/utils')

from qa_utils import np_text_with_modifiers
import spacy

nlp = spacy.load("en_core_web_sm")

# Quick test
test = "The original 1977 film was amazing"
doc = nlp(test)

for tok in doc:
    if tok.text == "film":
        result = np_text_with_modifiers(tok)
        print(f"Testing word boundary fix:")
        print(f"  Input: '{test}'")
        print(f"  Token: '{tok.text}'") 
        print(f"  With modifiers: '{result}'")
        print(f"  ✅ SUCCESS!" if "original 1977 film" in result else "❌ FAILED")
        break
