# API Contract

The local Python server exposes `POST /api/questions` on
`http://127.0.0.1:8000`. It accepts only JSON and supports the exact
`India (Central)` jurisdiction in the current demo.

Request:

```json
{
  "question": "What does the source say about an information request?",
  "jurisdiction": "India (Central)"
}
```

`question` must contain 1–1000 characters after trimming. The server returns
the existing retriever result shape: `query`, `jurisdiction`,
`jurisdiction_missing`, `no_matching_sources`, and `hits`. Each hit includes
the passage, source title and ID, issuing authority, jurisdiction, available
dates, source URL, and source-type metadata. An empty `hits` list means this
small corpus found no keyword match; it is not evidence that no legal source
exists.

Errors use a JSON object with an `error` string and an appropriate 4xx or 5xx
status. Requests to this legacy question endpoint are handled locally, are not
sent to an AI service, and are not written to application logs. Do not send
sensitive or identifying details.

## Source list

`GET /api/sources` returns `{"sources": [...]}` from the same local JSONL
corpus. Each record includes its source ID, title, issuing authority,
jurisdiction, available dates, source URL, source type, approval/synthetic
label where present, and summary text. This endpoint does not fetch or verify
external sources.

## Single-page assistant

`GET /api/status` returns provider readiness without returning credentials:

```json
{
  "ai_provider_configured": false,
  "ai_provider_configuration_error": false,
  "jurisdiction": "India (Central)"
}
```

`POST /api/assistant` accepts `problem` (1–6000 characters),
`follow_up` (optional, at most 2000 characters), `jurisdiction` (exactly
`India (Central)`), `language` (`auto`, `en`, or `hi`), and
`external_ai_consent` (boolean). `auto` detects Hindi when Devanagari
characters are present; otherwise it selects English.

The response contains `mode` (`retrieval_only`, `clarification_required`, or
`ai_assisted`), `category`, `clarification_questions`, the nine named
`sections`, approved `hits` with full source metadata, `no_matching_sources`,
provider availability, and a privacy notice. A configured provider is called
only after explicit consent, and only after retrieval from approved records.
AI section citations must refer to returned approved source IDs. Provider
errors return generic messages; they do not fall back to a purported generated
answer. When no provider is configured, the response explicitly labels the
result retrieval-only and fills sections with limitations, not invented legal
analysis.

Responses and questions are not persisted by the API. The client can
optionally copy, download, or print a result on the user's device.
