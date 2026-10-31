# Architecture

KnowRight's frontend, API, retrieval, and source corpus are separate
components. The frontend is React, TypeScript, Vite, and Tailwind CSS v4. The
single-page assistant keeps its form, clarifications, source-grounded result,
follow-ups, and local save/copy actions on the same URL.

- `app/frontend/src/pages/AssistantPage.tsx` provides the complete assistant
  flow. Shared header/footer navigation uses same-page anchors.
- `app/frontend/src/components/` contains shared layout and source UI.
  `components/ui/` is the shadcn-compatible home for reusable UI primitives.
  `src/styles/main.css` contains global Tailwind imports and the design system.
- The frontend service adapter calls the local JSON API. Vite proxies `/api`
  to the Python server during development.
- `app/backend/src/server.py` serves the API using Python's standard library
  and serves `app/frontend/dist/` after a production build. It binds to
  `127.0.0.1`; it does not call an AI service or log question text.
- `POST /api/questions` preserves the existing retrieval API.
  `POST /api/assistant` filters to approved records and retrieves before
  assembling a retrieval-only response or, only when configured and consented,
  calling a backend-only OpenAI-compatible provider adapter.
  `GET /api/sources` lists records; `GET /api/status` exposes provider
  readiness without credentials.
- `ai/prompts/legal_information_v1.txt` describes requirements for a future
  language-model integration; no model is connected in this demo.

The current corpus contains selected India-wide central-law summaries only.
It is not a comprehensive or state-specific collection. Retrieval results
need not be relevant or current; the interface labels them as source passages
and directs people to the original records. No legal advice is provided.

Run the backend with `python app/backend/src/server.py` and the frontend with
`npm run dev` from the repository root. See `README.md` for the two-terminal
workflow and production build. Run backend checks with
`python -m unittest discover -s app/backend/tests`.
