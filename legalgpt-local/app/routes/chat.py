from flask import Blueprint, request, jsonify, session
from ..services.guardrails import classify_query
from ..services.rag import retrieve_legal_context, build_prompt
from ..services.ollama_client import chat_with_ollama

chat_bp = Blueprint("chat", __name__)


def _citations_requested(query: str) -> bool:
    q = query.lower()
    prompts = (
        "cite",
        "citation",
        "source",
        "sources",
        "reference",
        "references",
        "with section",
        "show section",
        "case law",
    )
    return any(p in q for p in prompts)


@chat_bp.post("/chat")
def chat():
    if not session.get("user_id"):
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True)
    query = (data.get("query") or "").strip()
    if not query:
        return jsonify({"error": "Query required"}), 400

    query_type = classify_query(query)
    if query_type == "UNSAFE":
        return jsonify({"response": "Request blocked by safety guardrails."}), 400

    contexts = retrieve_legal_context(query, limit=4)
    include_citations = _citations_requested(query)
    messages = build_prompt(query, contexts, include_citations=include_citations)
    answer = chat_with_ollama(messages)

    payload = {"response": answer}
    if include_citations:
        payload["citations"] = contexts[:3]
    return jsonify(payload)
