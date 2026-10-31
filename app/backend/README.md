# Backend

`src/server.py` uses Python's standard library and the existing lexical source
retriever. It binds to `127.0.0.1`, does not call an AI model, and does not
send questions to an external service.

- `POST /api/questions` preserves the existing retrieval request and response
  contract.
- `GET /api/sources` returns the metadata and excerpts for source records
  already present in the local corpus.
- `POST /api/assistant` retrieves only approved passages and returns the
  single-page assistant response. Without provider configuration, it is
  retrieval-only. An optional backend-only OpenAI-compatible provider requires
  explicit user consent before external sharing.
- `GET /api/status` reports provider readiness without exposing credentials.
- When a production frontend build exists, the server serves it and falls
  back to `index.html` for client-side routes.

From the repository root, run `python app\backend\src\server.py`. For the
frontend development server, separately run `npm run dev`; Vite proxies
`/api` to this Python server.

Run backend tests with `python -m unittest discover -s app\backend\tests`.
Provider variables are `KNOWRIGHT_AI_BASE_URL`, `KNOWRIGHT_AI_API_KEY`, and
`KNOWRIGHT_AI_MODEL`. See the root README and safety documentation before
enabling external AI requests.
