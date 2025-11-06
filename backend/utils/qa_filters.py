import re
import logging
from qa_utils import is_yes_no, count_independent_clauses, answer_in_evidence
from collections import Counter

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PRONOUN_VAGUE_RE = re.compile(
    r"\b(it|its|they|them|their|this|that|these|those|he|him|his|she|her|hers)\b",
    re.IGNORECASE
)

LIMITS_BY_TYPE = {
    "what":      {"max_answer": 40, "min_answer": 2},
    "who":       {"max_answer": 12, "min_answer": 1},
    "when":      {"max_answer": 8,  "min_answer": 1},
    "where":     {"max_answer": 14, "min_answer": 2},
    "how_many":  {"max_answer": 3,  "min_answer": 1},
    "ownership": {"max_answer": 8,  "min_answer": 1},
}

DEFAULT_MAX_Q = 24
DEFAULT_MIN_Q = 3
DEFAULT_MAX_A = 25
DEFAULT_MIN_A = 1

_BRACKETED_NUMBER = re.compile(r"^\s*\[\d+\]\s*$")
_URL_CHUNK = re.compile(r"https?://|www\.|\b\S+/wiki/\S+")
_PAGE_HUD = re.compile(r"\b\d{1,3}/\d{1,3}\b")
_DATE_TIME = re.compile(r"\b\d{1,2}/\d{1,2}/\d{2,4}\b|\b\d{1,2}:\d{2}\b")

GENERIC_NOUNS = {
    'item', 'items', 'thing', 'things', 'object', 'objects',
    'publication', 'publications', 'entry', 'entries', 
    'element', 'elements', 'entity', 'entities',
    'piece', 'pieces', 'part', 'parts', 'unit', 'units',
    'section', 'sections', 'component', 'components'
}

def check_length(qa):
    q = qa["question"].strip()
    a = qa["answer_short"].strip()
    q_type = qa.get("question_type", "what")
    
    lim = LIMITS_BY_TYPE.get(q_type, {})
    max_q = DEFAULT_MAX_Q
    min_q = DEFAULT_MIN_Q
    max_a = lim.get("max_answer", DEFAULT_MAX_A)
    min_a = lim.get("min_answer", DEFAULT_MIN_A)
    
    q_len = len(q.split())
    a_len = len(a.split())
    
    return (min_q <= q_len <= max_q) and (min_a <= a_len <= max_a)

def check_yes_no(qa):
    return not is_yes_no(qa["question"])

def check_vague_referent(qa):
    q = qa["question"].strip()
    
    # Pronouns at start of question are almost always vague
    first_word = q.split()[0].lower() if q.split() else ""
    if first_word in ("it", "its", "they", "them", "their", "this", "that", "these", "those", "he", "him", "his", "she", "her"):
        return False
    
    if not PRONOUN_VAGUE_RE.search(q):
        return True
    
    subj = (qa.get("subject_surface") or "").lower()
    aliases = [a.lower() for a in qa.get("topic_aliases", [])]
    
    if subj and subj in q.lower():
        return True
    if any(a in q.lower() for a in aliases):
        return True
    
    return False

def check_multi_fact(qa):
    return count_independent_clauses(qa["question"]) <= 1

def check_verifiable(qa):
    return answer_in_evidence(qa["answer_short"], qa.get("evidence_span", ""), qa.get("expect_type"))

def check_not_empty(qa):
    return (qa.get("question", "").strip() and 
            qa.get("answer_short", "").strip() and
            qa.get("answer_sentence", "").strip())

def check_not_citation(qa):
    a = qa["answer_short"].strip()
    q = qa["question"].strip()
    q_type = qa.get("question_type", "what")
    expect_type = qa.get("expect_type")
    
    if _BRACKETED_NUMBER.match(a):
        return False
    if q.startswith("[") or a.startswith("["):
        return False
    
    # Context-aware number filtering (FIXED)
    if re.match(r'^\d+$', a):
        # Allow numbers for number/date questions
        if expect_type in ("number", "date") or q_type == "how_many":
            return True
        # Otherwise reject small numbers
        num_val = int(a.lstrip('0') or '0')
        if num_val < 100:
            return False
    
    return True

def check_not_metadata(qa):
    s = (qa.get("evidence_span") or "") + " " + qa["answer_short"]
    if _URL_CHUNK.search(s):
        return False
    if _PAGE_HUD.search(s):
        return False
    if _DATE_TIME.search(s) and qa.get("expect_type") != "date":
        return False
    return True

def check_not_generic_noun(qa):
    q_lower = qa["question"].lower()
    for generic in GENERIC_NOUNS:
        if generic in q_lower:
            return False
    return True

def check_answer_is_not_number_only(qa):
    if qa.get("expect_type") in ("number", "date"):
        return True
    
    a = qa["answer_short"].strip()
    if re.match(r'^\d+$', a):
        return False
    
    return True

def check_svo_verb_quality(qa):
    if qa.get("fact_type") != "svo":
        return True
    
    bad_verbs = {"strike", "return", "include", "contain"}
    
    q = qa["question"].lower()
    for verb in bad_verbs:
        if verb in q:
            return False
    
    return True

class QualityStats:
    """Thread-safe statistics tracker."""
    def __init__(self):
        self.reject_stats = Counter()
        self.rejected_samples = []
    
    def record_rejection(self, qa, reason):
        self.reject_stats[reason] += 1
        qa["_rejected_by"] = reason
        self.rejected_samples.append(qa)
    
    def record_error(self, reason):
        self.reject_stats[f"{reason}_error"] += 1
    
    def dump_stats(self, max_per_reason=3):
        import sys
        print("\n📊 REJECTION STATISTICS:", file=sys.stderr)
        for k, v in self.reject_stats.most_common():
            print(f"  {k}: {v}", file=sys.stderr)
        
        by_reason = {}
        for qa in self.rejected_samples:
            reason = qa.get("_rejected_by")
            if reason:
                by_reason.setdefault(reason, []).append(qa)
        
        for reason, items in sorted(by_reason.items(), key=lambda x: -len(x[1])):
            print(f"\n  -- {reason} examples ({len(items)} total) --", file=sys.stderr)
            for qa in items[:max_per_reason]:
                print(f"    Q: {qa['question']}", file=sys.stderr)
                print(f"    A: {qa['answer_short']}", file=sys.stderr)

def quality_pipeline(qa, stats=None):
    """
    Run quality checks on QA pair.
    Checks are ordered from cheapest to most expensive for fail-fast performance.
    
    Args:
        qa: QA pair dict
        stats: Optional QualityStats instance for tracking
    
    Returns:
        (bool, str): (passed, rejection_reason)
    """
    if stats is None:
        stats = QualityStats()
    
    # REORDERED: cheap checks first, expensive last
    checks = [
        ("not_empty", check_not_empty),
        ("length", check_length),
        ("yes_no", check_yes_no),
        ("not_citation", check_not_citation),
        ("not_metadata", check_not_metadata),
        ("not_generic_noun", check_not_generic_noun),
        ("answer_not_number_only", check_answer_is_not_number_only),
        ("svo_verb_quality", check_svo_verb_quality),
        ("vague_referent", check_vague_referent),
        ("multi_fact", check_multi_fact),
        ("verifiable", check_verifiable)  # Most expensive - run last
    ]
    
    for name, fn in checks:
        try:
            if not fn(qa):
                stats.record_rejection(qa, name)
                return False, name
        except Exception as e:
            logger.error(f"Error in check {name}: {e}", exc_info=True)
            stats.record_error(name)
            return False, f"{name}_error"
    
    return True, None

def deduplicate_and_rank(items, target=25):
    from collections import defaultdict
    
    def normalize(s):
        return re.sub(r'\s+', ' ', s.strip().lower())
    
    def evidence_quality(qa):
        ev = qa.get("evidence_span", "").lower()
        ans = qa["answer_short"].lower()
        presence_score = ev.count(ans) * 10
        length_penalty = len(ev) / 100
        return presence_score - length_penalty
    
    buckets = defaultdict(list)
    for item in items:
        key = (normalize(item["question"]), normalize(item["answer_short"]))
        buckets[key].append(item)
    
    kept = []
    for group in buckets.values():
        best = max(group, key=evidence_quality)
        kept.append(best)
    
    kept.sort(key=evidence_quality, reverse=True)
    return kept[:target]
