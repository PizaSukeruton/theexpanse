# LTLM — Little Tanuki Language Model
## Responsibility & Authority Specification

This document defines the non-negotiable responsibility boundaries of the LTLM.
Any implementation, refactor, or extension MUST comply with this specification.

---

## 1. What LTLM IS

The LTLM is a sentence appropriateness scoring system.

It exists to answer exactly one question:

“Given the current social, emotional, and narrative context,
how appropriate is this candidate sentence right now?”

LTLM outputs a scalar score in the range:

[-1.0 … +1.0]

Where:
+1.0 = strongly appropriate
 0.0 = neutral / situational
-1.0 = strongly inappropriate

---

## 2. What LTLM IS NOT

The LTLM is NOT:
- A chatbot
- A text generator
- A source of truth
- An emotion engine
- A PAD updater
- An intent detector
- A narrative engine
- A creative system

LTLM does not speak.
LTLM does not invent.
LTLM does not explain itself.

---

## 3. Read-Only Inputs (Hard Rule)

LTLM may read:
- Candidate sentence text
- Voice category
- Speaker character ID
- Referenced character ID (if any)
- PAD snapshot (read-only)
- Narrative level / mode
- Grounding presence flags

LTLM must never mutate or infer these.

---

## 4. Output Contract

LTLM outputs:
- One numeric score
- No text
- No metadata
- No side effects

Sentence assembly is external.

---

## 5. Authority Hierarchy

LTLM is subordinate to:
1. Canon / Knowledge
2. Emotional State (PAD)
3. Narrative / TSE systems

LTLM influences selection only — never truth.

---

## 6. Determinism Principle

LTLM is trained only to agree with human judgment.
It does not discover new rules.

---

## 7. Violation Clause

If LTLM ever:
- generates text
- alters PAD
- invents internal mental states

The system is architecturally broken.

---

## 8. Final Lock

LTLM exists to replace randomness with judgment.

Nothing more.
Nothing less.
