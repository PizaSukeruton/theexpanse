import sys
sys.path.insert(0, '/Users/pizasukeruton/Desktop/theexpanse/backend/utils')

from qa_patterns import find_meaningful_quantities
import spacy

nlp = spacy.load("en_core_web_sm")

print("Testing quantity fix in qa_patterns.py:")
test = "The original 1977 film had nine sequels."
doc = nlp(test)

results = find_meaningful_quantities(doc)

print(f"  Input: '{test}'")
print(f"  Found {len(results)} quantities")

for r in results:
    print(f"    - {r['number_tok'].text} {r.get('noun_phrase', r.get('noun_head').text)}")

# Should only find "nine sequels", not "1977 film"
if len(results) == 1 and "nine" in str(results[0]['number_tok'].text):
    print("  ✅ SUCCESS - Years are ignored!")
else:
    print("  ❌ FAILED - Should only find 'nine sequels'")
