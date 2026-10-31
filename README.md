# Know U Right

Know U Right is a public legal-information assistant for exploring everyday
questions in India. It helps people find and check source passages; it is not
a law firm and does not provide legal advice.

## Run locally

Requires Python 3.10+ and Node.js 20.19+ or 22.12+. Use two PowerShell
terminals from the repository root (`C:\knowright`).

**Terminal 1 — local Python API:**

```powershell
python app\backend\src\server.py
```

**Terminal 2 — frontend development server:**

```powershell
npm install
npm run dev
```

Open the local address printed by Vite (normally
`http://127.0.0.1:5173`). The Vite server proxies `/api` requests to
`http://127.0.0.1:8000`. By default, questions are searched locally. If an
operator configures a provider, the app requests consent before sending the
problem and retrieved passages to it. Leave out personal and sensitive
details.

The home page uses a guided, state-based conversation in
`app/frontend/src/components/GuidedLegalChat.tsx`. It asks one contextual
question at a time, offers quick replies, and displays a concise legal guidance
card with source links. Demo routes cover discrimination, consumer issues,
domestic-violence safety screening, RTI requests, and a general path. The demo
does not claim AI is active: it performs local retrieval unless an operator
configures a provider and the user explicitly consents to sending their details
and retrieved passages. Conversation history stays in the open page and is
cleared when restarted or reloaded.

The home navigation includes a Case studies tab with short Supreme Court case
summaries, judgment links, and a locally served Lady Justice image. The site
supports English, Hindi, and Telugu interface copy; changing languages does
not clear the current conversation.

The React app uses TypeScript, Vite, Tailwind CSS v4, Framer Motion for subtle
chat transitions, and the
shadcn-compatible `app/frontend/src/components/ui/` structure. Aliases use
`@/`, configured in Vite and TypeScript. Reusable UI styles live in
`app/frontend/src/styles/main.css`.

## Hero 3D model

The homepage and assistant hero share a lazy-loaded Sketchfab viewer in
`app/frontend/src/components/JusticeScene.tsx`. It displays the [Lady Justice
Sculpture by Vertice Studios](https://sketchfab.com/3d-models/lady-justice-sculpture-3f0a0054b1714a8490f37c58dc847a01)
with a transparent viewer background and subtle turntable spin. The model and
viewer are hosted by Sketchfab; the embed uses Sketchfab's `dnt=1` option to
disable embed analytics. The visible attribution links to the model page.
Loading the viewer requires an internet connection and makes requests to
Sketchfab. The model is labeled NoAI by its creator; this integration embeds
the hosted viewer and does not download or use the model for AI training.

## Production build

Build the static frontend:

```powershell
npm run build
```

Then run the Python server and open `http://127.0.0.1:8000`. The backend serves
the built app and supports refreshing nested routes when the build exists.

## Checks

```powershell
npm run typecheck
npm run build
python -m unittest discover -s app\backend\tests
```

## Coverage and limitations

By default, no AI provider is configured. The guided demo uses preset
conversation branches and searches approved passages in the local corpus; it
does not claim that local search is AI analysis. Interface copy is available in
English, Hindi, and Telugu. Retrieved source passages remain in their original
language. With a configured provider and explicit user consent, the request
asks for a draft in the selected interface language.

An optional OpenAI-compatible provider can be configured on the backend
through environment variables:

- `KNOWRIGHT_AI_BASE_URL` — HTTPS chat-completions endpoint.
- `KNOWRIGHT_AI_API_KEY` — secret bearer token; backend only.
- `KNOWRIGHT_AI_MODEL` — provider model name.

The API retrieves approved sources first. The frontend shows provider status
and requires explicit consent before sharing a problem, follow-up, and
retrieved passages with a configured external provider. Do not commit keys;
`.env.example` contains setting names only. See
[docs/safety-and-limitations.md](docs/safety-and-limitations.md) for privacy,
coverage, provider, and production-deployment limitations, and
[ai/README.md](ai/README.md) for corpus and retrieval details.
