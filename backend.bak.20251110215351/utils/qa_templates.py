import re
import logging
from qa_utils import span_text, be_form_for_question, subject_head, first_date_text, np_text_with_modifiers

logger = logging.getLogger(__name__)

TEMPLATES = {
    "definition": {
        "question": "What {verb} {subject}?",
        "answer_short": "{attribute}",
        "answer_sentence": "{subject} {verb} {attribute}."
    },
    "founding": {
        "question": "Who founded {subject}?",
        "answer_short": "{agent}",
        "answer_sentence": "{subject} was founded by {agent}."
    },
    "creation": {
        "question": "Who created {subject}?",
        "answer_short": "{agent}",
        "answer_sentence": "{subject} was created by {agent}."
    },
    "passive_creation": {
        "question": "Who {verb} {subject}?",
        "answer_short": "{agent}",
        "answer_sentence": "{subject} was {verb} by {agent}."
    },
    "ownership": {
        "question": "Who owns {subject}?",
        "answer_short": "{owner}",
        "answer_sentence": "{subject} is owned by {owner}."
    },
    "sale": {
        "question": "Who sold {subject}?",
        "answer_short": "{seller}",
        "answer_sentence": "{seller} sold {subject}."
    },
    "date_release": {
        "question": "When was {subject} released?",
        "answer_short": "{date}",
        "answer_sentence": "{subject} was released in {date}."
    },
    "date_creation": {
        "question": "When was {subject} created?",
        "answer_short": "{date}",
        "answer_sentence": "{subject} was created in {date}."
    },
    "quantity": {
        "question": "How many {noun} are there?",
        "answer_short": "{number}",
        "answer_sentence": "There are {number} {noun}."
    },
    "quantity_simple": {
        "question": "How many {noun}?",
        "answer_short": "{number}",
        "answer_sentence": "{number} {noun}."
    },
    "apposition": {
        "question": "Who is {subject}?",
        "answer_short": "{description}",
        "answer_sentence": "{subject} is {description}."
    }
}

def strip_relative_clauses(text):
    """Strip ALL relative clauses iteratively until none remain."""
    doc_text = text.strip()
    
    relative_markers = [
        r',?\s+which\s+',
        r',?\s+that\s+',
        r',?\s+who\s+',
        r',?\s+where\s+',
        r',?\s+when\s+'
    ]
    
    # Loop until no more relative clauses found
    changed = True
    iterations = 0
    while changed and iterations < 5:  # Safety limit
        changed = False
        iterations += 1
        for marker in relative_markers:
            match = re.search(marker, doc_text, re.IGNORECASE)
            if match:
                # Find the end of the clause (next comma, period, or end of string)
                end_match = re.search(r'[,.]|$', doc_text[match.end():])
                if end_match:
                    end_pos = match.end() + end_match.start()
                    doc_text = doc_text[:match.start()] + doc_text[end_pos:]
                else:
                    doc_text = doc_text[:match.start()].strip()
                changed = True
                break
    
    return doc_text.strip()

def clean_answer_text(text):
    """Clean up answer text to remove artifacts."""
    # Remove leading articles if the answer is too long
    if len(text.split()) > 15:
        text = strip_relative_clauses(text)
    
    # Remove trailing commas or semicolons
    text = re.sub(r'[,;]\s*$', '', text)
    
    # Remove parenthetical year if it's the whole answer
    if re.match(r'^\(\d{4}\)$', text):
        text = text[1:-1]
    
    return text.strip()

def fix_quantity_question(noun_phrase, number_text):
    """Fix grammatical issues in quantity questions."""
    # Remove trailing punctuation
    noun_phrase = re.sub(r'[,;:\.\!\?]+\s*$', '', noun_phrase)
    
    # Remove leading articles
    noun_phrase = re.sub(r'^(the|a|an)\s+', '', noun_phrase, flags=re.IGNORECASE)
    
    # Remove year references that aren't part of the noun
    noun_phrase = re.sub(r'\s*\d{4}\s*', '', noun_phrase)
    
    # Clean up any extra spaces
    noun_phrase = re.sub(r'\s+', ' ', noun_phrase).strip()
    
    # If noun phrase is now empty or too short, return None
    if not noun_phrase or len(noun_phrase) < 3:
        return None
    
    # Don't add 's' if already plural or special cases
    if not noun_phrase.endswith('s') and 'series' not in noun_phrase:
        # Simple pluralization (this could be enhanced)
        if noun_phrase.endswith('y') and not noun_phrase.endswith(('ay', 'ey', 'oy', 'uy')):
            noun_phrase = noun_phrase[:-1] + 'ies'
        elif noun_phrase.endswith(('s', 'x', 'z', 'ch', 'sh')):
            noun_phrase = noun_phrase + 'es'
        else:
            noun_phrase = noun_phrase + 's'
    
    return noun_phrase
def realize_qa(fact):
    try:
        if fact["type"] == "definition":
            subj = fact["subject_full"]
            attr_full = fact["attribute_full"]
            attr_short = clean_answer_text(strip_relative_clauses(attr_full))
            
            q_verb = be_form_for_question(subject_head(fact["subject"]), fact["root"])
            
            return {
                "question": TEMPLATES["definition"]["question"].format(verb=q_verb, subject=subj),
                "answer_short": attr_short,
                "answer_sentence": TEMPLATES["definition"]["answer_sentence"].format(subject=subj, verb=q_verb, attribute=attr_short),
                "evidence_span": span_text(fact["doc"]),
                "question_type": "what",
                "fact_type": "definition",
                "subject_surface": subj,
                "topic_aliases": []
            }
        
        elif fact["type"] == "passive_creation":
            subj = fact["subject_full"]
            agent = fact["agent"]
            verb_past = fact["verb"].text
            
            # Choose appropriate template based on verb
            if fact["verb"].lemma_ in {"create", "make", "develop"}:
                question = f"Who created {subj}?"
                answer_sent = f"{subj} was created by {agent}."
            elif fact["verb"].lemma_ in {"write"}:
                question = f"Who wrote {subj}?"
                answer_sent = f"{subj} was written by {agent}."
            elif fact["verb"].lemma_ in {"direct"}:
                question = f"Who directed {subj}?"
                answer_sent = f"{subj} was directed by {agent}."
            else:
                question = TEMPLATES["passive_creation"]["question"].format(verb=verb_past, subject=subj)
                answer_sent = TEMPLATES["passive_creation"]["answer_sentence"].format(
                    subject=subj, verb=verb_past, agent=agent
                )
            
            return {
                "question": question,
                "answer_short": clean_answer_text(agent),
                "answer_sentence": answer_sent,
                "evidence_span": span_text(fact["doc"]),
                "question_type": "who",
                "fact_type": "passive_creation",
                "subject_surface": subj,
                "topic_aliases": []
            }
        
        elif fact["type"] == "apposition":
            subj = fact["subject_full"]
            desc = fact["description_full"]
            
            return {
                "question": TEMPLATES["apposition"]["question"].format(subject=subj),
                "answer_short": clean_answer_text(desc),
                "answer_sentence": TEMPLATES["apposition"]["answer_sentence"].format(
                    subject=subj, description=desc
                ),
                "evidence_span": span_text(fact["doc"]),
                "question_type": "who",
                "fact_type": "apposition",
                "subject_surface": subj,
                "topic_aliases": []
            }
        
        elif fact["type"] == "svo":
            subj = fact["subject_full"]
            verb = fact["verb"].lemma_
            obj = fact["object_full"]
            
            creation_verbs = {"create", "make", "develop", "design", "invent", "conceive", "originate"}
            founding_verbs = {"found", "establish", "start", "form", "institute"}
            
            if verb in creation_verbs:
                return {
                    "question": TEMPLATES["creation"]["question"].format(subject=obj),
                    "answer_short": clean_answer_text(subj),
                    "answer_sentence": TEMPLATES["creation"]["answer_sentence"].format(subject=obj, agent=subj),
                    "evidence_span": span_text(fact["doc"]),
                    "question_type": "who",
                    "fact_type": "creation",
                    "subject_surface": obj,
                    "topic_aliases": [],
                    "svo_verb": verb
                }
            
            elif verb in founding_verbs:
                return {
                    "question": TEMPLATES["founding"]["question"].format(subject=obj),
                    "answer_short": clean_answer_text(subj),
                    "answer_sentence": TEMPLATES["founding"]["answer_sentence"].format(subject=obj, agent=subj),
                    "evidence_span": span_text(fact["doc"]),
                    "question_type": "who",
                    "fact_type": "founding",
                    "subject_surface": obj,
                    "topic_aliases": [],
                    "svo_verb": verb
                }
            
            elif verb == "sell":
                return {
                    "question": TEMPLATES["sale"]["question"].format(subject=obj),
                    "answer_short": clean_answer_text(subj),
                    "answer_sentence": TEMPLATES["sale"]["answer_sentence"].format(seller=subj, subject=obj),
                    "evidence_span": span_text(fact["doc"]),
                    "question_type": "who",
                    "fact_type": "sale",
                    "subject_surface": obj,
                    "topic_aliases": [],
                    "svo_verb": verb
                }
            
            return None
        
        elif fact["type"] == "ownership":
            subj = fact["subject_full"]
            owner = fact["owner"]
            
            return {
                "question": TEMPLATES["ownership"]["question"].format(subject=subj),
                "answer_short": clean_answer_text(owner),
                "answer_sentence": TEMPLATES["ownership"]["answer_sentence"].format(subject=subj, owner=owner),
                "evidence_span": span_text(fact["doc"]),
                "question_type": "who",
                "fact_type": "ownership",
                "subject_surface": subj,
                "topic_aliases": []
            }
        
        elif fact["type"] == "date_release":
            doc = fact["doc"]
            subj = fact["subject_full"]
            
            # Use provided time_text if available
            date_txt = fact.get("time_text")
            if not date_txt:
                date_txt = first_date_text(doc)
            if not date_txt:
                time_mod = fact.get("time_mod")
                date_txt = getattr(time_mod, "text", None) if time_mod else None
            if not date_txt:
                return None  # Don't create QA without a date
            
            # Choose template based on verb context
            root_verb = fact.get("root")
            if root_verb and root_verb.lemma_ in {"create", "make", "write"}:
                template_key = "date_creation"
            else:
                template_key = "date_release"
            
            return {
                "question": TEMPLATES[template_key]["question"].format(subject=subj),
                "answer_short": clean_answer_text(date_txt),
                "answer_sentence": TEMPLATES[template_key]["answer_sentence"].format(subject=subj, date=date_txt),
                "evidence_span": span_text(doc),
                "question_type": "when",
                "fact_type": "date_release",
                "expect_type": "date",
                "subject_surface": subj,
                "topic_aliases": []
            }
        
        elif fact["type"] in ("quantity_existential", "quantity_verb_scope", "quantity_have", "quantity_of", "quantity_simple"):
            head = fact["noun_head"]
            
            # Get the full noun phrase or use provided one
            if "noun_phrase" in fact:
                noun_phrase = fact["noun_phrase"]
            else:
                noun_phrase = np_text_with_modifiers(head)
            
            number = fact["number_tok"].text
            
            # Fix the noun phrase for the question
            fixed_noun = fix_quantity_question(noun_phrase, number)
            if not fixed_noun:
                return None  # Skip if we can't create a good question
            
            # Choose simpler template for simple quantities
            if fact["type"] == "quantity_simple":
                template_key = "quantity_simple"
            else:
                template_key = "quantity"
            
            return {
                "question": TEMPLATES[template_key]["question"].format(noun=fixed_noun),
                "answer_short": number,
                "answer_sentence": TEMPLATES[template_key]["answer_sentence"].format(number=number, noun=fixed_noun),
                "evidence_span": span_text(fact["doc"]),
                "question_type": "how_many",
                "fact_type": fact["type"],
                "expect_type": "number",
                "subject_surface": fixed_noun,
                "topic_aliases": []
            }
        
        return None
        
    except Exception as e:
        # LOG errors instead of silently returning None
        logger.error(f"Failed to realize QA for fact type {fact.get('type')}: {e}", exc_info=True)
        return None
