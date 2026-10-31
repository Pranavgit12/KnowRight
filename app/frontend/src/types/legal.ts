export type Jurisdiction = "" | "India (Central)" | "not-covered";

export interface SourceRecord {
  source_id: string;
  title: string;
  issuing_authority: string;
  jurisdiction: string;
  effective_date: string | null;
  publication_date: string | null;
  source_url: string;
  source_type: string;
  approval_status?: string;
  synthetic_notice?: string;
  text: string;
}

export interface SourceHit extends Omit<SourceRecord, "text"> {
  passage: string;
  passage_id: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  jurisdiction: string | null;
  jurisdiction_missing: boolean;
  no_matching_sources: boolean;
  hits: SourceHit[];
}

export type SolutionSection = {
  understanding: string;
  issue: string;
  rights: string;
  solutions: string;
  action_plan: string;
  documents: string;
  help: string;
  precautions: string;
  next_step: string;
};

export interface AssistantResult {
  mode: "retrieval_only" | "ai_assisted" | "clarification_required";
  jurisdiction: string;
  language: "en" | "hi" | "te";
  category: string;
  clarification_questions: string[];
  sections: Partial<SolutionSection>;
  hits: SourceHit[];
  no_matching_sources: boolean;
  provider_configured: boolean;
  privacy_notice: string;
}

export interface AssistantStatus {
  ai_provider_configured: boolean;
  ai_provider_configuration_error: boolean;
  jurisdiction: string;
}
