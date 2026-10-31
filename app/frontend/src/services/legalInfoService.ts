import type {
  AssistantResult,
  AssistantStatus,
  SearchResponse,
  SourceRecord,
} from "@/types/legal";

async function readJson<T>(response: Response): Promise<T> {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "The local source service could not complete this request.",
    );
  }
  return result as T;
}

export async function findSourcePassages(
  question: string,
  jurisdiction: string,
): Promise<SearchResponse> {
  const response = await fetch("/api/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, jurisdiction }),
  });
  return readJson<SearchResponse>(response);
}

export async function findAssistantResult(input: {
  problem: string;
  followUp: string;
  jurisdiction: string;
  language: "auto" | "en" | "hi" | "te";
  externalAiConsent: boolean;
}): Promise<AssistantResult> {
  const response = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      problem: input.problem,
      follow_up: input.followUp,
      jurisdiction: input.jurisdiction,
      language: input.language,
      external_ai_consent: input.externalAiConsent,
    }),
  });
  return readJson<AssistantResult>(response);
}

export async function getAssistantStatus(): Promise<AssistantStatus> {
  const response = await fetch("/api/status");
  return readJson<AssistantStatus>(response);
}

export async function listSources(): Promise<SourceRecord[]> {
  const response = await fetch("/api/sources");
  const result = await readJson<{ sources: SourceRecord[] }>(response);
  return result.sources;
}
