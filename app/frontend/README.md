# Frontend

React, TypeScript, Vite, Tailwind CSS v4, and Framer Motion frontend for Know U
Right. The active guided assistant page is `src/pages/GuidedAssistantPage.tsx`;
its state-based conversation, quick replies, typing state, and source-linked
guidance card are in `src/components/GuidedLegalChat.tsx`. Shared layout and
navigation components live in `src/components/`, with shadcn-compatible UI
primitives in `src/components/ui/`. Global theme and component styles are in
`src/styles/main.css`; the `@/` alias resolves to `src/`.

The guided conversation has local demo routes for discrimination, consumer
issues, domestic-violence safety screening, RTI requests, and other situations.
It performs approved-source lookup in demo mode and does not claim that an AI
provider is configured. If a provider is configured, the user must opt in before
their problem and retrieved passages are sent. Chat is held in page memory and
is not persisted by default. The interface supports English, Hindi, and Telugu.

The home page includes a Case studies navigation tab and section with court-case
summaries, judgment links, and a supplied Lady Justice image.

Run `npm run dev` from the repository root. Start the Python API separately
with `python app\backend\src\server.py`; Vite proxies `/api` to port 8000.
See the root README for setup, production build, provider configuration, and
coverage limitations.

The homepage hero uses a lazy-loaded Sketchfab embed in
`src/components/JusticeScene.tsx`: [Lady Justice Sculpture by Vertice
Studios](https://sketchfab.com/3d-models/lady-justice-sculpture-3f0a0054b1714a8490f37c58dc847a01).
The viewer has a transparent background, subtle auto-spin, and a visible
creator attribution. It uses `dnt=1` and is hosted remotely, so loading the
viewer requires a network connection and contacts Sketchfab. The model is
labeled NoAI by its creator; the site embeds the hosted viewer and does not
download or use the model for AI training.

The supplied Lady Justice reference images remain in `design-reference/` and
are not used as hero artwork or served website assets.
