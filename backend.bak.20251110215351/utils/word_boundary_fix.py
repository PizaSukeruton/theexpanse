def np_text_with_modifiers_fixed(head):
    """
    Fixed version that preserves word boundaries.
    """
    import string
    PUNCT = set(string.punctuation)
    
    tokens = set(t for t in head.subtree)
    
    for conj in head.conjuncts:
        tokens.update(conj.subtree)
        if conj.head.dep_ == "cc":
            tokens.add(conj.head)
    
    if not tokens:
        return head.text
    
    # Sort tokens by position in document
    sorted_tokens = sorted(tokens, key=lambda t: t.i)
    
    # Build text preserving original spacing
    result = []
    for i, tok in enumerate(sorted_tokens):
        # Add the token text
        result.append(tok.text)
        
        # Check if we need a space before next token
        if i < len(sorted_tokens) - 1:
            next_tok = sorted_tokens[i + 1]
            # If there's a gap in indices, we need space
            if next_tok.i > tok.i + 1:
                result.append(' ')
            # Also check if next token naturally needs space
            elif not next_tok.text in PUNCT and not tok.text in PUNCT:
                result.append(' ')
    
    return ''.join(result).strip()

# Test this fix
import spacy
nlp = spacy.load("en_core_web_sm")

# Test case 1: "originalfilms" issue
test1 = "The original 1977 film was groundbreaking."
doc1 = nlp(test1)
for tok in doc1:
    if tok.text == "film":
        print(f"Original: {tok.text}")
        print(f"With modifiers OLD: would be 'originalfilm'")
        print(f"With modifiers FIXED: {np_text_with_modifiers_fixed(tok)}")

# Test case 2: "Back (1980)" issue  
test2 = "The Empire Strikes Back (1980) was a sequel."
doc2 = nlp(test2)
for tok in doc2:
    if tok.text == "Back":
        print(f"\nOriginal: {tok.text}")
        print(f"With modifiers OLD: 'Back (1980)'")
        print(f"With modifiers FIXED: {np_text_with_modifiers_fixed(tok)}")
