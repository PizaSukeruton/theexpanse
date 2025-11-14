def np_text_with_modifiers_fixed(head):
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
    
    return head.text

# Test this improved fix
import spacy
nlp = spacy.load("en_core_web_sm")

# Test case 1: "originalfilms" issue
print("TEST 1: Word joining issue")
test1 = "The original 1977 film was groundbreaking."
doc1 = nlp(test1)
for tok in doc1:
    if tok.text == "film":
        result = np_text_with_modifiers_fixed(tok)
        print(f"Token: '{tok.text}'")
        print(f"With modifiers: '{result}'")
        print(f"✓ Correct!" if result == "The original 1977 film" else f"✗ Wrong - expected 'The original 1977 film'")

# Test case 2: "Back (1980)" issue  
print("\nTEST 2: Partial title issue")
test2 = "The Empire Strikes Back (1980) was a sequel."
doc2 = nlp(test2)
for tok in doc2:
    if tok.text == "Back":
        result = np_text_with_modifiers_fixed(tok)
        print(f"Token: '{tok.text}'")
        print(f"With modifiers: '{result}'")
        # Note: This might still just get "Back" since (1980) isn't a modifier of Back
        # The real fix needs to happen in the date extraction

# Test case 3: Make sure spaces are preserved
print("\nTEST 3: Space preservation")
test3 = "Nine films in the series."
doc3 = nlp(test3)
for tok in doc3:
    if tok.text == "films":
        result = np_text_with_modifiers_fixed(tok)
        print(f"Token: '{tok.text}'")
        print(f"With modifiers: '{result}'")
        print(f"✓ Correct!" if "Nine films" in result else f"✗ Wrong - should contain 'Nine films'")
