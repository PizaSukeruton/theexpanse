import spacy
import logging
from spacy.matcher import DependencyMatcher
from qa_utils import np_text_with_modifiers, is_clean_sentence

logger = logging.getLogger(__name__)

OWNERSHIP_LEMMAS = {"own", "control", "manage", "publish", "distribute", "sell", "buy", "acquire"}

DATE_VERBS = {
    "release", "launch", "publish", "found", "create", "debut", "start", "begin",
    "premiere", "open", "air", "broadcast", "introduce", "come", "appear", 
    "issue", "present", "screen", "roll", "reissue", "relaunch", "drop",
    "announce", "unveil", "establish", "inaugurate", "commission", "originate",
    "follow", "precede", "succeed"
}

COUNT_VERBS = {
    "have", "has", "had", "include", "includes", "included",
    "comprise", "comprises", "comprised", "consist", "consists", "consisted",
    "feature", "features", "featured", "contain", "contains", "contained",
    "produce", "produces", "produced", "release", "releases", "released",
    "appear", "appears", "appeared", "span", "spans", "spanned"
}

CREATION_VERBS = {"create", "make", "develop", "design", "invent", "conceive", "originate", "write", "direct", "produce"}
FOUNDING_VERBS = {"found", "establish", "start", "form", "institute", "begin", "launch"}

def find_copular_defs(doc):
    if not is_clean_sentence(doc.text):
        return
    
    for tok in doc:
        if tok.dep_ == "ROOT" and tok.lemma_ == "be":
            subj = next((c for c in tok.children if c.dep_ in ("nsubj","nsubjpass")), None)
            attr = next((c for c in tok.children if c.dep_ in ("attr","acomp")), None)
            
            if subj and attr:
                subj_text = subj.text.lower()
                if subj_text in ("it", "they", "this", "that", "these", "those", "he", "she"):
                    continue
                
                yield {
                    "type":"definition",
                    "subject":subj, 
                    "subject_full":np_text_with_modifiers(subj),
                    "attribute":attr,
                    "attribute_full":np_text_with_modifiers(attr),
                    "root":tok, 
                    "doc":doc
                }

def find_svo(doc):
    """Enhanced SVO finding with better verb detection."""
    if not is_clean_sentence(doc.text):
        return
    
    for tok in doc:
        if tok.dep_ == "ROOT" and tok.pos_ == "VERB":
            verb_lemma = tok.lemma_
            
            # Check for ALL relevant verbs
            relevant_verbs = CREATION_VERBS | FOUNDING_VERBS | {"sell", "buy", "acquire", "write", "direct"}
            
            if verb_lemma not in relevant_verbs:
                continue
            
            subj = next((c for c in tok.children if c.dep_.startswith("nsubj")), None)
            obj = next((c for c in tok.children if c.dep_ in ("dobj","obj","attr","oprd")), None)
            
            # Also check for objects in prepositional phrases
            if not obj:
                for prep in tok.children:
                    if prep.dep_ == "prep":
                        obj = next((c for c in prep.children if c.dep_ == "pobj"), None)
                        if obj:
                            break
            
            if subj and obj:
                subj_text = subj.text.lower()
                obj_text = obj.text.lower()
                
                if subj_text in ("it", "they", "this", "that", "he", "she"):
                    continue
                if obj_text in ("it", "they", "this", "that", "he", "she"):
                    continue
                
                yield {
                    "type":"svo",
                    "subject":subj,
                    "subject_full":np_text_with_modifiers(subj),
                    "verb":tok,
                    "object":obj,
                    "object_full":np_text_with_modifiers(obj),
                    "doc":doc
                }

def find_passive_constructions(doc):
    """Find passive voice patterns like 'was created by', 'was written by'."""
    if not is_clean_sentence(doc.text):
        return
    
    for tok in doc:
        if tok.pos_ == "VERB":
            # Check for passive auxiliary
            auxpass = next((c for c in tok.children if c.dep_ == "auxpass"), None)
            nsubjpass = next((c for c in tok.children if c.dep_ == "nsubjpass"), None)
            agent = next((c for c in tok.children if c.dep_ == "agent"), None)
            
            if auxpass and nsubjpass:
                agent_text = None
                if agent:
                    pobj = next((c for c in agent.children if c.dep_ == "pobj"), None)
                    if pobj:
                        agent_text = np_text_with_modifiers(pobj)
                
                if agent_text and nsubjpass.text.lower() not in ("it", "they", "this", "that"):
                    yield {
                        "type": "passive_creation",
                        "subject": nsubjpass,
                        "subject_full": np_text_with_modifiers(nsubjpass),
                        "verb": tok,
                        "agent": agent_text,
                        "doc": doc
                    }

def find_appositive_patterns(doc):
    """
    DISABLED: This function is generating too many false positives.
    Only enable for very specific, high-confidence appositive patterns.
    """
    return []  # Disabled for now
    
    # Original code commented out:
    # if not is_clean_sentence(doc.text):
    #     return
    # 
    # for tok in doc:
    #     if tok.dep_ == "appos":
    #         head = tok.head
    #         if head.pos_ in ("NOUN", "PROPN"):
    #             yield {
    #                 "type": "apposition",
    #                 "subject": head,
    #                 "subject_full": np_text_with_modifiers(head),
    #                 "description": tok,
    #                 "description_full": np_text_with_modifiers(tok),
    #                 "doc": doc
    #             }

def find_passive_ownership(doc):
    if not is_clean_sentence(doc.text):
        return
    
    for v in doc:
        if v.pos_ == "VERB" and v.lemma_ in OWNERSHIP_LEMMAS:
            auxp = any(c.dep_ == "auxpass" for c in v.children)
            subj = next((c for c in v.children if c.dep_ == "nsubjpass"), None)
            agent = next((c for c in v.children if c.dep_ == "agent"), None)
            pobj = None
            if agent:
                pobj = next((c for c in agent.children if c.dep_ == "pobj"), None)
            
            if auxp and subj is not None and pobj is not None:
                subj_text = subj.text.lower()
                if subj_text in ("it", "they", "this", "that", "he", "she"):
                    continue
                
                # Handle multiple subjects via conjuncts
                subjects = [subj]
                subjects.extend(list(subj.conjuncts))
                subjects_text = ", ".join(np_text_with_modifiers(s) for s in subjects)
                
                owners = [pobj]
                owners.extend(list(pobj.conjuncts))
                owners_text = ", ".join(o.text for o in owners)
                
                yield {
                    "type":"ownership",
                    "subject":subj,
                    "subject_full":subjects_text,
                    "owner":owners_text,
                    "owner_head":pobj,
                    "root":v,
                    "doc":doc
                }

def find_release_dates(doc):
    """Enhanced date finding with better pattern matching."""
    if not is_clean_sentence(doc.text):
        return
    
    # Look for years in parentheses pattern
    import re
    year_pattern = re.compile(r'\((\d{4})\)')
    
    for match in year_pattern.finditer(doc.text):
        year = match.group(1)
        start_char = match.start()
        
        # Find the token that precedes this year
        for tok in doc:
            if tok.idx < start_char and tok.idx + len(tok.text) >= start_char - 2:
                if tok.pos_ in ("NOUN", "PROPN"):
                    # Make sure it's not a citation or page number
                    if not re.search(r'^\d+\.', doc.text[:start_char].strip()[-10:]):
                        yield {
                            "type": "date_release",
                            "subject": tok,
                            "subject_full": np_text_with_modifiers(tok),
                            "time_text": year,
                            "root": tok,
                            "doc": doc
                        }
                        break
    
    # Traditional verb-based date finding
    for v in doc:
        if v.pos_ == "VERB" and v.lemma_ in DATE_VERBS:
            subj = next((c for c in v.children if c.dep_.startswith("nsubj")), None)
            
            # Look for date entities
            for ent in doc.ents:
                if ent.label_ == "DATE" and ent.start <= v.i <= ent.end + 3:
                    if subj:
                        subj_text = subj.text.lower()
                        if subj_text not in ("it", "they", "this", "that", "he", "she"):
                            yield {
                                "type":"date_release",
                                "subject":subj,
                                "subject_full":np_text_with_modifiers(subj),
                                "time_text":ent.text,
                                "root":v,
                                "doc":doc
                            }

def find_meaningful_quantities(doc):
    """Enhanced quantity finding with better noun phrase detection."""
    if not is_clean_sentence(doc.text):
        return []
    
    # Expanded generic noun blacklist
    GENERIC_BLACKLIST = {
        "item", "items", "thing", "things", "object", "objects",
        "entity", "entities", "element", "elements", "piece", "pieces",
        "part", "parts", "unit", "units", "section", "sections",
        "component", "components", "entry", "entries"
    }
    
    facts = []
    
    # Look for number + noun patterns more broadly
    for tok in doc:
        if tok.pos_ == "NUM":
            # Check if next token is a noun
            if tok.i + 1 < len(doc):
                next_tok = doc[tok.i + 1]
                if next_tok.pos_ == "NOUN" and next_tok.text.lower() not in GENERIC_BLACKLIST:
                    # Make sure this is a meaningful noun phrase
                    noun_phrase = np_text_with_modifiers(next_tok)
                    if len(noun_phrase.split()) >= 2:  # Require at least 2 words for context
                        facts.append({
                            "type":"quantity_simple",
                            "number_tok": tok,
                            "noun_head": next_tok,
                            "noun_phrase": noun_phrase,
                            "doc": doc
                        })
    
    # Existential there patterns
    root = next((t for t in doc if t.dep_ == "ROOT"), None)
    if root and root.lemma_ == "be" and any(c.dep_ == "expl" and c.lower_ == "there" for c in root.children):
        nsubj = next((c for c in root.children if c.dep_ == "nsubj"), None)
        if nsubj:
            num = next((c for c in nsubj.children if c.dep_ == "nummod"), None)
            if num and (nsubj.tag_ in ("NNS","NNPS")):
                noun_text = nsubj.text.lower()
                if noun_text not in GENERIC_BLACKLIST:
                    facts.append({
                        "type":"quantity_existential",
                        "number_tok": num,
                        "noun_head": nsubj,
                        "doc": doc
                    })
    
    return facts
