# AI component

This is a small, dependency-free legal-information demo. It ingests a local
JSONL corpus, retrieves matching passages, and provides a versioned prompt for
an application to use with a language model. It does not call an LLM or fetch
sources at runtime and is not a legal-advice service.

The default public-source starter corpus covers selected sections from three
India-wide central Acts: consumer protection, right to information, and
domestic violence. It is not a comprehensive or state-specific
legal corpus. Source discovery candidates are listed in [the data source
registry](../data/source-registry/README.md); they are separate from the
downloaded excerpts here and must be reviewed before ingestion.

## Setup and run

Requires Python 3.9+; no packages need to be installed. Run commands from the
repository root in PowerShell:

```powershell
python ai\ingestion\ingest.py --input ai\ingestion\india_public_sources.jsonl --output ai\evaluation\corpus.jsonl
python ai\retrieval\retrieve.py --corpus ai\evaluation\corpus.jsonl --query "How long to file a consumer complaint?" --jurisdiction "India (Central)"
python ai\evaluation\evaluate.py
```

Ingestion writes normalized JSON Lines. Retrieval prints JSON containing
matched passages and source references. An omitted jurisdiction is surfaced
as `jurisdiction_missing`; a jurisdiction supplied by the caller is an exact,
case-insensitive filter. No hits are returned when that filter excludes the
available sources.

## Adding sources safely

The bundled `ai/ingestion/synthetic_sources.jsonl` record is expressly
fictional and is not an authoritative legal source. It exists only to exercise
the pipeline. Never present its content as law or as a real authority.

`ai/ingestion/india_public_sources.jsonl` contains 11 short, section-level
summaries checked against official India Code records on 2026-10-31. Each
record retains the Act section, issuing ministry, central jurisdiction, issue
date, and official section URL. The summaries are not full statutory text.
Dates are drawn from India Code's `dc.date.issued`; effective dates are null
because the selected records do not establish when every provision took
effect. The `approved` marker records this demo's source selection; it is not
a copyright or legal-clearance determination.

To ingest additional material, provide one JSON object per line with:

- `source_id`, `title`, `issuing_authority`, `jurisdiction`, `source_type`,
  `source_url`, and `text`;
- `effective_date` and `publication_date` as `YYYY-MM-DD` strings when
  available, otherwise `null`;
- for `approved_public`, `approval_status: "approved"` and an HTTPS URL;
- for `synthetic`, `synthetic_notice: "SYNTHETIC - NOT A REAL LEGAL SOURCE"`.

The ingestion tool validates required fields, dates, URLs, explicit approval
status, and synthetic labels. It cannot verify that a URL is official, that
content is public-domain/permitted, or that a human approval is valid. Only
ingest materials that your project has independently confirmed are public and
approved for use. URL parsing is followed by explicit HTTPS, host, credential,
port, and whitespace checks; URL parsing itself is not proof a site is
trustworthy. It performs no web fetching. Do not put user questions,
personal information, confidential text, or credentials in the corpus or
evaluation files; the tools do not log source text on success or failure.

## Prompt and integration

Use `ai/prompts/legal_information_v1.txt` (version 1.0.0) as the generation
prompt. Supply the user question, retrieval result, and whether jurisdiction
was provided. The prompt requires plain-language explanations, source
citations, jurisdiction clarification, and explicit uncertainty. The caller
must preserve citation metadata when passing retrieved records to a model.

## Evaluation

`ai/evaluation/cases.jsonl` is a small deterministic regression set. The
evaluation checks expected retrieval sources, citation metadata, approved
source labels, strict jurisdiction filtering, missing-jurisdiction signaling,
and empty-result uncertainty. Run it with `python ai\evaluation\evaluate.py`
after generating the corpus as shown above. The checks exercise retrieval and
prompt preconditions; they do not measure generated answer quality or prove
legal correctness.

## Limitations

Retrieval uses a small dependency-free BM25 lexical ranker over bounded
sentence passages. It is not semantic search, a trained legal model, or
authoritative legal research. This starter corpus covers only selected
provisions in three central Acts; it is not enough for general-purpose Indian
legal Q&A, state-specific law, case law, or current legal advice. Date
presence does not establish that a source is current or in force. A production
system would need maintained and reviewed sources, provenance and update
processes, jurisdiction-specific validation, privacy controls, and evaluation
of the chosen model's outputs.

## Research references checked 2026-10-31

- [India Code](https://www.indiacode.gov.in/) provides the official section
  records linked from the bundled excerpts. The records were checked on
  2026-10-31; they do not establish that every provision is current or
  applicable to a particular situation.
- [Legislative Department documents](https://www.legislative.gov.in/documents)
  lists materials published by India's Legislative Department. Portal presence
  alone does not establish current force or applicability.
- [EUR-Lex about page](https://eur-lex.europa.eu/content/welcome/about.html?locale=en)
  describes EU treaties, legal acts, case law, and related materials, including
  references to national measures in some records. Check each record's scope.
- [eCFR](https://www.ecfr.gov/) describes a continuously updated online CFR
  version and notes it is not the official legal edition. The registry limits
  this candidate to U.S. federal regulations.
- [Python `argparse` documentation](https://docs.python.org/3/library/argparse.html)
  supports the standard-library CLI approach used by the scripts.
- [Python `urllib.parse` documentation](https://docs.python.org/3/library/urllib.parse.html#url-parsing-security)
  explicitly cautions that parsing URL components is not input validation;
  ingestion therefore adds its own checks and still cannot establish source
  trustworthiness.
