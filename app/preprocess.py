import re
import math
import emoji
import numpy as np
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer

STEMMER = PorterStemmer()

STOPWORDS = {
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'is', 'it', 'in', 'for',
    'on', 'that', 'this', 'with', 'as', 'at', 'by', 'from', 'so', 'if',
    'be', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might',
    'can', 'could', 'its', 'their', 'them', 'they', 'what', 'which', 'who',
    'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
    'just', 'also', 'about', 'above', 'after', 'again', 'against', 'below',
    'between', 'during', 'without', 'through', 'before', 'after', 'under',
    'over', 'out', 'off', 'up', 'down', 'into', 'onto', 'upon',
}


def clean_text(raw_text: str) -> str | None:
    text = raw_text.lower()
    text = BeautifulSoup(text, 'html.parser').get_text()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = emoji.demojize(text, language='en')
    text = re.sub(r':[a-z_]+:', lambda m: m.group(0).replace('_', ' ').strip(':'), text)
    text = re.sub(r"[^a-z0-9\s\.\!\?\']", '', text)
    words = text.split()
    processed = []
    i = 0
    while i < len(words):
        w = words[i].strip('.!?\',')
        if not w:
            i += 1
            continue
        if w in ('not', 'never', 'no') and i + 1 < len(words):
            nxt = words[i + 1].strip('.!?\',')
            processed.append(f'{nxt}_NEG')
            i += 2
            continue
        if w not in STOPWORDS:
            processed.append(STEMMER.stem(w))
        i += 1
    text = ' '.join(processed)
    text = re.sub(r'\s+', ' ', text).strip()
    return text if text else None


def extract_features(text: str) -> np.ndarray:
    words = text.split()
    num_words = len(words)
    avg_word_len = float(np.mean([len(w) for w in words])) if words else 0.0
    has_excl = 1.0 if '!' in text else 0.0
    has_ques = 1.0 if '?' in text else 0.0
    neg_count = float(sum(1 for w in words if w.endswith('_NEG')))
    pos_neg_ratio = math.log1p(neg_count) / math.log1p(num_words) if num_words > 0 else 0.0
    return np.array([num_words, avg_word_len, has_excl, has_ques, pos_neg_ratio], dtype=np.float64)
