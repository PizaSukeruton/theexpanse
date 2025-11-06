#!/usr/bin/env python3
import sys
import json
import re
import fitz
import logging
from typing import List, Dict, Tuple
from dataclasses import dataclass
from collections import Counter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Paragraph:
    text: str
    page_num: int
    para_num: int
    bbox: tuple
    font_size: float
    font_name: str
    classification: str
    quality_score: float
    metadata: dict

class ParagraphExtractor:
    def __init__(self):
        self.citation_patterns = [
            re.compile(r'\[\d+\]'),
            re.compile(r'\(\d{4}\)'),
            re.compile(r'^\d+\.\s*$'),
            re.compile(r'^[ivxIVX]+\.\s*$'),
            re.compile(r'https?://'),
            re.compile(r'www\.'),
            re.compile(r'\b(?:ISBN|DOI|ISSN)\b'),
            re.compile(r'^\s*(?:Table|Figure|Fig\.)\s+\d+'),
        ]
        
        self.header_patterns = [
            re.compile(r'^(?:Chapter|Section|Part)\s+\d+', re.IGNORECASE),
            re.compile(r'^(?:Abstract|Introduction|Conclusion|References)', re.IGNORECASE),
            re.compile(r'^\d+(?:\.\d+)*\s+[A-Z]'),
            re.compile(r'^[A-Z][A-Z\s]+$'),
        ]
        
        self.junk_patterns = [
            re.compile(r'^\s*Page\s+\d+'),
            re.compile(r'^\s*\d+\s*$'),
            re.compile(r'^[\W_]+$'),
            re.compile(r'^\s*Copyright'),
            re.compile(r'^\s*©'),
        ]
    
    def extract_from_pdf(self, pdf_path: str, pages: List[int] = None) -> List[Paragraph]:
        """
        Extract paragraphs from PDF with full metadata.
        
        Args:
            pdf_path: Path to PDF file
            pages: List of page numbers to process (0-indexed), None for all
        
        Returns:
            List of Paragraph objects
        """
        paragraphs = []
        
        try:
            doc = fitz.open(pdf_path)
            
            if pages is None:
                pages = range(len(doc))
            
            para_counter = 0
            
            for page_num in pages:
                if page_num >= len(doc):
                    logger.warning(f"Page {page_num} out of range, skipping")
                    continue
                
                page = doc[page_num]
                blocks = page.get_text("dict")
                
                page_paragraphs = self._extract_page_paragraphs(blocks, page_num)
                
                for para_text, bbox, font_size, font_name in page_paragraphs:
                    if len(para_text.strip()) < 20:
                        continue
                    
                    classification = self._classify_paragraph(para_text)
                    quality_score = self._score_paragraph(para_text, classification)
                    
                    paragraph = Paragraph(
                        text=para_text.strip(),
                        page_num=page_num + 1,
                        para_num=para_counter,
                        bbox=bbox,
                        font_size=font_size,
                        font_name=font_name,
                        classification=classification,
                        quality_score=quality_score,
                        metadata={
                            "word_count": len(para_text.split()),
                            "char_count": len(para_text),
                            "has_citations": self._has_citations(para_text),
                            "has_numbers": bool(re.search(r'\d', para_text)),
                            "sentence_count": para_text.count('.') + para_text.count('!') + para_text.count('?'),
                        }
                    )
                    
                    paragraphs.append(paragraph)
                    para_counter += 1
            
            doc.close()
            
        except Exception as e:
            logger.error(f"Error extracting paragraphs: {e}")
            raise
        
        return paragraphs
    
    def _extract_page_paragraphs(self, blocks: dict, page_num: int) -> List[Tuple]:
        """
        Extract paragraphs from a single page.
        
        Args:
            blocks: PyMuPDF blocks dictionary
            page_num: Page number for logging
        
        Returns:
            List of (text, bbox, font_size, font_name) tuples
        """
        paragraphs = []
        current_paragraph = []
        current_bbox = None
        current_font_size = 0
        current_font_name = ""
        font_sizes = []
        
        for block in blocks.get("blocks", []):
            if block.get("type") != 0:
                continue
            
            for line in block.get("lines", []):
                line_text = ""
                line_fonts = []
                line_sizes = []
                
                for span in line.get("spans", []):
                    span_text = span.get("text", "")
                    line_text += span_text
                    
                    if span_text.strip():
                        line_fonts.append(span.get("font", ""))
                        line_sizes.append(span.get("size", 0))
                
                if line_text.strip():
                    if line_fonts:
                        most_common_font = Counter(line_fonts).most_common(1)[0][0]
                        avg_size = sum(line_sizes) / len(line_sizes) if line_sizes else 0
                    else:
                        most_common_font = ""
                        avg_size = 0
                    
                    if self._is_paragraph_break(line_text, current_paragraph, avg_size, current_font_size):
                        if current_paragraph:
                            para_text = " ".join(current_paragraph)
                            if para_text.strip():
                                paragraphs.append((
                                    para_text,
                                    current_bbox,
                                    current_font_size,
                                    current_font_name
                                ))
                        
                        current_paragraph = [line_text.strip()]
                        current_bbox = line.get("bbox", (0, 0, 0, 0))
                        current_font_size = avg_size
                        current_font_name = most_common_font
                    else:
                        current_paragraph.append(line_text.strip())
                        if not current_font_size:
                            current_font_size = avg_size
                            current_font_name = most_common_font
        
        if current_paragraph:
            para_text = " ".join(current_paragraph)
            if para_text.strip():
                paragraphs.append((
                    para_text,
                    current_bbox,
                    current_font_size,
                    current_font_name
                ))
        
        return paragraphs
    
    def _is_paragraph_break(self, line_text: str, current_paragraph: List[str], 
                           line_font_size: float, current_font_size: float) -> bool:
        """
        Determine if this line starts a new paragraph.
        
        Args:
            line_text: Current line text
            current_paragraph: Lines accumulated so far
            line_font_size: Font size of current line
            current_font_size: Font size of paragraph so far
        
        Returns:
            True if this starts a new paragraph
        """
        if not current_paragraph:
            return True
        
        if line_text.strip().startswith(('•', '●', '○', '■', '□', '-', '*')):
            return True
        
        if abs(line_font_size - current_font_size) > 2:
            return True
        
        if re.match(r'^\s{4,}', line_text):
            return True
        
        if re.match(r'^\d+\.?\s+[A-Z]', line_text):
            return True
        
        last_line = current_paragraph[-1] if current_paragraph else ""
        if last_line.endswith(('.', '!', '?', ':"')) and line_text[0:1].isupper():
            ends_with_short = len(last_line.split()[-1]) <= 3 if last_line.split() else False
            if not ends_with_short:
                return True
        
        return False
    
    def _has_citations(self, text: str) -> bool:
        """Check if text contains citations."""
        for pattern in self.citation_patterns:
            if pattern.search(text):
                return True
        return False
    
    def _classify_paragraph(self, text: str) -> str:
        """
        Classify paragraph type.
        
        Args:
            text: Paragraph text
        
        Returns:
            Classification: 'content', 'header', 'citation', 'metadata', 'junk'
        """
        text_lower = text.lower().strip()
        
        for pattern in self.junk_patterns:
            if pattern.search(text):
                return 'junk'
        
        for pattern in self.header_patterns:
            if pattern.search(text):
                return 'header'
        
        citation_count = sum(1 for p in self.citation_patterns if p.search(text))
        word_count = len(text.split())
        if word_count > 0:
            citation_density = citation_count / word_count
            if citation_density > 0.3:
                return 'citation'
        
        if len(text) < 50:
            return 'metadata'
        
        if re.search(r'^(Table|Figure|Fig\.)\s+\d+', text, re.IGNORECASE):
            return 'metadata'
        
        return 'content'
    
    def _score_paragraph(self, text: str, classification: str) -> float:
        """
        Score paragraph quality from 0-100.
        
        Args:
            text: Paragraph text
            classification: Paragraph classification
        
        Returns:
            Quality score (0-100)
        """
        if classification in ('junk', 'citation'):
            return 0.0
        
        if classification == 'metadata':
            return 10.0
        
        if classification == 'header':
            return 30.0
        
        score = 100.0
        
        word_count = len(text.split())
        if word_count < 20:
            score -= 40
        elif word_count < 50:
            score -= 20
        elif word_count > 500:
            score -= 10
        
        sentences = text.count('.') + text.count('!') + text.count('?')
        if sentences == 0:
            score -= 30
        elif sentences == 1:
            score -= 10
        
        pronouns = len(re.findall(r'\b(it|they|this|that|these|those)\b', text.lower()))
        if word_count > 0:
            pronoun_ratio = pronouns / word_count
            if pronoun_ratio > 0.1:
                score -= 20
        
        numbers = len(re.findall(r'\d+', text))
        if word_count > 0:
            number_ratio = numbers / word_count
            if number_ratio > 0.3:
                score -= 25
        
        if self._has_citations(text):
            score -= 15
        
        capitals = len(re.findall(r'\b[A-Z]{2,}\b', text))
        if capitals > 5:
            score -= 10
        
        return max(0.0, min(100.0, score))
    
    def filter_paragraphs(self, paragraphs: List[Paragraph], 
                         min_score: float = 60.0,
                         allowed_types: List[str] = None) -> List[Paragraph]:
        """
        Filter paragraphs based on quality and type.
        
        Args:
            paragraphs: List of Paragraph objects
            min_score: Minimum quality score
            allowed_types: Allowed classification types
        
        Returns:
            Filtered list of paragraphs
        """
        if allowed_types is None:
            allowed_types = ['content']
        
        filtered = []
        for para in paragraphs:
            if para.quality_score >= min_score and para.classification in allowed_types:
                filtered.append(para)
        
        return filtered
    
    def group_into_chunks(self, paragraphs: List[Paragraph], 
                         max_chunk_size: int = 3) -> List[List[Paragraph]]:
        """
        Group consecutive paragraphs into chunks for context.
        
        Args:
            paragraphs: List of Paragraph objects
            max_chunk_size: Maximum paragraphs per chunk
        
        Returns:
            List of paragraph chunks
        """
        chunks = []
        current_chunk = []
        
        for para in paragraphs:
            if para.classification != 'content':
                if current_chunk:
                    chunks.append(current_chunk)
                    current_chunk = []
                continue
            
            if len(current_chunk) >= max_chunk_size:
                chunks.append(current_chunk)
                current_chunk = []
            
            current_chunk.append(para)
        
        if current_chunk:
            chunks.append(current_chunk)
        
        return chunks
    
    def export_for_qa(self, paragraphs: List[Paragraph]) -> List[Dict]:
        """
        Export paragraphs in format suitable for QA extraction.
        
        Args:
            paragraphs: List of Paragraph objects
        
        Returns:
            List of dictionaries for QA processing
        """
        export = []
        for para in paragraphs:
            export.append({
                'text': para.text,
                'page': para.page_num,
                'id': para.para_num,
                'score': para.quality_score,
                'type': para.classification,
                'metadata': para.metadata
            })
        return export


def extract_and_filter(pdf_path: str, pages: List[int] = None, 
                       min_score: float = 60.0,
                       output_format: str = 'json') -> str:
    """
    Main function to extract and filter paragraphs from PDF.
    
    Args:
        pdf_path: Path to PDF file
        pages: Pages to extract (None for all)
        min_score: Minimum quality score
        output_format: Output format ('json' or 'text')
    
    Returns:
        JSON string or formatted text
    """
    extractor = ParagraphExtractor()
    
    logger.info(f"Extracting paragraphs from {pdf_path}")
    all_paragraphs = extractor.extract_from_pdf(pdf_path, pages)
    logger.info(f"Extracted {len(all_paragraphs)} total paragraphs")
    
    filtered = extractor.filter_paragraphs(all_paragraphs, min_score=min_score)
    logger.info(f"Filtered to {len(filtered)} quality paragraphs")
    
    type_counts = Counter(p.classification for p in all_paragraphs)
    logger.info(f"Paragraph types: {dict(type_counts)}")
    
    if output_format == 'json':
        export = extractor.export_for_qa(filtered)
        return json.dumps(export, indent=2)
    else:
        output = []
        for para in filtered:
            output.append(f"[Page {para.page_num}, Score: {para.quality_score:.1f}]")
            output.append(para.text)
            output.append("")
        return "\n".join(output)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python paragraph_extractor.py <pdf_path> [pages] [min_score]")
        sys.exit(1)
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
