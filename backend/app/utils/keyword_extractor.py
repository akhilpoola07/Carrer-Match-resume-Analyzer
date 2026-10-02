"""Keyword extraction with stop-word filtering."""

import re
from collections import Counter

STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "at", "by",
    "for", "with", "about", "against", "between", "into", "through", "during",
    "before", "after", "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "once", "here", "there",
    "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can",
    "will", "just", "don", "should", "now", "of", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "having", "this",
    "that", "these", "those", "i", "me", "my", "we", "our", "you", "your", "he",
    "she", "it", "they", "them", "their", "what", "which", "who", "whom", "as",
    "until", "while", "because", "although", "though", "where", "how", "why",
    "also", "using", "use", "used", "work", "working", "role", "job", "team",
    "strong", "good", "great", "required", "requirements", "preferred",
    "experience", "years", "year", "including", "include", "ability", "able",
    "must", "etc", "etcetera", "well", "within", "across", "based", "related",
    "knowledge", "skills", "skill", "candidate", "position", "company",
}


def extract_important_keywords(text: str, limit: int = 30) -> list[str]:
    if not text:
        return []

    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9+#]*(?:\.[a-zA-Z0-9+#]+)*", text.lower())
    filtered = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    counts = Counter(filtered)
    # Prefer frequent, longer tokens slightly for ranking
    ranked = sorted(counts.items(), key=lambda x: (x[1], len(x[0])), reverse=True)
    keywords = []
    seen = set()
    for word, _ in ranked:
        if word not in seen:
            keywords.append(word)
            seen.add(word)
        if len(keywords) >= limit:
            break
    return keywords
