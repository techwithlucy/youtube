import json, re, random

SRC = "data.txt"
OUT = "train.jsonl"
MAX_RECORDS = 1200

MIN_CHUNK_WORDS = 260
MAX_CHUNK_WORDS = 420
MIN_PROMPT_WORDS = 90
MIN_RESPONSE_WORDS = 60
MAX_RESPONSE_WORDS = 220

PROMPTS = [
    "Write in my tone. Continue this draft:",
    "Write in my voice. Continue naturally:",
    "Continue this in my style:",
    "Keep the same tone and continue from here:",
    "Continue this newsletter in my voice:",
]

def clean_text(t: str) -> str:
    t = t.replace("\r\n", "\n").replace("\r", "\n")
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()

def paragraphs(text: str):
    paras = [p.strip() for p in text.split("\n\n") if p.strip()]
    paras = [p for p in paras if len(p) >= 80]
    return paras

def join_paras(paras):
    chunks = []
    buf_words = []

    for p in paras:
        w = p.split()
        if len(w) >= MAX_CHUNK_WORDS:
            if len(buf_words) >= MIN_CHUNK_WORDS:
                chunks.append(" ".join(buf_words))
            buf_words = []
            chunks.append(" ".join(w[:MAX_CHUNK_WORDS]))
            continue

        buf_words.extend(w)

        if len(buf_words) >= MIN_CHUNK_WORDS:
            chunks.append(" ".join(buf_words[:MAX_CHUNK_WORDS]))
            buf_words = buf_words[MAX_CHUNK_WORDS:]

    if len(buf_words) >= MIN_CHUNK_WORDS:
        chunks.append(" ".join(buf_words))

    return chunks

def make_pairs(chunk: str):
    words = chunk.split()
    if len(words) < (MIN_PROMPT_WORDS + MIN_RESPONSE_WORDS):
        return []

    cut_min = MIN_PROMPT_WORDS
    cut_max = min(len(words) - MIN_RESPONSE_WORDS, int(len(words) * 0.60))
    if cut_max <= cut_min:
        return []

    cut = random.randint(cut_min, cut_max)
    prompt_part = " ".join(words[:cut]).strip()
    resp_part = " ".join(words[cut:cut + MAX_RESPONSE_WORDS]).strip()

    if len(resp_part.split()) < MIN_RESPONSE_WORDS:
        return []

    return [(prompt_part, resp_part)]

def main():
    raw = open(SRC, "r", encoding="utf-8", errors="ignore").read()
    text = clean_text(raw)

    paras = paragraphs(text)
    print("Paragraphs kept:", len(paras))
    if paras:
        sizes = sorted([len(p.split()) for p in paras])
        print("Para words min/median/max:", sizes[0], sizes[len(sizes)//2], sizes[-1])

    random.shuffle(paras)
    chunks = join_paras(paras)
    print("Joined chunks:", len(chunks))
    if chunks:
        cs = sorted([len(c.split()) for c in chunks])
        print("Chunk words min/median/max:", cs[0], cs[len(cs)//2], cs[-1])

    records = []
    random.shuffle(chunks)

    for ch in chunks:
        pairs = make_pairs(ch)
        for inp, out in pairs:
            records.append({
                "prompt": random.choice(PROMPTS) + "\n\n" + inp,
                "response": out
            })
            if len(records) >= MAX_RECORDS:
                break
        if len(records) >= MAX_RECORDS:
            break

    with open(OUT, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print("Wrote:", OUT)
    print("Total records:", len(records))

    if len(records) == 0:
        print("\nStill 0 records — reduce MIN_CHUNK_WORDS/MIN_PROMPT_WORDS/MIN_RESPONSE_WORDS.\n")

if __name__ == "__main__":
    main()
