from .ollama_client import embed_texts
from ..models import vector_search


def retrieve_legal_context(query: str, limit=4):
    query_vec = embed_texts([query])[0]
    try:
        rows = vector_search(query_vec, limit=limit)
        return [row[0] for row in rows]
    except Exception:
        return []


def build_prompt(query: str, contexts: list[str], include_citations: bool = False):
    context_block = "\n\n".join(contexts[:4]) if contexts else "No trusted legal context found"
    citation_instruction = (
        "If the user asked for citations, add concise citations from provided context only."
        if include_citations
        else "Do not add citations unless the user explicitly asks for sources/citations."
    )
    return [
        {
            "role": "system",
            "content": (
                "You are a legal assistant for Indian law only. "
                "If the question is non-legal, politely refuse. "
                "For legal answers, keep it practical. "
                f"{citation_instruction}"
            ),
        },
        {"role": "user", "content": f"Context:\n{context_block}\n\nQuestion: {query}"},
    ]
