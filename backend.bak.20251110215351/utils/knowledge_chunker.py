import os
import re
import time
import string
import json
import hashlib
import random
import textstat
import warnings
warnings.filterwarnings("ignore")
import pdfplumber
import logging
logging.getLogger("pdfplumber").setLevel(logging.ERROR)
import numpy as np
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

_HEADING_RE = re.compile(
    r"""^(
        (\d+(\.\d+){0,3}\s+)     
        |([A-Z][A-Za-z0-9&/\- ]{0,60}:?)  
        |([A-Z0-9][A-Z0-9 &/\-]{1,60})    
    )$""",
    re.X
)

def generate_hex_id(text=None):
    if text:
        h = hashlib.blake2s(text.encode('utf-8'), digest_size=3).hexdigest().upper()
        return f"#{h}"
    return f"#{random.getrandbits(24):06X}"

def normalized_flesch(text, min_words=50):
    try:
        if len(text.split()) < min_words:
            return 0.5
        fk = textstat.flesch_reading_ease(text)
        return max(0.0, min(1.0, (fk - 30) / 70))
    except Exception:
        return 0.5

def is_heading(text):
    t = text.strip()
    words = t.split()
    if len(words) > 15:
        return False
    return (
        (t.isupper() and len(words) <= 10) or
        (len(words) <= 10 and t.endswith(':')) or
        t.startswith('#') or
        bool(_HEADING_RE.match(t))
    )

def _coalesce_lines(lines):
    paras, buf = [], []
    for ln in lines:
        if not ln.strip():
            if buf:
                paras.append(" ".join(buf).strip())
                buf = []
            continue
        buf.append(ln.strip())
        if ln.strip().endswith(('.', '?', '!', ':')) and len(" ".join(buf).split()) >= 15:
            paras.append(" ".join(buf).strip())
            buf = []
    if buf:
        paras.append(" ".join(buf).strip())
    return paras

def extract_pdf_with_metadata(pdf_path):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")
    
    if os.path.getsize(pdf_path) > 50 * 1024 * 1024:
        raise ValueError("PDF exceeds 50MB size limit")
    
    pages_data = []
    with pdfplumber.open(pdf_path) as doc:
        for i, page in enumerate(doc.pages):
            text = page.extract_text() or ""
            if not text.strip():
                continue
            
            raw_lines = text.split('\n')
            paragraphs = _coalesce_lines(raw_lines)
            
            for p in paragraphs:
                if p.strip():
                    pages_data.append({
                        'text': p,
                        'page': i + 1,
                        'is_heading': is_heading(p)
                    })
    
    if not pages_data:
        raise ValueError("No text extracted from PDF. May be scanned image; consider OCR.")
    
    return pages_data

def calculate_page_number(para_pages):
    unique_pages = sorted(set(para_pages))
    if not unique_pages:
        return {"type": "none"}
    if len(unique_pages) == 1:
        return {"type": "single", "value": unique_pages[0]}
    is_continuous = (max(unique_pages) - min(unique_pages) == len(unique_pages) - 1)
    if is_continuous:
        return {"type": "range", "start": unique_pages[0], "end": unique_pages[-1]}
    return {"type": "set", "values": unique_pages}

def tfidf_keywords_simple(chunk, doc_chunks, k=8):
    def tokenize(s):
        words = re.findall(r'\b\w+\b', s.lower())
        return [w for w in words if w not in string.punctuation]
    
    docs = [set(tokenize(c)) for c in doc_chunks]
    words = tokenize(chunk)
    
    if not words:
        return []
    
    word_count = len(words)
    k_adaptive = min(10, max(5, int(word_count * 0.03)))
    k = min(k, k_adaptive)
    
    N = len(docs)
    tf = {}
    for w in words:
        tf[w] = tf.get(w, 0) + 1
    
    L = len(words)
    tf = {w: tf[w] / L for w in tf}
    
    df = {w: sum(1 for d in docs if w in d) or 1 for w in set(words)}
    
    scores = {w: tf[w] * np.log((N + 1) / (df[w] + 1)) for w in tf}
    
    return [w for w, _ in sorted(scores.items(), key=lambda x: x[1], reverse=True)[:k]]

def _group_paras(para_metadata, target_words=120, max_words=220):
    groups, buf, buf_pages, parent = [], [], [], None
    
    for para in para_metadata:
        if para['is_heading']:
            if buf:
                groups.append({
                    'text': ' '.join(buf),
                    'pages': buf_pages,
                    'parent_section': parent
                })
                buf, buf_pages = [], []
            parent = para['text']
            continue
        
        words = para['text'].split()
        if not words:
            continue
        
        buf += words
        buf_pages += [para['page']]
        
        if len(buf) >= target_words or (len(words) < 15 and para['text'].endswith(('.', ':'))):
            groups.append({
                'text': ' '.join(buf),
                'pages': buf_pages,
                'parent_section': parent
            })
            buf, buf_pages = [], []
        elif len(buf) >= max_words:
            groups.append({
                'text': ' '.join(buf),
                'pages': buf_pages,
                'parent_section': parent
            })
            buf, buf_pages = [], []
    
    if buf:
        groups.append({
            'text': ' '.join(buf),
            'pages': buf_pages,
            'parent_section': parent
        })
    
    return groups

def _validate_cfg(cfg):
    cfg = dict(cfg)
    chunk_size = int(cfg.get('chunk_size', 200))
    overlap = int(cfg.get('overlap', 20))
    
    chunk_size = min(2000, max(50, chunk_size))
    
    if overlap >= chunk_size:
        overlap = max(0, chunk_size // 4)
    
    cfg['chunk_size'] = chunk_size
    cfg['overlap'] = overlap
    cfg['max_features'] = cfg.get('max_features', 50000)
    cfg['keywords_k'] = cfg.get('keywords_k', 8)
    cfg['min_words_for_complexity'] = cfg.get('min_words_for_complexity', 50)
    
    return cfg

def chunk_document_improved(para_metadata, cfg):
    cfg = _validate_cfg(cfg)
    
    chunks = []
    all_chunk_data = []
    
    current_heading = None
    chunk_size = cfg['chunk_size']
    overlap = cfg['overlap']
    method = cfg.get('method', 'semantic')
    
    if method == 'fixed':
        words = []
        word_pages = []
        word_heads = []
        current_heading = None
        
        for para in para_metadata:
            if para['is_heading']:
                current_heading = para['text']
                continue
            
            para_words = para['text'].split()
            words.extend(para_words)
            word_pages.extend([para['page']] * len(para_words))
            word_heads.extend([current_heading] * len(para_words))
        
        step = max(1, chunk_size - overlap)
        idx = 0
        
        while idx < len(words):
            chunk_words = words[idx:idx+chunk_size]
            chunk_pages = word_pages[idx:idx+chunk_size]
            heads_slice = word_heads[idx:idx+chunk_size]
            
            parent_section = None
            if heads_slice:
                common = Counter(h for h in heads_slice if h).most_common(1)
                parent_section = common[0][0] if common else None
            
            chunk_text = ' '.join(chunk_words)
            if chunk_text.strip():
                all_chunk_data.append({
                    'text': chunk_text,
                    'pages': chunk_pages,
                    'parent_section': parent_section
                })
            
            idx += step
    
    elif method == 'semantic':
        all_chunk_data = _group_paras(para_metadata, target_words=120, max_words=220)
    
    elif method == 'hierarchical':
        for para in para_metadata:
            if para['is_heading']:
                current_heading = para['text']
            else:
                chunk_text = (current_heading + ": " + para['text']) if current_heading else para['text']
                all_chunk_data.append({
                    'text': chunk_text,
                    'pages': [para['page']],
                    'parent_section': current_heading
                })
    
    else:
        for para in para_metadata:
            if para['is_heading']:
                current_heading = para['text']
                continue
            
            all_chunk_data.append({
                'text': para['text'],
                'pages': [para['page']],
                'parent_section': current_heading
            })
    
    all_chunk_texts = [c['text'] for c in all_chunk_data]
    
    for idx, chunk_data in enumerate(all_chunk_data):
        complexity = normalized_flesch(
            chunk_data['text'], 
            min_words=cfg['min_words_for_complexity']
        ) if cfg.get('complexity_scoring') else 0.0
        
        keywords = tfidf_keywords_simple(
            chunk_data['text'], 
            all_chunk_texts, 
            k=cfg['keywords_k']
        ) if cfg.get('extract_keywords') else []
        
        page_number = calculate_page_number(chunk_data['pages'])
        knowledge_id = generate_hex_id(chunk_data['text'])
        
        chunk = {
            "knowledge_id": knowledge_id,
            "content": chunk_data['text'],
            "domain_id": cfg["domain_id"],
            "source_type": cfg["source_type"],
            "complexity_score": round(complexity, 2),
            "metadata": {
                "source_file": cfg["source_file"],
                "page_number": page_number,
                "chunk_index": idx,
                "keywords": keywords,
                "related_chunks": [],
                "parent_section": chunk_data['parent_section']
            }
        }
        chunks.append(chunk)
    
    if cfg.get('detect_related', True) and len(chunks) > 1:
        chunks = compute_related_chunks(chunks, cfg)
    
    return chunks

def compute_related_chunks(chunks, cfg):
    threshold_cosine = cfg.get('cosine_threshold', 0.7)
    threshold_keywords = cfg.get('keyword_overlap', 3)
    max_related = cfg.get('max_related', 10)
    max_features = cfg.get('max_features', 50000)
    
    texts = [c['content'] for c in chunks]
    keywords = [set(c['metadata'].get('keywords', [])) for c in chunks]
    parents = [c['metadata'].get('parent_section') for c in chunks]
    
    try:
        vectorizer = TfidfVectorizer(
            min_df=1, 
            ngram_range=(1, 2), 
            max_features=max_features
        )
        X = vectorizer.fit_transform(texts)
        sims = cosine_similarity(X)
    except Exception:
        sims = np.zeros((len(chunks), len(chunks)))
    
    for i in range(len(chunks)):
        cand = []
        for j in range(len(chunks)):
            if i == j:
                continue
            
            cos = float(sims[i, j]) if sims.size else 0.0
            kw_overlap = len(keywords[i] & keywords[j])
            same_parent = (parents[i] == parents[j])
            
            score = (
                (cos if cos > threshold_cosine else 0.0) +
                (1.0 if kw_overlap >= threshold_keywords else 0.0) +
                (0.5 if same_parent else 0.0)
            )
            
            if score > 0:
                cand.append((score, j))
        
        cand.sort(key=lambda x: x[0], reverse=True)
        chunks[i]['metadata']['related_chunks'] = [
            chunks[j]['knowledge_id'] for _, j in cand[:max_related]
        ]
    
    return chunks

def process_file(file_path, domain_id, method="semantic", chunk_size=200, overlap=20):
    try:
        source_type = "pdf" if file_path.lower().endswith(".pdf") else "text"
        source_file = os.path.basename(file_path)
        
        if source_type == "pdf":
            para_metadata = extract_pdf_with_metadata(file_path)
        else:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            with open(file_path, encoding="utf-8") as f:
                text = f.read()
                paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
                para_metadata = [
                    {'text': p, 'page': 1, 'is_heading': is_heading(p)}
                    for p in paragraphs
                ]
        
        cfg = {
            "method": method,
            "chunk_size": chunk_size,
            "overlap": overlap,
            "complexity_scoring": True,
            "extract_keywords": True,
            "detect_related": True,
            "cosine_threshold": 0.7,
            "keyword_overlap": 3,
            "max_related": 10,
            "max_features": 50000,
            "keywords_k": 8,
            "min_words_for_complexity": 50,
            "source_type": source_type,
            "domain_id": domain_id,
            "source_file": source_file
        }
        
        start = time.time()
        chunks = chunk_document_improved(para_metadata, cfg)
        processing_time = time.time() - start
        
        return {
            "status": "success",
            "total_chunks_returned": len(chunks),
            "chunks": chunks,
            "log": [f"Processed {source_file} in {processing_time:.2f}s"],
            "processing_time_ms": int(1000 * processing_time)
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "total_chunks_returned": 0,
            "chunks": [],
            "log": [f"Error processing file: {str(e)}"],
            "processing_time_ms": 0
        }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python knowledge_chunker.py <file_path> <domain_id> [method] [chunk_size] [overlap]")
        sys.exit(1)
    
    file_path = sys.argv[1]
    domain_id = sys.argv[2]
    
    try:
        method = sys.argv[3] if len(sys.argv) > 3 else "semantic"
        chunk_size = int(sys.argv[4]) if len(sys.argv) > 4 else 200
        overlap = int(sys.argv[5]) if len(sys.argv) > 5 else 20
    except ValueError:
        print("Error: chunk_size and overlap must be integers")
        sys.exit(1)
    
    result = process_file(file_path, domain_id, method, chunk_size, overlap)
    print(json.dumps(result, indent=2))
