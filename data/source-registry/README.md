
# Source registry
`sources.json` is a shortlist of government or intergovernmental legal portals
for discovery. It is not an approved corpus, and no law text is bundled here.
Each entry remains `candidate_requires_document_level_review`. Before any
document is ingested, a reviewer must record the exact document URL, title,
issuing authority, jurisdiction, publication/effective date when available,
version or current status, and reuse terms. Then set the ingestion record's
`approval_status` only after that review. Do not infer approval from the portal
being official.

Coverage differs by portal: India Code describes ministry-provided Government
of India materials; EUR-Lex is for EU legal information and references to some
national materials; eCFR covers U.S. federal regulations, not state law. These
portals are not interchangeable and must never be searched without a
jurisdiction decision when the answer depends on location.

The registry was checked on 2026-10-31 against the portal descriptions linked
in `ai/README.md`. Portal scope and status can change; check again when adding
or refreshing documents.
