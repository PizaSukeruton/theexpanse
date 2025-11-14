# Just the fixed main section - add this to the end of paragraph_extractor.py
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python paragraph_extractor.py <pdf_path> [pages] [min_score]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    pages = None
    if len(sys.argv) > 2:
        if sys.argv[2].lower() == "all":
            pages = None  # None means all pages
        else:
            pages = [int(p) - 1 for p in sys.argv[2].split(',')]
    
    min_score = 60.0
    if len(sys.argv) > 3:
        min_score = float(sys.argv[3])
    
    try:
        result = extract_and_filter(pdf_path, pages, min_score)
        print(result)
    except Exception as e:
        logger.error(f"Extraction failed: {e}")
        sys.exit(1)
