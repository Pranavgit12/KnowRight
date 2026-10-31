# KnowRight frontend prototype

An isolated React + Vite frontend prototype for KnowRight. This folder does
not include or change the backend. Its API client uses the existing local
contract:

- `GET /api/status`
- `POST /api/assistant`
- `GET /api/sources`

The Vite development server proxies `/api` to `http://127.0.0.1:8000` by
default. Set `VITE_API_PROXY_TARGET` to override the local proxy target. No
secret key belongs in frontend environment variables.

## Run locally

From `trail\app\frontend`:

```powershell
npm install
npm run dev
```

If running against the repository's existing backend, open another terminal
from the repository root and run:

```powershell
python app\backend\src\server.py
```

Open the address printed by Vite (normally `http://127.0.0.1:5173`). If the
backend is unavailable, the interface reports that fact and does not show
fabricated legal answers.

Build and preview:

```powershell
npm run build
npm run preview
```

## Pages and interaction

- `/` — editorial landing page, topic cards, how-it-works, and source overview.
- `/assistant` — validated problem form, location/topic/language inputs, and
  optional local-only document selection (the file is not uploaded).
- `/results` — eight-part results workspace with source passages, a checklist,
  editable problem summary, and contextual follow-up search. Case details are
  held in memory only; a refresh clears them rather than saving case text.
- `/sources` — source records returned by the existing API.
- `/help` — purpose, privacy notes, and limitations.

The backend currently searches selected India-wide central-law records only.
The state/territory input provides context but does not expand backend source
coverage. Provider-generated text, when available, is marked as unverified;
the interface does not label a source “verified” merely because it has a URL.
If the API or provider is unavailable, the app displays an error/limitation
instead of substituting a made-up answer.

The project uses CSS/SVG-like dimensional artwork, no large 3D dependency,
responsive keyboard-accessible controls, visible focus states, and reduced
motion styling.
