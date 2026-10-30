#!/usr/bin/env python3
"""Run deterministic retrieval and citation/jurisdiction/uncertainty checks."""

import argparse
import json
import sys
from pathlib import Path
from typing import Any

AI_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(AI_DIR / "retrieval"))
from retrieve import load_corpus, search  # noqa: E402


def load_cases(path: Path) -> list[dict[str, Any]]:
    cases = []
    with path.open("r", encoding="utf-8") as case_file:
        for line_number, line in enumerate(case_file, 1):
            if not line.strip():
                continue
            try:
                case = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"invalid evaluation JSON on line {line_number}") from exc
            if not isinstance(case, dict):
                raise ValueError(f"invalid evaluation case on line {line_number}")
            cases.append(case)
    return cases


def evaluate(corpus: list[dict[str, Any]], cases: list[dict[str, Any]]) -> tuple[int, int]:
    passed = 0
    failures = 0
    for case in cases:
        result = search(corpus, case["query"], case.get("jurisdiction"))
        actual_ids = [hit["source_id"] for hit in result["hits"]]
        checks = case["checks"]
        checks_ok = True
        if "citation_metadata" in checks:
            checks_ok &= all(
                hit.get(field)
                for hit in result["hits"]
                for field in ("source_id", "title", "issuing_authority", "jurisdiction", "source_url", "passage")
            )
        if "approved_public_source" in checks:
            checks_ok &= all(
                hit.get("source_type") == "approved_public"
                and hit.get("approval_status") == "approved"
                for hit in result["hits"]
            )
        if "jurisdiction_filter" in checks and case.get("jurisdiction"):
            checks_ok &= all(
                hit["jurisdiction"].casefold() == case["jurisdiction"].casefold()
                for hit in result["hits"]
            )
        if "jurisdiction_missing_flag" in checks:
            checks_ok &= result["jurisdiction_missing"]
        if "uncertainty_when_empty" in checks:
            checks_ok &= result["no_matching_sources"] and not result["hits"]

        expected_ids = case["expected_source_ids"]
        expected_found = all(source_id in actual_ids for source_id in expected_ids)
        if not expected_ids:
            expected_found &= result["no_matching_sources"]
        case_ok = expected_found and checks_ok
        print(f"{'PASS' if case_ok else 'FAIL'} {case['case_id']}: expected={case['expected_source_ids']} actual={actual_ids}")
        if case_ok:
            passed += 1
        else:
            failures += 1
    return passed, failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--corpus", type=Path, default=AI_DIR / "evaluation" / "corpus.jsonl")
    parser.add_argument("--cases", type=Path, default=AI_DIR / "evaluation" / "cases.jsonl")
    args = parser.parse_args()
    try:
        passed, failures = evaluate(load_corpus(args.corpus), load_cases(args.cases))
    except (OSError, KeyError, TypeError, ValueError) as exc:
        print(f"Evaluation failed: {exc}", file=sys.stderr)
        return 2
    print(f"{passed} passed; {failures} failed")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
