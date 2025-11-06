import re
import hashlib
import spacy
import threading
from functools import lru_cache
from spacy.lang.en.stop_words import STOP_WORDS

# Thread-safe spacy model loading
_nlp_small = None
_nlp_ner = None
_nlp_lock = threading.Lock()

def get_nlp():
    global _nlp_small
    if _nlp_small is None:
        with _nlp_lock:
            if _nlp_small is None:
                _nlp_small = spacy.load("en_core_web_sm", disable=["parser","ner","textcat"])
    return _nlp_small

def get_nlp_ner():
    global _nlp_ner
    if _nlp_ner is None:
        with _nlp_lock:
            if _nlp_ner is None:
                _nlp_ner = spacy.load("en_core_web_sm", disable=["tagger","parser"])
    return _nlp_ner

_CITATION_RE = re.compile(r"\[(?:\d+|[a-z])\]")
_URL_RE = re.compile(r"(https?://\S+|www\.\S+|\S+/\S+\.(?:html|php))")
_WIKI_PATH_RE = re.compile(r"\b\w+://\S+|\b\S+/wiki/\S+")
_HUD_RE = re.compile(r"\b\d{1,3}/\d{1,3}\b(?:[^\S\r\n]+\d{1,2}/\d{1,2}/\d{2,4}(?:,\s*\d{1,2}:\d{2})?)?")
_TIME_DATE_RE = re.compile(r"\b\d{1,2}:\d{2}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b")
_CAPTION_RE = re.compile(r"\((?:[^)]*\b(left|right|center)\b[^)]*)\)", re.IGNORECASE)
_BRACKET_CHAIN_RE = re.compile(r"(?:\[[^\]]*\]){2,}")
_WS_RE = re.compile(r"[ \t]+")

def clean_wikipedia_text(text):
    t = text
    # Remove citations first for consistency
    t = _CITATION_RE.sub("", t)
    t = _BRACKET_CHAIN_RE.sub("", t)
    t = _URL_RE.sub("", t)
    t = _WIKI_PATH_RE.sub("", t)
    t = _HUD_RE.sub("", t)
    t = _TIME_DATE_RE.sub("", t)
    t = _CAPTION_RE.sub("", t)
    t = re.sub(r"\[\s*\]", "", t)
    t = re.sub(r"[•|]+", " ", t)
    t = re.sub(r"\s+\n", "\n", t)
    t = re.sub(r"\n{2,}", "\n", t)
    t = _WS_RE.sub(" ", t)
    return t.strip()

_BAD_SENT_RE = re.compile(r"^\s*\[|https?://|www\.|\b\d{1,3}/\d{1,3}\b", re.IGNORECASE)

def is_clean_sentence(text):
    if _BAD_SENT_RE.search(text):
        return False
    if text.count("[") + text.count("]") >= 2:
        return False
    return True

def generate_temp_id(text):
    h = hashlib.blake2s(text.encode('utf-8'), digest_size=3).hexdigest().upper()
    return f"#TEMP_{h}"

def prefilter(text):
    triggers = r'\b(is|are|was|were|founded|created|released|owned|consists?|includes?|comprises?|originated?|called|dubbed|evolved?)\b'
    has_trigger = bool(re.search(triggers, text, re.IGNORECASE))
    has_entity = bool(re.search(r'[A-Z][a-z]+', text))
    has_number = bool(re.search(r'\d', text))
    return has_trigger and (has_entity or has_number) and len(text.split()) > 5

def be_form_for_question(subj_tok, verb_tok):
    verb_text = verb_tok.text.lower()
    
    if verb_text in ("are", "were"):
        return verb_text
    elif verb_text in ("is", "was"):
        return verb_text
    
    tense = (verb_tok.morph.get("Tense") or ["Pres"])[0]
    num = (subj_tok.morph.get("Number") or verb_tok.morph.get("Number") or ["Sing"])[0]
    
    if tense == "Past":
        return "were" if num == "Plur" else "was"
    return "are" if num == "Plur" else "is"

def subject_head(token):
    return getattr(getattr(token, "root", None), "head", token) or token

def np_text_with_modifiers(head):
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
def span_text(doc):
    if hasattr(doc, 'text'):
        return doc.text
    return str(doc)

def is_yes_no(question):
    return question.strip().startswith(('Is ', 'Are ', 'Was ', 'Were ', 'Do ', 'Does ', 'Did ', 'Can ', 'Could ', 'Will ', 'Would '))

def has_vague_ref(question):
    vague = r'\b(it|they|this|that|these|those)\b'
    words = question.lower().split()
    if len(words) < 4:
        return False
    return bool(re.search(vague, question.lower()))

def count_independent_clauses(text):
    """Count actual independent clauses using spacy parsing, not naive string matching."""
    nlp = get_nlp()
    doc = nlp(text)
    # Count ROOT dependencies as clause indicators
    return sum(1 for tok in doc if tok.dep_ == "ROOT")

def _norm(s):
    return re.sub(r"\s+", " ", s.strip().lower())

@lru_cache(maxsize=2048)
def content_lemmas(s):
    """Cached lemmatization for performance."""
    nlp = get_nlp()
    doc = nlp(s)
    return frozenset(t.lemma_.lower() for t in doc if not (t.is_punct or t.is_space or t.lower_ in STOP_WORDS))

def answer_in_evidence(answer, evidence, expect_type=None):
    if not evidence or not answer:
        return False
    a = _norm(answer)
    e = _norm(evidence)
    
    if a in e:
        return True
    
    A = content_lemmas(answer)
    E = content_lemmas(evidence)
    if A:
        # Scale threshold based on answer length
        if len(A) == 1:
            threshold = 0.95
        elif len(A) <= 3:
            threshold = 0.85
        else:
            threshold = 0.75
            
        overlap = len(A & E) / len(A)
        if overlap >= threshold:
            return True
    
    if expect_type == "date":
        return a.replace(",", "") in e.replace(",", "")
    if expect_type == "number":
        na = re.sub(r"[,\s]", "", a)
        ne = re.sub(r"[,\s]", "", e)
        return na in ne
    
    return False

GOOD_ENTS = {"PERSON", "ORG", "PRODUCT", "WORK_OF_ART", "EVENT", "FAC"}

def extract_entity_phrases(text):
    nlp_ner = get_nlp_ner()
    doc = nlp_ner(text)
    phrases = []
    for ent in doc.ents:
        if ent.label_ in GOOD_ENTS and len(ent.text) > 2:
            phrases.append(ent.text)
    return phrases

def build_topic_aliases(selected_topics):
    """Build aliases for topic matching including proper name handling."""
    nlp_ner = get_nlp_ner()
    aliases = set()
    
    for t in selected_topics:
        t_clean = t.strip()
        aliases.add(t_clean)
        
        doc = nlp_ner(t_clean)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                parts = ent.text.split()
                if len(parts) >= 2:
                    # Add last name only
                    aliases.add(parts[-1])
                if len(parts) >= 3:
                    # Add first + last name (FIXED: was parts[-2:])
                    aliases.add(f"{parts[0]} {parts[-1]}")
        
        if ":" not in t_clean:
            aliases.add(t_clean + ":")
        
        lower_variant = t_clean.lower()
        if lower_variant != t_clean:
            aliases.add(f"the {lower_variant}")
            aliases.add(f"the {lower_variant} franchise")
    
    return sorted(aliases, key=lambda s: (-len(s), s.lower()))

def make_phrase_matcher(vocab, selected_topics):
    from spacy.matcher import PhraseMatcher
    nlp = get_nlp_ner()
    
    exact = PhraseMatcher(vocab, attr="LOWER")
    exact.add("EXACT", [nlp.make_doc(t) for t in selected_topics])
    
    aliases = build_topic_aliases(selected_topics)
    soft = PhraseMatcher(vocab, attr="LOWER")
    soft.add("SOFT", [nlp.make_doc(a) for a in aliases])
    
    return (exact, soft)

def sentence_matches_topics_batch(docs, matchers):
    """Batch topic matching using pre-processed docs."""
    exact, soft = matchers
    results = []
    
    for doc in docs:
        score = 0.0
        if exact(doc):
            score += 1.0
        if soft(doc):
            score += 0.5
        results.append(score >= 0.5)
    
    return results

def sentence_matches_topics(nlp, sentence, matchers):
    """Single sentence topic matching (for compatibility)."""
    doc = nlp(sentence)
    exact, soft = matchers
    
    score = 0.0
    if exact(doc):
        score += 1.0
    if soft(doc):
        score += 0.5
    
    return score >= 0.5

def first_date_text(doc):
    for ent in doc.ents:
        if ent.label_ == "DATE":
            return ent.text
    return None
