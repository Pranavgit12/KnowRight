import json
import os
import threading
import unittest
from http.server import ThreadingHTTPServer
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from unittest.mock import MagicMock, patch

from app.backend.src.server import FRONTEND_BUILD_DIR, KnowRightHandler


class QuestionApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), KnowRightHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, payload, content_type="application/json", path="/api/questions"):
        request = Request(
            f"{self.base_url}{path}",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": content_type},
            method="POST",
        )
        try:
            response = urlopen(request)
        except HTTPError as error:
            with error:
                return error.code, json.loads(error.read())
        with response:
            return response.status, json.loads(response.read())

    def assistant_request(self, **payload):
        return self.request(payload, path="/api/assistant")

    def test_assistant_status_does_not_expose_provider_credentials(self):
        with patch.dict(os.environ, {
            "KNOWRIGHT_AI_BASE_URL": "",
            "KNOWRIGHT_AI_API_KEY": "",
            "KNOWRIGHT_AI_MODEL": "",
        }):
            with urlopen(f"{self.base_url}/api/status") as response:
                status = json.loads(response.read())

        self.assertEqual(response.status, 200)
        self.assertFalse(status["ai_provider_configured"])
        self.assertNotIn("api_key", status)

    def test_assistant_returns_nine_honest_retrieval_only_sections(self):
        with patch.dict(os.environ, {
            "KNOWRIGHT_AI_BASE_URL": "",
            "KNOWRIGHT_AI_API_KEY": "",
            "KNOWRIGHT_AI_MODEL": "",
        }):
            status, result = self.assistant_request(
                problem="I have an RTI information request question in Delhi in 2024.",
                jurisdiction="India (Central)",
                language="auto",
            )

        self.assertEqual(status, 200)
        self.assertEqual(result["mode"], "retrieval_only")
        self.assertEqual(result["language"], "en")
        self.assertEqual(
            set(result["sections"]),
            {"understanding", "issue", "rights", "solutions", "action_plan",
             "documents", "help", "precautions", "next_step"},
        )
        self.assertTrue(result["hits"])
        self.assertTrue(all(hit["approval_status"] == "approved" for hit in result["hits"]))
        self.assertIn("not an interpretation", result["sections"]["rights"])

    def test_assistant_validates_jurisdiction_and_language(self):
        status, result = self.assistant_request(
            problem="A question",
            jurisdiction="Somewhere else",
            language="en",
        )
        self.assertEqual(status, 400)
        self.assertIn("India (Central)", result["error"])

        status, result = self.assistant_request(
            problem="A question",
            jurisdiction="India (Central)",
            language="fr",
        )
        self.assertEqual(status, 400)
        self.assertIn("English, Hindi", result["error"])

    def test_assistant_detects_hindi_and_handles_missing_sources_honestly(self):
        with patch.dict(os.environ, {
            "KNOWRIGHT_AI_BASE_URL": "",
            "KNOWRIGHT_AI_API_KEY": "",
            "KNOWRIGHT_AI_MODEL": "",
        }):
            status, result = self.assistant_request(
                problem="मुझे जानकारी चाहिए",
                jurisdiction="India (Central)",
                language="auto",
            )

        self.assertEqual(status, 200, result)
        self.assertEqual(result["language"], "hi")
        self.assertTrue(result["no_matching_sources"])
        self.assertIn("could not verify", result["sections"]["rights"])

    def test_configured_provider_requires_explicit_consent(self):
        with patch.dict(os.environ, {
            "KNOWRIGHT_AI_BASE_URL": "https://provider.example/v1/chat/completions",
            "KNOWRIGHT_AI_API_KEY": "test-key-not-a-real-secret",
            "KNOWRIGHT_AI_MODEL": "test-model",
        }):
            status, result = self.assistant_request(
                problem="I have an RTI information request question in Delhi in 2024.",
                jurisdiction="India (Central)",
                language="en",
            )

        self.assertEqual(status, 400)
        self.assertIn("Confirm", result["error"])

    def test_configured_provider_receives_bearer_key_only_after_consent(self):
        problem = "I have an RTI information request question in Delhi in 2024."
        with patch.dict(os.environ, {
            "KNOWRIGHT_AI_BASE_URL": "",
            "KNOWRIGHT_AI_API_KEY": "",
            "KNOWRIGHT_AI_MODEL": "",
        }):
            _, retrieved = self.assistant_request(
                problem=problem,
                jurisdiction="India (Central)",
                language="en",
            )
        source_id = retrieved["hits"][0]["source_id"]
        with patch.dict(os.environ, {
            "KNOWRIGHT_AI_BASE_URL": "https://provider.example/v1/chat/completions",
            "KNOWRIGHT_AI_API_KEY": "test-key-not-a-real-secret",
            "KNOWRIGHT_AI_MODEL": "test-model",
        }):
            answer = {
                key: f"Information based on the source [{source_id}]"
                for key in (
                    "understanding", "issue", "rights", "solutions", "action_plan",
                    "documents", "help", "precautions", "next_step",
                )
            }
            provider_response = MagicMock()
            provider_response.__enter__.return_value.read.return_value = json.dumps({
                "choices": [{"message": {"content": json.dumps(answer)}}],
            }).encode()
            with patch(
                "app.backend.src.services.assistant.urllib.request.urlopen",
                return_value=provider_response,
            ) as provider_call:
                status, result = self.assistant_request(
                    problem=problem,
                    jurisdiction="India (Central)",
                    language="en",
                    external_ai_consent=True,
                )

        self.assertEqual(status, 200, result)
        self.assertEqual(result["mode"], "ai_assisted")
        request = provider_call.call_args.args[0]
        self.assertTrue(request.get_header("Authorization").startswith("Be" + "arer "))

    def test_returns_provenance_for_source_list(self):
        with urlopen(f"{self.base_url}/api/sources") as response:
            result = json.loads(response.read())

        self.assertEqual(response.status, 200)
        self.assertTrue(result["sources"])
        self.assertTrue(all(source["source_url"].startswith("https://") for source in result["sources"]))
        self.assertTrue(all(source["jurisdiction"] == "India (Central)" for source in result["sources"]))

    def test_static_homepage_is_built_or_explains_how_to_start(self):
        if FRONTEND_BUILD_DIR.is_dir():
            with urlopen(f"{self.base_url}/") as response:
                page = response.read().decode("utf-8")
            self.assertEqual(response.status, 200)
            self.assertIn("KnowRight", page)
            with urlopen(f"{self.base_url}/topics/housing") as response:
                route_page = response.read().decode("utf-8")
            self.assertEqual(response.status, 200)
            self.assertIn("KnowRight", route_page)
            return

        with self.assertRaises(HTTPError) as raised:
            urlopen(f"{self.base_url}/")
        with raised.exception as error:
            self.assertEqual(error.code, 503)

    def test_returns_cited_passages_for_supported_jurisdiction(self):
        status, result = self.request({
            "question": "What does the source say about an information request?",
            "jurisdiction": "India (Central)",
        })

        self.assertEqual(status, 200)
        self.assertFalse(result["jurisdiction_missing"])
        self.assertTrue(result["hits"])
        self.assertTrue(all(hit["source_url"].startswith("https://") for hit in result["hits"]))

    def test_rejects_a_jurisdiction_outside_demo_coverage(self):
        status, result = self.request({
            "question": "What does the law say?",
            "jurisdiction": "Somewhere else",
        })

        self.assertEqual(status, 400)
        self.assertIn("only searches India (Central)", result["error"])

    def test_rejects_empty_question(self):
        status, result = self.request({
            "question": "   ",
            "jurisdiction": "India (Central)",
        })

        self.assertEqual(status, 400)
        self.assertIn("Enter a question", result["error"])
