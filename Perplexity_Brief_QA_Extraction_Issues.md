Technical Brief: Q&A Extraction Implementation Issues

Date: November 5, 2025
Project: The Expanse - TSE Loop Knowledge System
Purpose: Solve specific extraction problems discovered during testing

---

CONTEXT: WHAT WE BUILT

We implemented Phase 1 of the Q&A extractor with:
- Pattern-based extraction using spaCy dependency parsing
- Two core patterns: copular definitions and SVO (subject-verb-object)
- Quality filtering pipeline
- Template-based Q&A generation

Test Results:
✅ "Pokemon is a media franchise" → Q: "What is Pokemon?" A: "a media franchise"
❌ "Pokemon are creatures with special powers" → Failed verification
❌ "The Pokemon franchise is owned by Nintendo" → No extraction

---

PROBLEM 1: SINGULAR/PLURAL VERB AGREEMENT

Test Case:
Input: "Pokemon are creatures with special powers."
Current Output: Q: "What is Pokemon?" (singular verb)
Expected: Q: "What are Pokemon?" (plural verb)

Our Current Template:
```python
"definition": {
    "question": "What is {subject}?",
    "answer_short": "{attribute}",
    "answer_sentence": "{subject} is {attribute}."
}
```

The Issue:
- spaCy correctly identifies "are" as the copular verb
- But our template hardcodes "is" in the question
- Creates grammatical mismatch

Question 1: How do we detect singular vs plural subjects in spaCy to generate grammatically correct questions?

Need to know:
- How to check if subject token is singular or plural?
- Does spaCy provide number agreement information?
- Should we check the verb's form (is/are/was/were) and mirror it?
- Best practice for verb conjugation in question generation?

Example code pattern we need:
```python
def realize_qa(fact):
    subj = fact["subject_full"]
    verb = fact["root"]  # The "be" verb
    
    # How to determine if we should use "is" or "are"?
    question_verb = ???  # Need help here
    
    return {
        "question": f"What {question_verb} {subj}?",
        ...
    }
```

---

PROBLEM 2: INCOMPLETE NOUN PHRASE EXTRACTION

Test Case:
Input: "Pokemon are creatures with special powers."
Extracted attribute: "creatures with powers" (missing "special")
Expected: "creatures with special powers"

Our Current Code:
```python
def get_full_noun_phrase(token):
    phrase_tokens = [token]
    for child in token.children:
        if child.dep_ in ("compound", "amod", "det", "poss"):
            phrase_tokens.insert(0, child)
    
    for child in token.children:
        if child.dep_ in ("prep", "pobj"):
            phrase_tokens.append(child)
            for subchild in child.children:
                if subchild.dep_ == "pobj":
                    phrase_tokens.append(subchild)
    
    return " ".join([t.text for t in sorted(phrase_tokens, key=lambda x: x.i)])
```

The Issue:
- Missing "special" (amod = adjectival modifier)
- Our code checks for "amod" in children, but seems to miss nested modifiers
- Prepositional phrases ("with special powers") not fully captured

Question 2: What's the robust way to extract complete noun phrases including all modifiers?

Need to know:
- Should we use spaCy's built-in noun_chunks instead?
- How to handle nested prepositional phrases?
- What dependency labels should we include for complete extraction?
- How to handle conjunctions in noun phrases ("creatures and monsters")?

Alternative approaches:
A. Use token.subtree to get all descendants
B. Use Doc.noun_chunks (built-in spaCy feature)
C. Manually walk the dependency tree with comprehensive dep labels

Which is most reliable for encyclopedia-style text?

---

PROBLEM 3: PASSIVE VOICE NOT DETECTED

Test Case:
Input: "The Pokemon franchise is owned by Nintendo."
Current Output: No extraction
Expected: Q: "Who owns the Pokemon franchise?" A: "Nintendo"

Our Pattern:
```python
def find_copular_defs(doc):
    for tok in doc:
        if tok.dep_ == "ROOT" and tok.lemma_ == "be":
            subj = next((c for c in tok.children if c.dep_ in ("nsubj","nsubjpass")), None)
            attr = next((c for c in tok.children if c.dep_ in ("attr","acomp")), None)
            if subj and attr:
                yield {...}
```

The Issue:
- "is owned" is not copular (X is Y), it's passive voice ownership
- Pattern looks for "attr" or "acomp", but passive voice uses different dependencies
- We have a DependencyMatcher pattern for OWNERSHIP_PASS but haven't integrated it

spaCy Parse of "is owned by Nintendo":
```
is (ROOT, AUX)
├── franchise (nsubjpass)
├── owned (attr? or something else?)
└── by (agent)
    └── Nintendo (pobj)
```

Question 3: What are the correct dependency labels for passive voice constructions?

Need to know:
- In "X is owned by Y", what dependency does "owned" have?
- How to extract the agent ("by Y") in passive constructions?
- Should we look for "auxpass" dependency?
- What other passive verbs should we handle (created, founded, developed, released)?

Code pattern we need:
```python
def find_passive_ownership(doc):
    for tok in doc:
        if tok.lemma_ in ("own", "control", "manage") and ???:
            # How to identify this is passive?
            # How to extract subject and agent?
            yield {...}
```

---

PROBLEM 4: QUALITY FILTER TOO STRICT

Current Failure:
Input: "Pokemon are creatures with special powers."
Filter Result: ❌ FAIL (check_verifiable)

Our Verification Code:
```python
def answer_in_evidence(answer, evidence):
    if not evidence or not answer:
        return False
    answer_norm = answer.lower().strip()
    evidence_norm = evidence.lower()
    return answer_norm in evidence_norm
```

The Issue:
- Extracted answer: "creatures with powers"
- Evidence: "Pokemon are creatures with special powers."
- "creatures with powers" is NOT in "creatures with special powers" (missing "special")
- Filter correctly rejects it, but the root cause is Problem 2

Question 4: Should we use fuzzy matching for answer verification?

Need to know:
- Is exact substring matching too strict?
- Should we use token overlap (e.g., 80% of answer tokens present)?
- Should we use lemmatization for matching?
- What about semantic similarity (though we want to avoid embeddings)?

Alternative verification approaches:
```python
# Option A: Token overlap
def answer_in_evidence_fuzzy(answer, evidence):
    answer_tokens = set(answer.lower().split())
    evidence_tokens = set(evidence.lower().split())
    overlap = len(answer_tokens & evidence_tokens)
    return overlap / len(answer_tokens) >= 0.8  # 80% threshold

# Option B: Lemmatized matching
def answer_in_evidence_lemma(answer, evidence, nlp):
    answer_lemmas = {token.lemma_ for token in nlp(answer)}
    evidence_lemmas = {token.lemma_ for token in nlp(evidence)}
    overlap = len(answer_lemmas & evidence_lemmas)
    return overlap / len(answer_lemmas) >= 0.8
```

Which is best for our use case?

---

PROBLEM 5: DATE AND QUANTITY EXTRACTION NOT TESTED

We have placeholder functions but haven't tested them:
```python
def extract_dates(doc):
    try:
        for ent in doc.ents:
            if ent.label_ == "DATE":
                return [ent.text]
    except:
        pass
    return []

def extract_quants(doc):
    try:
        nums = []
        for token in doc:
            if token.like_num or token.pos_ == "NUM":
                nums.append(token.text)
        return nums
    except:
        pass
    return []
```

Test Cases We Need:
- "Pokemon was released on February 27, 1996."
- "There are 1,025 Pokemon species."
- "The franchise generated $100 billion in revenue."

Question 5: How should we integrate date/quantity extraction into Q&A generation?

Need to know:
- How to detect temporal patterns ("released on DATE", "founded in YEAR")?
- How to generate date questions ("When was X released?")?
- How to handle quantity patterns ("There are N X")?
- Should we use dateparser library for better date normalization?
- Should we use quantulum3 for number+unit extraction?

Template patterns needed:
```python
"date_release": {
    "question": "When was {subject} released?",
    "answer_short": "{date}",
    "answer_sentence": "{subject} was released on {date}."
},
"quantity": {
    "question": "How many {noun} are there?",
    "answer_short": "{number}",
    "answer_sentence": "There are {number} {noun}."
}
```

---

DELIVERABLE REQUEST

Please provide specific solutions for:

1. **Singular/Plural Agreement**: Code pattern to detect subject number and generate correct question verb
2. **Noun Phrase Extraction**: Most reliable spaCy method for complete phrase extraction
3. **Passive Voice Detection**: Dependency patterns and extraction code for passive constructions
4. **Answer Verification**: Fuzzy matching approach that balances precision and recall
5. **Date/Quantity Integration**: Pattern detection and template realization for temporal and numeric facts

Focus on: Working code examples using spaCy, specific dependency labels, and practical thresholds.

---

CONSTRAINTS

- CPU-only (no GPU, no heavy models)
- spaCy en_core_web_sm model only
- No external APIs
- Must work on Wikipedia-style encyclopedia text
- Target: 80%+ precision on Q&A extraction

Thank you for helping us solve these implementation challenges!
