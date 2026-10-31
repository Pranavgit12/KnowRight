async function requestJson(path, options) {
  const response = await fetch(path, options);
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The local service returned an unreadable response.");
  }
  if (!response.ok) {
    throw new Error(typeof payload?.error === "string" ? payload.error : "The local service could not complete this request.");
  }
  return payload;
}

export function getAssistantStatus() {
  return requestJson("/api/status");
}

export function submitProblem({ problem, followUp, language, externalAiConsent }) {
  return requestJson("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      problem,
      follow_up: followUp,
      jurisdiction: "India (Central)",
      language,
      external_ai_consent: externalAiConsent,
    }),
  });
}

export async function getSources() {
  const result = await requestJson("/api/sources");
  return Array.isArray(result.sources) ? result.sources : [];
}
