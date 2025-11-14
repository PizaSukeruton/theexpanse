#!/usr/bin/env python3
import sys
import json
import pdfplumber

def analyze_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        
        page_info = []
        for i, page in enumerate(pdf.pages, 1):
            text = page.extract_text()
            word_count = len(text.split()) if text else 0
            
            preview = text[:200] if text else "No text"
            
            page_info.append({
                "page_number": i,
                "word_count": word_count,
                "preview": preview
            })
        
        return {
            "total_pages": total_pages,
            "pages": page_info
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "PDF path required"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        result = analyze_pdf(pdf_path)
        result["status"] = "success"
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({"status": "error", "error": str(e)}), file=sys.stderr)
        sys.exit(1)
