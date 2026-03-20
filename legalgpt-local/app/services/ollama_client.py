import requests
from flask import current_app


def chat_with_ollama(messages):
    base = current_app.config["OLLAMA_BASE_URL"].rstrip("/")
    model = current_app.config["OLLAMA_CHAT_MODEL"]

    # 1) Native Ollama chat endpoint
    r = requests.post(
        f"{base}/api/chat",
        json={"model": model, "messages": messages, "stream": False},
        timeout=60,
    )
    if r.status_code < 400:
        data = r.json()
        return data.get("message", {}).get("content", "")

    # 2) OpenAI-compatible endpoint fallback
    r = requests.post(
        f"{base}/v1/chat/completions",
        json={"model": model, "messages": messages, "stream": False},
        timeout=60,
    )
    if r.status_code < 400:
        data = r.json()
        return (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )

    # 3) Old/generate-style fallback
    prompt = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])
    r = requests.post(
        f"{base}/api/generate",
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=60,
    )
    r.raise_for_status()
    data = r.json()
    return data.get("response", "")


def embed_texts(texts):
    base = current_app.config["OLLAMA_BASE_URL"].rstrip("/")
    model = current_app.config["OLLAMA_EMBED_MODEL"]
    vectors = []
    for t in texts:
        # 1) Legacy endpoint used by many Ollama versions
        r = requests.post(
            f"{base}/api/embeddings",
            json={"model": model, "prompt": t},
            timeout=60,
        )
        if r.status_code < 400:
            vectors.append(r.json().get("embedding", []))
            continue

        # 2) Newer endpoint fallback
        r = requests.post(
            f"{base}/api/embed",
            json={"model": model, "input": t},
            timeout=60,
        )
        r.raise_for_status()
        data = r.json()
        emb_list = data.get("embeddings") or []
        vectors.append(emb_list[0] if emb_list else [])
    return vectors
