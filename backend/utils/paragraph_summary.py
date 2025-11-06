#!/usr/bin/env python3
import sys
import json
from paragraph_extractor import ParagraphExtractor

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python paragraph_summary.py <pdf_path> [pages] [min_score]")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    pages = None
    if len(sys.argv) > 2:
        if sys.argv[2].lower() == "all":
            pages = None
        else:
            pages = [int(p) - 1 for p in sys.argv[2].split(',')]
    
    min_score = 60.0
    if len(sys.argv) > 3:
        min_score = float(sys.argv[3])
    
    extractor = ParagraphExtractor()
    
    # Extract paragraphs
    all_paragraphs = extractor.extract_from_pdf(pdf_path, pages)
    filtered = extractor.filter_paragraphs(all_paragraphs, min_score=min_score)
    
    # Calculate statistics
    from collections import Counter
    type_counts = Counter(p.classification for p in all_paragraphs)
    score_ranges = {
        "90-100": sum(1 for p in filtered if p.quality_score >= 90),
        "80-89": sum(1 for p in filtered if 80 <= p.quality_score < 90),
        "70-79": sum(1 for p in filtered if 70 <= p.quality_score < 80),
    }
    
    total_words = sum(p.metadata["word_count"] for p in filtered)
    total_sentences = sum(p.metadata["sentence_count"] for p in filtered)
    pages_covered = len(set(p.page_num for p in filtered))
    
    # Print summary report
    print("\n" + "="*60)
    print("PARAGRAPH EXTRACTION SUMMARY REPORT")
    print("="*60)
    print(f"\n📄 SOURCE: {pdf_path}")
    print(f"📊 Pages processed: {pages if pages else 'ALL'}")
    print(f"🎯 Minimum quality score: {min_score}")
    
    print(f"\n📈 EXTRACTION RESULTS:")
    print(f"  • Total paragraphs extracted: {len(all_paragraphs)}")
    print(f"  • Quality paragraphs (≥{min_score}): {len(filtered)}")
    print(f"  • Rejection rate: {(1 - len(filtered)/max(len(all_paragraphs),1))*100:.1f}%")
    
    print(f"\n📝 PARAGRAPH TYPES:")
    for ptype, count in type_counts.most_common():
        print(f"  • {ptype}: {count}")
    
    print(f"\n⭐ QUALITY DISTRIBUTION:")
    for range_name, count in score_ranges.items():
        print(f"  • Score {range_name}: {count} paragraphs")
    
    print(f"\n📊 CONTENT STATISTICS:")
    print(f"  • Total words: {total_words:,}")
    print(f"  • Total sentences: {total_sentences:,}")
    print(f"  • Pages with content: {pages_covered}")
    print(f"  • Avg words/paragraph: {total_words/max(len(filtered),1):.1f}")
    print(f"  • Avg sentences/paragraph: {total_sentences/max(len(filtered),1):.1f}")
    
    print(f"\n✅ READY FOR QA EXTRACTION")
    print("="*60)
    
    # Save to file option
    if len(sys.argv) > 4 and sys.argv[4] == "save":
        output_file = f"{pdf_path.replace('.pdf', '')}_paragraphs.json"
        export = extractor.export_for_qa(filtered)
        with open(output_file, 'w') as f:
            json.dump(export, f, indent=2)
        print(f"\n💾 Full data saved to: {output_file}")
