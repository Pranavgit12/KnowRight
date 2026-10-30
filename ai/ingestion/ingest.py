#!/usr/bin/env python3
"""Validate and normalize explicitly approved public or labeled synthetic sources."""

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


SYNTHETIC_NOTICE = "SYNTHETIC - NOT A REAL LEGAL SOURCE"
REQUIRED_TEXT_FIELDS = (
    "source_id",
    "title",
    "issuing_authority",
    "jurisdiction",
    "source_type",
    "source_url",
    "text",
)
OPTIONAL_DATE_FIELDS = ("effective_date", "publication_date")


def _nonempty_string(record: dict[str, Any], field: str) -> str:
    value = record.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field} must be a non-empty string")
    return value.strip()


def validate_record(record: Any) -> dict[str, Any]:
    if not isinstance(record, dict):
        raise ValueError("each JSONL record must be an object")

    normalized = {
        field: _nonempty_string(record, field) for field in REQUIRED_TEXT_FIELDS
    }
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,99}", normalized["source_id"]):
        raise ValueError("source_id must contain only letters, digits, dot, underscore, or hyphen")

    source_type = normalized["source_type"]
    if source_type == "approved_public":
        if record.get("approval_status") != "approved":
            raise ValueError("approved_public records require approval_status='approved'")
        parsed_url = urlparse(normalized["source_url"])
        # urllib.parse parses URL components but deliberately does not validate
        # them. Apply explicit checks before accepting a provenance URL.
        try:
            valid_port = parsed_url.port is None or 1 <= parsed_url.port <= 65535
        except ValueError:
            valid_port = False
        if (
            parsed_url.scheme.casefold() != "https"
            or not parsed_url.hostname
            or parsed_url.username is not None
            or parsed_url.password is not None
            or not valid_port
            or any(character.isspace() for character in normalized["source_url"])
        ):
            raise ValueError("approved_public source_url must be a valid HTTPS URL without credentials or whitespace")
        normalized["approval_status"] = "approved"
    elif source_type == "synthetic":
        if record.get("synthetic_notice") != SYNTHETIC_NOTICE:
            raise ValueError(f"synthetic records require synthetic_notice='{SYNTHETIC_NOTICE}'")
        normalized["synthetic_notice"] = SYNTHETIC_NOTICE
    else:
        raise ValueError("source_type must be 'approved_public' or 'synthetic'")

    for field in OPTIONAL_DATE_FIELDS:
        value = record.get(field)
        if value is not None:
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{field} must be an ISO date string or null")
            try:
                date.fromisoformat(value.strip())
            except ValueError as exc:
                raise ValueError(f"{field} must be an ISO date (YYYY-MM-DD)") from exc
            normalized[field] = value.strip()
        else:
            normalized[field] = None

    return normalized


def ingest(input_path: Path, output_path: Path) -> int:
    records = []
    with input_path.open("r", encoding="utf-8") as source_file:
        for line_number, line in enumerate(source_file, 1):
            if not line.strip():
                continue
            try:
                records.append(validate_record(json.loads(line)))
            except (json.JSONDecodeError, ValueError) as exc:
                raise ValueError(f"line {line_number}: {exc}") from exc

    if not records:
        raise ValueError("input contains no source records")
    ids = [record["source_id"] for record in records]
    if len(set(ids)) != len(ids):
        raise ValueError("source_id values must be unique")

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="\n") as destination:
        for record in records:
            destination.write(json.dumps(record, ensure_ascii=False) + "\n")
    return len(records)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Source JSONL")
    parser.add_argument("--output", required=True, type=Path, help="Normalized corpus JSONL")
    args = parser.parse_args()
    try:
        count = ingest(args.input, args.output)
    except (OSError, ValueError) as exc:
        print(f"Ingestion failed: {exc}", file=sys.stderr)
        return 1
    print(f"Ingested {count} source record(s) into {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
