#!/usr/bin/env python3
"""
Advanced clause splitter for complex sentence processing.
Breaks sentences into atomic clauses for better fact extraction.
"""

import spacy
from collections import defaultdict

# Creation-related lemmas
CREATION_LEMMAS = {
    "create", "found", "conceive", "develop", "originate", 
    "invent", "design", "author", "produce", "form", 
    "establish", "co-create", "cofound", "coin", "initiate",
    "write", "direct", "build", "launch", "start"
}

# Nominal triggers that often have "by" agents
CREATION_NOMINALS = {
    "creation", "concept", "invention", "design", "authorship", 
    "development", "origins", "origin", "idea", "founder",
    "creator", "author", "director", "producer"
}

def extract_clauses(doc):
    """
    Extract atomic clauses from a sentence.
    Returns list of (start_idx, end_idx, clause_type) tuples.
    """
    clauses = []
    
    # Find all clause heads (ROOT, conj, advcl, acl, relcl)
    clause_heads = []
    for token in doc:
        if token.dep_ in ["ROOT", "conj", "advcl", "acl", "relcl"]:
            clause_heads.append(token)
    
    # Extract span for each clause head
    seen_ranges = set()
    for head in clause_heads:
        # Get the subtree of this clause head
        subtree = list(head.subtree)
        if subtree:
            start = min(t.i for t in subtree)
            end = max(t.i for t in subtree) + 1
            
            # Avoid duplicates
            if (start, end) not in seen_ranges:
                seen_ranges.add((start, end))
                clause_type = head.dep_
                clauses.append((start, end, clause_type))
    
    # Also look for participial phrases (VBN/VBG not caught above)
    for token in doc:
        if token.tag_ in ["VBN", "VBG"] and token.dep_ not in ["ROOT", "conj"]:
            # This might be a reduced relative clause
            subtree = list(token.subtree)
            if len(subtree) > 1:  # Not just the participle alone
                start = min(t.i for t in subtree)
                end = max(t.i for t in subtree) + 1
                if (start, end) not in seen_ranges:
                    seen_ranges.add((start, end))
                    clauses.append((start, end, "participial"))
    
    # Sort by position
    clauses.sort(key=lambda x: x[0])
    
    return clauses

def extract_attribution_facts(doc, topic=None):
    """
    Extract creator/attribution facts from a parsed sentence.
    Handles multiple patterns including complex nested attributions.
    """
    facts = []
    
    # Memory for resolving "its/their"
    last_entity = topic
    
    # Pattern 1: Active voice (PERSON created X)
    for token in doc:
        if token.pos_ == "VERB" and token.lemma_ in CREATION_LEMMAS:
            # Find subject
            subj = None
            for child in token.children:
                if child.dep_ in ["nsubj", "nsubjpass"]:
                    subj = child
                    break
            
            # Find object
            obj = None
            for child in token.children:
                if child.dep_ in ["dobj", "obj"]:
                    obj = child
                    break
            
            if subj and obj:
                # Active voice
                creator = doc[subj.left_edge.i : subj.right_edge.i + 1].text
                creation = doc[obj.left_edge.i : obj.right_edge.i + 1].text
                facts.append({
                    "pattern": "active",
                    "creator": creator,
                    "creation": creation,
                    "verb": token.lemma_
                })
    
    # Pattern 2: Passive voice (X was created by PERSON)
    for token in doc:
        if token.pos_ == "VERB" and token.lemma_ in CREATION_LEMMAS:
            # Check for passive
            is_passive = any(child.dep_ == "auxpass" for child in token.children)
            if is_passive:
                # Find subject (what was created)
                subj = None
                for child in token.children:
                    if child.dep_ == "nsubjpass":
                        subj = child
                        break
                
                # Find agent (by whom)
                agent = None
                for child in token.children:
                    if child.dep_ == "agent" and child.text.lower() == "by":
                        # Get the object of "by"
                        for grandchild in child.children:
                            if grandchild.dep_ == "pobj":
                                agent = grandchild
                                break
                
                if subj and agent:
                    creation = doc[subj.left_edge.i : subj.right_edge.i + 1].text
                    creator = doc[agent.left_edge.i : agent.right_edge.i + 1].text
                    facts.append({
                        "pattern": "passive",
                        "creator": creator,
                        "creation": creation,
                        "verb": token.lemma_
                    })
    
    # Pattern 3: "by" phrases (games developed by PERSON)
    for token in doc:
        if token.text.lower() == "by" and token.dep_ in ["agent", "prep"]:
            # Find what "by" modifies
            head = token.head
            
            # Find the agent
            agent = None
            for child in token.children:
                if child.dep_ == "pobj":
                    agent = child
                    break
            
            if agent and head:
                # Check if head is creation-related
                if head.lemma_ in CREATION_LEMMAS or head.lemma_ in CREATION_NOMINALS:
                    creator = doc[agent.left_edge.i : agent.right_edge.i + 1].text
                    
                    # Find what was created (look up the tree)
                    creation = topic  # Default to topic
                    if head.dep_ in ["acl", "relcl", "amod"]:
                        # Modifying something
                        creation = head.head.text
                    
                    facts.append({
                        "pattern": "by_phrase",
                        "creator": creator,
                        "creation": creation or topic,
                        "verb": head.lemma_
                    })
    
    # Pattern 4: Appositive (its founder, PERSON)
    for token in doc:
        if token.lemma_ in ["founder", "creator", "author", "director"]:
            # Check for appositive
            for child in token.children:
                if child.dep_ == "appos":
                    creator = doc[child.left_edge.i : child.right_edge.i + 1].text
                    
                    # Resolve "its/their"
                    creation = topic
                    if token.head and token.head.pos_ in ["NOUN", "PROPN"]:
                        creation = token.head.text
                    
                    facts.append({
                        "pattern": "appositive",
                        "creator": creator,
                        "creation": creation or topic,
                        "verb": "found"
                    })
    
    return facts

def process_sentence_with_clauses(sent_text, topic=None):
    """
    Process a sentence by splitting into clauses and extracting facts from each.
    """
    nlp = spacy.load("en_core_web_sm")
    doc = nlp(sent_text)
    
    # Extract clauses
    clauses = extract_clauses(doc)
    
    all_facts = []
    
    if not clauses:
        # No clauses found, process whole sentence
        facts = extract_attribution_facts(doc, topic)
        for fact in facts:
            fact["clause"] = "full_sentence"
            fact["evidence"] = sent_text
            all_facts.extend(facts)
    else:
        # Process each clause
        for start, end, clause_type in clauses:
            clause_span = doc[start:end]
            clause_doc = clause_span.as_doc()
            
            facts = extract_attribution_facts(clause_doc, topic)
            for fact in facts:
                fact["clause"] = clause_type
                fact["clause_text"] = clause_span.text
                fact["evidence"] = sent_text
            
            all_facts.extend(facts)
    
    return all_facts

# Test it
if __name__ == "__main__":
    test_sentences = [
        "The franchise originated as a pair of role-playing games developed by Game Freak, from an original concept by its founder, Satoshi Tajiri.",
        "The main idea behind Pokémon was conceived by Satoshi Tajiri.",
        "Ishihara founded Creatures, Inc. on 8 November 1995.",
        "Created by Satoshi Tajiri.",
        "Lucas wrote and directed the original 1977 film."
    ]
    
    print("CLAUSE-LEVEL FACT EXTRACTION")
    print("="*60)
    
    for sent in test_sentences:
        print(f"\nSentence: {sent[:80]}...")
        facts = process_sentence_with_clauses(sent, topic="Pokémon")
        
        if facts:
            for i, fact in enumerate(facts, 1):
                print(f"  Fact {i}:")
                print(f"    Pattern: {fact['pattern']}")
                print(f"    Creator: {fact['creator']}")
                print(f"    Creation: {fact['creation']}")
                if 'clause_text' in fact:
                    print(f"    From clause: '{fact['clause_text'][:50]}...'")
        else:
            print("  No facts found")
    
    print("\n" + "="*60)
