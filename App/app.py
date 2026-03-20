from pinecone import Pinecone, ServerlessSpec
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from groq import Groq
from tqdm import tqdm
import os
from dotenv import load_dotenv
import fitz  # PyMuPDF
from textwrap import wrap
from supabase import create_client, Client
import logging
from typing import Any

# ─── Logging ────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)  # DEBUG → INFO for production
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(
    app,
    resources={
        r"/*": {
            "origins": ["https://law-pal.vercel.app", "http://localhost:5173"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "X-User-ID"],
        }
    },
)

# ─── Clients ────────────────────────────────────────────────
PINECONE_API_KEY = os.getenv("PINECONE_API")
if not PINECONE_API_KEY:
    raise ValueError("Missing PINECONE_API key")

pc = Pinecone(api_key=PINECONE_API_KEY)

model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

GROQ_API_KEY = os.getenv("GROQ_API")
if not GROQ_API_KEY:
    raise ValueError("Missing GROQ_API key")
groq_client = Groq(api_key=GROQ_API_KEY)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# In-memory history (consider persisting later)
conversation_histories: dict[str, dict[str, list[Any]]] = {
    "personal-and-family-legal-assistance": {},
    "business-consumer-and-criminal-legal-assistance": {},
    "consultation": {},
}

# ─── Form Endpoint ──────────────────────────────────────────
@app.route("/submit-form", methods=["POST"])
def submit_form():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    required = ["firstName", "lastName", "email", "subject", "message"]
    if not all(f in data and data[f] for f in required):
        return jsonify({"error": "Missing or empty required fields"}), 400

    try:
        response = supabase.table("user_forms").insert(data).execute()
        if response.data:
            return jsonify({"message": "Form submitted successfully!"}), 201
        return jsonify({"error": "Failed to store in Supabase"}), 500
    except Exception as e:
        logger.exception("Supabase insert failed")
        return jsonify({"error": str(e)}), 500

# ─── PDF → Text Extraction ──────────────────────────────────
def extract_text_from_pdfs(bucket_name: str = "pdfs"):
    all_chunks = []
    CHUNK_SIZE = 1000

    try:
        files = supabase.storage.from_(bucket_name).list()
        if not files:
            logger.info(f"No files in bucket: {bucket_name}")
            return all_chunks
    except Exception as e:
        logger.error(f"Bucket list failed: {e}")
        return all_chunks

    for file in tqdm(files, desc="Processing PDFs"):
        name = file["name"]
        if not name.lower().endswith(".pdf"):
            continue

        try:
            pdf_bytes = supabase.storage.from_(bucket_name).download(name)
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")

            for page_num, page in enumerate(doc, 1):
                text = page.get_text("text").strip()
                if not text:
                    # fallback dict → rawdict
                    text = " ".join(
                        block.get("text", "")
                        for block in page.get_text("dict").get("blocks", [])
                        if block.get("type") == 0
                    ).strip()
                if not text:
                    continue

                chunks = wrap(text, CHUNK_SIZE)
                for i, chunk in enumerate(chunks):
                    if chunk.strip():
                        all_chunks.append(
                            {"filename": f"{name}_p{page_num}_c{i}", "text": chunk}
                        )
        except Exception as e:
            logger.error(f"Failed {name}: {e}")

    return all_chunks

# ─── Pinecone Index Setup (run once or via env flag) ────────
def setup_pinecone_index():
    INDEX_NAME = "lawpal"
    DIMENSION = 384  # paraphrase-multilingual-MiniLM-L12-v2

    # Modern way: list index names
    indexes = pc.list_indexes()
    index_names = [idx.name for idx in indexes]   # updated syntax 2025+

    if INDEX_NAME in index_names:
        index = pc.Index(INDEX_NAME)
        stats = index.describe_index_stats()
        if stats.get("total_vector_count", 0) > 0:
            logger.info(f"Index '{INDEX_NAME}' already has vectors → skipping upsert")
            return
    else:
        # Create serverless index (2025+ syntax)
        pc.create_index(
            name=INDEX_NAME,
            dimension=DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),  # change region if needed
        )
        logger.info(f"Created serverless index: {INDEX_NAME}")

    # Load & upsert
    docs = extract_text_from_pdfs()
    if not docs:
        logger.warning("No documents extracted → nothing to index")
        return

    texts = [d["text"] for d in docs]
    ids = [d["filename"] for d in docs]
    metadatas = [{"text": t} for t in texts]

    index = pc.Index(INDEX_NAME)
    BATCH_SIZE = 100

    for i in range(0, len(texts), 32):  # encode in smaller batches
        batch_texts = texts[i : i + 32]
        embeddings = model.encode(batch_texts, show_progress_bar=True)
        batch_vecs = [
            (ids[i + j], emb.tolist(), metadatas[i + j])
            for j, emb in enumerate(embeddings)
        ]

        for k in range(0, len(batch_vecs), BATCH_SIZE):
            index.upsert(vectors=batch_vecs[k : k + BATCH_SIZE])

    logger.info(f"Upserted {len(texts)} vectors into '{INDEX_NAME}'")

# ─── Retrieval & Generation ─────────────────────────────────
def retrieve_context(query: str, top_k: int = 4) -> list[str]:
    q_emb = model.encode(query).tolist()
    try:
        index = pc.Index("lawpal")
        res = index.query(vector=q_emb, top_k=top_k, include_metadata=True)
        return [m.metadata["text"] for m in res.matches if m.metadata and "text" in m.metadata]
    except Exception as e:
        logger.error(f"Pinecone query failed: {e}")
        return []


# ─── Service-specific personality configs ──────────────────
SERVICE_CONFIGS = {
    "personal-and-family-legal-assistance": {
        "label": "Personal & Family Legal Assistance",
        "domains": "marriage, divorce, child custody, adoption, domestic violence, property inheritance, tenancy disputes, wills, succession, and protection orders under Indian family law",
        "acts": "Hindu Marriage Act, Special Marriage Act, Hindu Succession Act, Protection of Women from Domestic Violence Act, Guardians and Wards Act, Transfer of Property Act",
    },
    "business-consumer-and-criminal-legal-assistance": {
        "label": "Business, Consumer & Criminal Legal Assistance",
        "domains": "business formation, contracts, intellectual property, consumer complaints, criminal defense, FIR procedures, bail, civil disputes, regulatory compliance, and corporate law",
        "acts": "Companies Act, Consumer Protection Act, Indian Penal Code, Code of Criminal Procedure, Intellectual Property laws, Contract Act, Competition Act",
    },
    "consultation": {
        "label": "General Legal Consultation",
        "domains": "any area of Indian law including civil, criminal, family, corporate, constitutional, consumer, and tax law",
        "acts": "Constitution of India and all applicable Indian statutes and legal frameworks",
    },
}

def generate_response(query: str, contexts: list, history: list, service: str):
    cfg = SERVICE_CONFIGS.get(service, SERVICE_CONFIGS["consultation"])
    ctx_str = "\n\n".join(f"[Legal Document {i+1}]:\n{c}" for i, c in enumerate(contexts)) if contexts else ""

    # ── System prompt: LawPal identity + service context ──
    system_prompt = f"""You are **LawPal AI**, an expert AI legal assistant embedded in the **LawPal platform** — India's AI-powered legal guidance service designed to make legal help accessible to every Indian citizen.

## Your Identity
- You are LawPal's dedicated AI for the **{cfg['label']}** service.
- You are knowledgeable, empathetic, and professional — like a trusted legal advisor speaking in plain language.
- You serve Indian citizens who may not have access to expensive lawyers.
- **LANGUAGE RULE (STRICT)**: Always respond in **English by default**. Only switch to another language (e.g. Hindi, Marathi) if the user's message is *entirely* written in that language. Never mix languages. Never use Hinglish.

## Your Expertise for This Service
You specialize in: {cfg['domains']}.
Key laws you reference: {cfg['acts']}.

## How You Respond
1. **Be specific to Indian law**: Always refer to relevant Indian statutes, sections, and legal procedures.
2. **Be helpful and clear**: Explain legal concepts in simple terms. Avoid unnecessary jargon.
3. **Be empathetic**: Users may be in distress. Acknowledge their situation before giving advice.
4. **Structure your answers**: Use bullet points, numbered steps, or headings when explaining procedures.
5. **Always recommend professional help** for serious matters: "For your specific case, consulting a licensed advocate is strongly recommended."
6. **Stay on-topic**: Only answer questions related to {cfg['label']}. Politely redirect off-topic queries.
7. **Never fabricate laws**: If you're unsure, say so honestly.

## Platform Context
- Users access you through the LawPal platform at law-pal.vercel.app
- This is a free, accessible legal guidance tool — not a substitute for actual legal representation.
- You may reference LawPal features like: document guidance, helpline numbers (1800-LAW-PAL), and connecting with lawyers.
{"## Relevant Legal Documents (from LawPal knowledge base)" + chr(10) + ctx_str if ctx_str else ""}"""

    # ── Build structured message history for Groq ──
    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    for msg in history[-10:]:  # last 10 turns for context window efficiency
        role = "assistant" if msg.get("role") == "bot" else "user"
        messages.append({"role": role, "content": msg.get("content", "")})

    messages.append({"role": "user", "content": query})

    try:
        resp = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=800,
            temperature=0.4,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq failed: {e}")
        return "I'm sorry, I'm having trouble responding right now. Please try again in a moment."



def handle_chat(service: str):
    if service not in conversation_histories:
        return jsonify({"error": "Invalid service"}), 400

    data = request.json or {}
    query = data.get("query")
    user_id = data.get("user_id", "default_user")

    if not query:
        return jsonify({"error": "No query"}), 400

    history = conversation_histories[service].setdefault(user_id, [])
    contexts = retrieve_context(query)
    response_text = generate_response(query, contexts, history, service)

    history.append({"role": "user", "content": query})
    history.append({"role": "bot", "content": response_text})

    # Keep last 15 turns
    if len(history) > 15:
        conversation_histories[service][user_id] = history[-15:]  # type: ignore[index]

    return jsonify({"response": response_text})

# Routes (chat + history)
@app.route("/<service>/chat", methods=["POST"])
def chat_service(service):
    return handle_chat(service)

@app.route("/<service>/history", methods=["GET"])
def get_chat_history(service):
    if service not in conversation_histories:
        return jsonify({"error": "Invalid service"}), 400

    user_id = request.headers.get("X-User-ID", "default_user")
    hist = conversation_histories[service].get(user_id, [])
    return jsonify({"history": hist})

# ─── Main ───────────────────────────────────────────────────
if __name__ == "__main__":
    # Only create/index once – better to run manually or via CI/CD
    if os.getenv("SETUP_PINECONE", "false").lower() == "true":
        setup_pinecone_index()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)