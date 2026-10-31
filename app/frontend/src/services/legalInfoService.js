

const QUESTION_ENDPOINT = "/api/questions";

export async function findSourcePassages(question, jurisdiction) {
  const response = await fetch(QUESTION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, jurisdiction }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "The local source search could not be completed.");
  }
  return result;
}
