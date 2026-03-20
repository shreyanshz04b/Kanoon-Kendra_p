LEGAL_HINTS = [
    "act", "section", "clause", "property", "land", "lease", "rent", "registration",
    "stamp", "rera", "title", "mutation", "encumbrance", "fir", "bail", "legal",
    "ownership", "co ownership", "co-ownership", "tenant", "landlord", "sale deed",
    "agreement", "contract", "advocate", "law", "court", "judge", "order", "appeal",
    "injunction", "succession", "inheritance", "partition", "will", "gpa", "power of attorney"
]

BLOCK_HINTS = [
    "ignore previous", "system prompt", "jailbreak", "bypass", "hack", "malware"
]


def classify_query(text: str) -> str:
    lowered = (text or "").strip().lower()
    if not lowered:
        return "NON_LEGAL"
    if any(x in lowered for x in BLOCK_HINTS):
        return "UNSAFE"

    # Normalize separators for better phrase matching (e.g., co-ownership -> co ownership).
    normalized = lowered.replace("-", " ").replace("/", " ")

    if any(x in normalized for x in LEGAL_HINTS):
        return "LEGAL"

    # Fallback: short legal phrase checks to reduce false negatives.
    legal_phrases = (
        "what is",
        "is it legal",
        "legal notice",
        "property dispute",
        "ownership rights",
        "agreement validity",
    )
    if any(p in normalized for p in legal_phrases):
        return "LEGAL"

    return "NON_LEGAL"
