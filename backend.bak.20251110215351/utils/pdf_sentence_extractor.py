#!/usr/bin/env python3
import re
import fitz  # PyMuPDF
import spacy

# Wikipedia-specific cleaners
CITATION_RE = re.compile(r"\[(?:\d+|[a-z])\]")
WIKI_URL_RE = re.compile(r"(https?://\S+|www\.\S+|\b\S+/wiki/\S+)")
PAGE_HUD_RE = re.compile(r"\b\d{1,3}/\d{1,3}\b(?:[^\S\r\n]+\d{1,2}/\d{1,2}/\d{2,4}(?:,\s*\d{1,2}:\d{2})?)?")
TIME_DATE_RE = re.compile(r"\b\d{1,2}:\d{2}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b")
CAPTION_POS_RE = re.compile(r"\((?:[^)]*\b(left|right|center)\b[^)]*)\)", re.IGNORECASE)
BRACKET_CHAIN_RE = re.compile(r"(?:\[[^\]]*\]){2,}")
WS_MULTI_RE = re.compile(r"[ \t]+")

def clean_wikipedia_text(s):
    t = s
    t = BRACKET_CHAIN_RE.sub("", t)
    t = CITATION_RE.sub("", t)
    t = WIKI_URL_RE.sub("", t)
    t = PAGE_HUD_RE.sub("", t)
    t = TIME_DATE_RE.sub("", t)
    t = CAPTION_POS_RE.sub("", t)
    t = re.sub(r"\[\s*\]", "", t)
    t = re.sub(r"[•|]+", " ", t)
    t = re.sub(r"\s+\n", "\n", t)
    t = re.sub(r"\n{2,}", "\n", t)
    t = WS_MULTI_RE.sub(" ", t)
    return t.strip()

# Line-joining heuristics
SENT_END = (".", "!", "?")
SOFT_END = (",", ";", ":")

def should_join(prev_line, next_line):
    p = prev_line.rstrip()
    n = next_line.lstrip()

    if not p:
        return False

    if p.endswith("-"):
        return True

    if p.endswith(SENT_END):
        return False

    if n and n[0].islower():
        return True

    if p.endswith(SOFT_END):
        return True

    if len(p) < 65:
        return True

    return False

DEHYPHEN_RE = re.compile(r"(\w+)-\s*\n\s*(\w+)")

def rejoin_lines(lines):
    buf = []
    for i, line in enumerate(lines):
        if not buf:
            buf.append(line)
            continue
        if should_join(buf[-1], line):
            if buf[-1].rstrip().endswith("-"):
                buf[-1] = buf[-1].rstrip()[:-1] + line.lstrip()
            else:
                buf[-1] = buf[-1].rstrip() + " " + line.lstrip()
        else:
            buf.append(line)
    para = "\n".join(buf)
    para = DEHYPHEN_RE.sub(r"\1\2", para)
    para = re.sub(r"[ \t]*\n[ \t]*", " ", para).strip()
    return para

# Columnization & block filtering
def is_header_or_footer(y0, y1, page_height, header_band=0.12, footer_band=0.12):
    top_thresh = page_height * header_band
    bot_thresh = page_height * (1 - footer_band)
    mid = (y0 + y1) / 2
    return mid < top_thresh or mid > bot_thresh

def extract_page_paragraphs(page):
    blocks = page.get_text("blocks")
    page_h = page.rect.height

    text_blocks = []
    for b in blocks:
        if len(b) < 5:
            continue
        x0, y0, x1, y1, text = b[:5]
        if not text or not text.strip():
            continue
        text_blocks.append((x0, y0, x1, y1, text))
    text_blocks.sort(key=lambda b: (round(b[1], 1), round(b[0], 1)))

    xs = sorted([b[0] for b in text_blocks])
    median_x0 = xs[len(xs)//2] if xs else 0

    left_col, right_col, single = [], [], []
    for x0, y0, x1, y1, txt in text_blocks:
        if is_header_or_footer(y0, y1, page_h):
            continue
        if len(txt.strip()) < 8:
            continue
        if x0 < median_x0 - 5:
            left_col.append((x0, y0, x1, y1, txt))
        elif x0 > median_x0 + 5:
            right_col.append((x0, y0, x1, y1, txt))
        else:
            single.append((x0, y0, x1, y1, txt))

    def assemble(blocks):
        paras = []
        cur_lines = []
        for x0, y0, x1, y1, txt in blocks:
            for ln in txt.splitlines():
                ln = ln.strip()
                if not ln:
                    if cur_lines:
                        paras.append(rejoin_lines(cur_lines))
                        cur_lines = []
                else:
                    cur_lines.append(ln)
        if cur_lines:
            paras.append(rejoin_lines(cur_lines))
        return paras

    paras = assemble(left_col) + assemble(single) + assemble(right_col)
    paras = [clean_wikipedia_text(p) for p in paras if p.strip()]
    paras = [p for p in paras if not re.match(r"^(?:See also|External links|References)\b", p)]
    return paras

def extract_sentences_from_pdf(pdf_path, page_selection=None):
    nlp = spacy.blank("en")
    nlp.add_pipe("sentencizer")
    sentences = []

    with fitz.open(pdf_path) as doc:
        pages_to_process = page_selection if page_selection else range(len(doc))
        
        for page_num in pages_to_process:
            if page_num >= len(doc):
                continue
            page = doc[page_num]
            paras = extract_page_paragraphs(page)
            for para in paras:
                if not para:
                    continue
                d = nlp(para)
                for s in d.sents:
                    sent = s.text.strip()
                    if len(sent) < 25:
                        continue
                    if re.search(r"https?://|www\.", sent):
                        continue
                    sentences.append(sent)

    uniq = []
    seen = set()
    for s in sentences:
        k = re.sub(r"\s+", " ", s)
        if k not in seen:
            seen.add(k)
            uniq.append(k)
    return uniq

def validate_sentences(sents):
    import statistics as stats
    n = len(sents)
    if n == 0:
        return {"count": 0, "avg_len": 0, "end_punct_rate": 0, "capital_rate": 0, "residual_bad": 0}
    
    ends = sum(s.endswith(('.', '!', '?')) for s in sents) / n
    caps = sum(s[:1].isupper() for s in sents if s) / n
    avg_len = stats.mean(len(s) for s in sents)
    bad = sum(bool(re.search(r"(wikipedia|https?://|\b\d+/\d+\b)", s.lower())) for s in sents)
    
    return {
        "count": n,
        "avg_len": round(avg_len, 1),
        "end_punct_rate": round(ends, 3),
        "capital_rate": round(caps, 3),
        "residual_bad": bad
    }
