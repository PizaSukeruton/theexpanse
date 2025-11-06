#!/usr/bin/env python3
import sys
import json
import spacy
from collections import Counter
import pdfplumber
from qa_utils import clean_wikipedia_text, extract_entity_phrases

def parse_page_selection(selection_str, total_pages):
    pages = set()
    
    if selection_str.lower() == "all":
        return list(range(1, total_pages + 1))
    
    parts = selection_str.split(',')
    for part in parts:
        part = part.strip()
        if '-' in part:
            start, end = part.split('-')
            start = int(start.strip())
            end = int(end.strip())
            pages.update(range(start, end + 1))
        else:
            pages.add(int(part))
    
    return sorted([p for p in pages if 1 <= p <= total_pages])

def extract_topics_from_pdf(pdf_path, page_selection="all", top_n=50):
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        pages_to_process = parse_page_selection(page_selection, total_pages)
        
        all_text = ""
        for page_num in pages_to_process:
            text = pdf.pages[page_num - 1].extract_text()
            if text:
                cleaned = clean_wikipedia_text(text)
                all_text += cleaned + "\n"
    
    entity_phrases = extract_entity_phrases(all_text)
    
    phrase_counts = Counter(entity_phrases)
    
    top_topics = [
        {"topic": topic, "count": count} 
        for topic, count in phrase_counts.most_common(top_n)
    ]
    
    return {
        "topics": top_topics,
        "pages_processed": pages_to_process,
        "total_words": len(all_text.split())
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "PDF path required"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    page_selection = sys.argv[2] if len(sys.argv) > 2 else "all"
    top_n = int(sys.argv[3]) if len(sys.argv) > 3 else 50
    
    try:
        result = extract_topics_from_pdf(pdf_path, page_selection, top_n)
        result["status"] = "success"
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}), file=sys.stderr)
        sys.exit(1)
