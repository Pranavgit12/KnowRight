# Safety and Limitations

## Scope and source limits

KnowRight is a public legal-information tool, not a law firm or a legal-advice
service. The bundled corpus contains selected summaries from three India-wide
central Acts. It is not comprehensive, state-specific, or guaranteed current.
The existing retriever is keyword-based and can return irrelevant or empty
matches. A missing match does not show that no right, rule, or remedy exists.
Check the original linked source and seek qualified help for advice about an
individual situation.

The assistant endpoint filters retrieval to records marked
`approved_public` with `approval_status: approved`. It does not use synthetic
records as legal material. Only retrieved passages and their source metadata
are supplied to an optional model adapter.

## AI provider status

No AI provider is configured by default. In that mode, the assistant shows
retrieved passages and clearly labels itself retrieval-only; it does not
present keyword matches as an AI solution.

An operator may configure an OpenAI-compatible chat-completions endpoint on
the backend with `KNOWRIGHT_AI_BASE_URL`, `KNOWRIGHT_AI_API_KEY`, and
`KNOWRIGHT_AI_MODEL` environment variables. The endpoint must use HTTPS. The
backend keeps the key out of frontend code and logs. A configured AI request
is made only after the user checks the explicit provider-sharing consent box.
The submitted problem, follow-up, and retrieved passages are sent to that
provider for the request. Review that provider's data practices before
enabling it. Provider output is untrusted; citation IDs are checked against
retrieved approved sources, but this does not prove that the explanation is
legally correct.

## Privacy and handling

- The frontend sends problem text only after form submission.
- The Python API does not write problem bodies, prompts, or credentials to
  application logs and does not persist questions or answers.
- Standard HTTP access logs may contain request paths and status codes, but
  question text is submitted in a POST body, not in a URL.
- Provider calls are external data sharing when enabled; obtain explicit user
  consent and advise people to redact identifying and sensitive information.
- Copy, download, and print are browser-side actions initiated by the user.

The local server binds to `127.0.0.1`. This local setup is not a claim of
confidentiality, privilege, or production security. A deployed service needs
HTTPS, restricted CORS, rate limiting, secure headers, abuse monitoring that
does not capture question content, and managed server-side secrets.

## Safety and escalation

Do not invent legal-aid contacts, helplines, current legal status, deadlines,
or case outcomes. No verified legal-aid directory is currently included.
Direct users to official government, court, or legal-aid resources for their
location without fabricating a URL or phone number. Do not request documents,
account credentials, or unnecessary personal details.
