#!/usr/bin/env python3
"""Serve KnowRight's static homepage and local legal-source search API."""

import json
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[3]
FRONTEND_DIR = ROOT / "app" / "frontend"
FRONTEND_BUILD_DIR = FRONTEND_DIR / "dist"
CORPUS_PATH = ROOT / "ai" / "ingestion" / "india_public_sources.jsonl"
MAX_REQUEST_BYTES = 32_768

sys.path.insert(0, str(ROOT))
from ai.retrieval.retrieve import load_corpus, search  # noqa: E402
from app.backend.src.services.assistant import (  # noqa: E402
    MAX_PROBLEM_CHARS,
    MAX_FOLLOW_UP_CHARS,
    ProviderError,
    create_assistant_result,
    provider_configured,
)


class KnowRightHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        static_dir = FRONTEND_BUILD_DIR if FRONTEND_BUILD_DIR.is_dir() else FRONTEND_DIR
        super().__init__(*args, directory=str(static_dir), **kwargs)

    def _send_json(self, status_code: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        request_path = urlsplit(self.path).path
        if request_path not in {"/api/questions", "/api/assistant"}:
            self._send_json(404, {"error": "API route not found."})
            return

        if self.headers.get_content_type() != "application/json":
            self._send_json(415, {"error": "Send the question as JSON."})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"error": "Invalid request length."})
            return
        if content_length < 1 or content_length > MAX_REQUEST_BYTES:
            self._send_json(413, {"error": "The request is empty or too large."})
            return

        try:
            payload = json.loads(self.rfile.read(content_length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self._send_json(400, {"error": "The request must contain valid JSON."})
            return
        if not isinstance(payload, dict):
            self._send_json(400, {"error": "The request must be a JSON object."})
            return

        if request_path == "/api/assistant":
            problem = payload.get("problem")
            jurisdiction = payload.get("jurisdiction")
            language = payload.get("language")
            follow_up = payload.get("follow_up", "")
            external_ai_consent = payload.get("external_ai_consent", False)
            if not isinstance(problem, str) or not problem.strip() or len(problem) > MAX_PROBLEM_CHARS:
                self._send_json(400, {"error": "Describe your problem in 1–6000 characters."})
                return
            if not isinstance(follow_up, str) or len(follow_up) > MAX_FOLLOW_UP_CHARS:
                self._send_json(400, {"error": f"Conversation context must be {MAX_FOLLOW_UP_CHARS} characters or fewer."})
                return
            if not isinstance(jurisdiction, str) or jurisdiction != "India (Central)":
                self._send_json(400, {"error": "This demo only supports India (Central) sources."})
                return
            if not isinstance(language, str) or language not in {"auto", "en", "hi", "te"}:
                self._send_json(400, {"error": "Choose English, Hindi, Telugu, or automatic language handling."})
                return
            resolved_language = language
            if language == "auto":
                if any("\u0900" <= char <= "\u097f" for char in problem):
                    resolved_language = "hi"
                elif any("\u0c00" <= char <= "\u0c7f" for char in problem):
                    resolved_language = "te"
                else:
                    resolved_language = "en"
            try:
                documents = load_corpus(CORPUS_PATH)
                result = create_assistant_result(
                    problem,
                    jurisdiction,
                    resolved_language,
                    follow_up,
                    external_ai_consent,
                    documents,
                )
            except ValueError as exc:
                self._send_json(400, {"error": str(exc)})
                return
            except ProviderError:
                self._send_json(
                    503,
                    {"error": "The configured AI provider is unavailable or invalid. No generated answer was produced."},
                )
                return
            except OSError:
                self._send_json(500, {"error": "The local source collection could not be searched."})
                return
            self._send_json(200, result)
            return

        question = payload.get("question")
        jurisdiction = payload.get("jurisdiction")
        if not isinstance(question, str) or not question.strip() or len(question) > 1000:
            self._send_json(400, {"error": "Enter a question of 1–1000 characters."})
            return
        if not isinstance(jurisdiction, str) or jurisdiction.strip() != "India (Central)":
            self._send_json(400, {"error": "This demo only searches India (Central) sources."})
            return

        try:
            documents = load_corpus(CORPUS_PATH)
            result = search(documents, question, jurisdiction)
        except (OSError, ValueError):
            self._send_json(500, {"error": "The local source collection could not be searched."})
            return
        self._send_json(200, result)

    def do_GET(self) -> None:
        request_path = urlsplit(self.path).path
        if request_path == "/api/sources":
            try:
                documents = load_corpus(CORPUS_PATH)
            except (OSError, ValueError):
                self._send_json(500, {"error": "The local source collection could not be loaded."})
                return
            sources = [
                {
                    "source_id": document.get("source_id"),
                    "title": document.get("title"),
                    "issuing_authority": document.get("issuing_authority"),
                    "jurisdiction": document.get("jurisdiction"),
                    "effective_date": document.get("effective_date"),
                    "publication_date": document.get("publication_date"),
                    "source_url": document.get("source_url"),
                    "source_type": document.get("source_type"),
                    "approval_status": document.get("approval_status"),
                    "synthetic_notice": document.get("synthetic_notice"),
                    "text": document.get("text"),
                }
                for document in documents
            ]
            self._send_json(200, {"sources": sources})
            return
        if request_path == "/api/status":
            try:
                configured = provider_configured()
                configuration_error = False
            except ProviderError:
                configured = False
                configuration_error = True
            self._send_json(
                200,
                {
                    "ai_provider_configured": configured,
                    "ai_provider_configuration_error": configuration_error,
                    "jurisdiction": "India (Central)",
                },
            )
            return
        if request_path.startswith("/api/"):
            self._send_json(404, {"error": "API route not found."})
            return
        if request_path == "/" and not FRONTEND_BUILD_DIR.is_dir():
            self.send_error(503, "Start the Vite frontend with npm run dev, or build it with npm run build.")
            return
        if FRONTEND_BUILD_DIR.is_dir() and not Path(self.translate_path(self.path)).is_file():
            self.path = "/index.html"
        super().do_GET()


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 8000), KnowRightHandler)
    print("KnowRight is available at http://127.0.0.1:8000 (local machine only).")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping KnowRight.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
