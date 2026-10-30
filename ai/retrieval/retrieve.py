#!/usr/bin/env python3
"""Dependency-free BM25 retriever for a normalized legal-information corpus."""

import argparse
import json
import math
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

TOKEN_RE = re.compile(r"[a-z0-9]+", re.IGNORECASE)
SENTENCE_RE = re.compile(r"(?<=[.!?])\s+|\n+")
STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "the",
    "to", "was", "were", "what", "when", "where", "which", "who", "with",
}
MAX_PASSAGE_CHARS = 900
BM25_K1 = 1.5
BM25_B = 0.75


def _tokens(text: str) -> list[str]:
    return [
        token
        for token in TOKEN_RE.findall(text.casefold())
        if token not in STOP_WORDS
    ]


def _passages(text: str) -> list[str]:
    """Group nearby sentences into bounded passages without losing text."""
    sentences = [part.strip() for part in SENTENCE_RE.split(text) if part.strip()]
    passages: list[str] = []
    current = ""
    for sentence in sentences:
        while len(sentence) > MAX_PASSAGE_CHARS:
            if current:
                passages.append(current)
                current = ""
            passages.append(sentence[:MAX_PASSAGE_CHARS])
            sentence = sentence[MAX_PASSAGE_CHARS:]
        candidate = f"{current} {sentence}".strip()
        if current and len(candidate) > MAX_PASSAGE_CHARS:
            passages.append(current)
            current = sentence
        else:
            current = candidate
    if current:
        passages.append(current)
    return passages


def load_corpus(path: Path) -> list[dict[str, Any]]:
    documents = []
    with path.open("r", encoding="utf-8") as corpus_file:
        for line_number, line in enumerate(corpus_file, 1):
            if not line.strip():
                continue
            try:
                document = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"invalid corpus JSON on line {line_number}") from exc
            if not isinstance(document, dict) or not isinstance(document.get("text"), str):
                raise ValueError(f"invalid corpus record on line {line_number}")
            documents.append(document)
    return documents


def _bm25_score(
    query_tokens: list[str],
    token_counts: Counter[str],
    document_length: int,
    document_frequency: Counter[str],
    document_count: int,
    average_length: float,
) -> float:
    score = 0.0
    for term, query_frequency in Counter(query_tokens).items():
        term_frequency = token_counts[term]
        if not term_frequency:
            continue
        frequency = document_frequency[term]
        inverse_frequency = math.log1p(
            (document_count - frequency + 0.5) / (frequency + 0.5)
        )
        length_norm = 1 - BM25_B + BM25_B * document_length / average_length
        term_score = inverse_frequency * (
            term_frequency * (BM25_K1 + 1)
            / (term_frequency + BM25_K1 * length_norm)
        )
        score += query_frequency * term_score
    return score


def search(
    documents: list[dict[str, Any]],
    query: str,
    jurisdiction: str | None = None,
    limit: int = 5,
) -> dict[str, Any]:
    if not query.strip():
        raise ValueError("query must not be empty")
    if limit < 1:
        raise ValueError("limit must be at least 1")

    query_tokens = _tokens(query)
    if not query_tokens:
        raise ValueError("query must contain at least one searchable term")
    jurisdiction_missing = not (jurisdiction and jurisdiction.strip())
    eligible = documents
    if not jurisdiction_missing:
        target = jurisdiction.strip().casefold()
        eligible = [
            document
            for document in documents
            if str(document.get("jurisdiction", "")).casefold() == target
        ]

    passage_rows = []
    for document in eligible:
        for passage_index, passage in enumerate(_passages(str(document.get("text", ""))), 1):
            tokens = _tokens(passage)
            if tokens:
                passage_rows.append((document, passage_index, passage, tokens))

    if not passage_rows:
        return {
            "query": query,
            "jurisdiction": jurisdiction.strip() if not jurisdiction_missing else None,
            "jurisdiction_missing": jurisdiction_missing,
            "no_matching_sources": True,
            "hits": [],
        }

    document_frequency: Counter[str] = Counter()
    for _, _, _, tokens in passage_rows:
        document_frequency.update(set(tokens))
    average_length = sum(len(row[3]) for row in passage_rows) / len(passage_rows)

    best_by_source: dict[str, dict[str, Any]] = {}
    for document, passage_index, passage, tokens in passage_rows:
        score = _bm25_score(
            query_tokens,
            Counter(tokens),
            len(tokens),
            document_frequency,
            len(passage_rows),
            average_length,
        )
        if score <= 0:
            continue
        hit = {
            "source_id": document.get("source_id"),
            "passage_id": f"{document.get('source_id')}:{passage_index}",
            "title": document.get("title"),
            "issuing_authority": document.get("issuing_authority"),
            "jurisdiction": document.get("jurisdiction"),
            "effective_date": document.get("effective_date"),
            "publication_date": document.get("publication_date"),
            "source_url": document.get("source_url"),
            "source_type": document.get("source_type"),
            "approval_status": document.get("approval_status"),
            "synthetic_notice": document.get("synthetic_notice"),
            "passage": passage,
            "score": round(score, 6),
        }
        source_id = str(hit["source_id"])
        previous = best_by_source.get(source_id)
        if previous is None or hit["score"] > previous["score"]:
            best_by_source[source_id] = hit
    hits = list(best_by_source.values())
    hits.sort(key=lambda hit: (-hit["score"], str(hit["source_id"])))
    hits = hits[:limit]
    return {
        "query": query,
        "jurisdiction": jurisdiction.strip() if not jurisdiction_missing else None,
        "jurisdiction_missing": jurisdiction_missing,
        "no_matching_sources": not hits,
        "hits": hits,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", required=True, type=Path, help="Normalized corpus JSONL")
    parser.add_argument("--query", required=True, help="Question to search")
    parser.add_argument("--jurisdiction", help="Exact jurisdiction filter")
    parser.add_argument("--limit", type=int, default=5)
    args = parser.parse_args()
    try:
        result = search(load_corpus(args.corpus), args.query, args.jurisdiction, args.limit)
    except (OSError, ValueError) as exc:
        print(f"Retrieval failed: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
