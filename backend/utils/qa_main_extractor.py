#!/usr/bin/env python3
import sys
import json
import spacy
from qa_patterns import find_copular_defs, find_svo, find_passive_ownership, find_release_dates, find_quantities
from qa_templates import realize_qa
from qa_filters import quality_pipeline, deduplicate_and_rank
from qa_utils import prefilter
import pdfplumber

def extract_qa_from_pdf(pdf_path, limit=25):
    nlp = spacy.load("en_core_web_sm", disable=["ner"])
    
    with pdfplumber.open(pdf_path) as pdf:
        all_text = ""
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                all_text += text + "\n"
    
    sentences = [s.strip() for s in all_text.split('.') if len(s.strip()) > 10]
    
    candidates = [s for s in sentences if prefilter(s)]
    
    print(f"Total sentences: {len(sentences)}", file=sys.stderr)
    print(f"Filtered candidates: {len(candidates)}", file=sys.stderr)
    
    docs = list(nlp.pipe(candidates[:200], batch_size=50))
    
    survivors = []
    
    for doc in docs:
        survivors.extend(list(find_copular_defs(doc)))
        survivors.extend(list(find_svo(doc)))
        survivors.extend(list(find_passive_ownership(doc)))
        survivors.extend(list(find_release_dates(doc)))
        survivors.extend(list(find_quantities(doc)))
    
    print(f"Pattern matches: {len(survivors)}", file=sys.stderr)
    
    qa_pairs = []
    for fact in survivors:
        try:
            qa = realize_qa(fact)
            if qa is None:
                continue
            
            ok, reason = quality_pipeline(qa)
            if ok:
                qa_pairs.append(qa)
        except Exception as e:
            continue
    
    print(f"After quality filter: {len(qa_pairs)}", file=sys.stderr)
    
    qa_pairs = deduplicate_and_rank(qa_pairs, target=limit)
    
    return qa_pairs

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "PDF path required"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 25
    
    try:
        qa_pairs = extract_qa_from_pdf(pdf_path, limit)
        
        result = {
            "status": "success",
            "total_extracted": len(qa_pairs),
            "qa_pairs": qa_pairs
        }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}), file=sys.stderr)
        sys.exit(1)
