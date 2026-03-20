# LegalGPT Local (Parallel Build)

This is a clean parallel project scaffold for:
- Flask backend
- PostgreSQL + pgvector
- Local Ollama models
- HTML + Tailwind + vanilla JS frontend

## Quick start

1. Create database and run schema

```sql
-- in psql
\i sql/schema.sql
```

2. Configure environment

```powershell
Copy-Item .env.example .env
```

3. Install dependencies

```powershell
pip install -r requirements.txt
```

4. Start Ollama models

```powershell
ollama pull qwen2.5:7b-instruct
ollama pull nomic-embed-text
```

5. Run app

```powershell
python run.py
```

Open http://localhost:5001

## Notes
- First admin can be created once via POST /api/auth/bootstrap-admin with secret `create-admin-once`.
- This scaffold keeps logic intentionally small and easy to extend.
- Upload flow is two-step right now: upload file, then index it from the Upload page button.
- Index endpoint is `POST /api/index/<document_id>`.
