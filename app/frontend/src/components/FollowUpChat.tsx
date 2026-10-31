import { useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, MessageCircleQuestion, Send, ShieldCheck } from "lucide-react";
import type { AssistantResult, SourceHit } from "@/types/legal";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  mode?: AssistantResult["mode"];
  hits?: SourceHit[];
}

export function FollowUpChat({
  messages,
  loading,
  providerConfigured,
  onSend,
}: {
  messages: ChatMessage[];
  loading: boolean;
  providerConfigured: boolean;
  onSend: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (!text || loading) return;
    setError("");
    try {
      await onSend(text);
      setMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The follow-up could not be completed.");
    }
  }

  return (
    <div className="inpage-chat">
      <div className="inpage-chat-heading">
        <span className="chat-glass-icon"><MessageCircleQuestion size={17} aria-hidden="true" /></span>
        <div>
          <h3>Continue with a follow-up</h3>
          <p>{providerConfigured ? "Your follow-up and retrieved passages are sent to the configured provider only after consent." : "Follow-ups search the local source collection. Keyword matching is not AI analysis."}</p>
        </div>
      </div>
      <div className="chat-thread" aria-live="polite" aria-relevant="additions text">
        {messages.length === 0 && (
          <div className="chat-empty-state">
            <ShieldCheck size={17} aria-hidden="true" />
            <p>Your problem stays in this page. Start a follow-up whenever you’re ready.</p>
          </div>
        )}
        {messages.map((item, index) => (
          <article className={`chat-message chat-${item.role}`} key={`${item.role}-${index}`}>
            <span className="chat-role">{item.role === "user" ? "You" : item.mode === "ai_assisted" ? "AI-assisted · unverified" : "Source search"}</span>
            <p>{item.text}</p>
            {item.role === "assistant" && item.hits && item.hits.length > 0 && (
              <div className="chat-message-sources">
                {item.hits.map((hit) => (
                  <a href={hit.source_url} key={`${hit.source_id}-${hit.passage_id}`} rel="noopener noreferrer" target="_blank">
                    {hit.title} <ArrowUpRight size={12} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
        {loading && <p className="chat-loading" role="status"><LoaderCircle className="spin" size={15} /> Checking available source passages…</p>}
      </div>
      {error && <p className="assistant-error" role="alert">{error}</p>}
      <form className="follow-up-panel follow-up-glass" onSubmit={submit}>
        <label className="sr-only" htmlFor="follow-up-question">Follow-up question</label>
        <textarea
          id="follow-up-question"
          value={message}
          maxLength={1500}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="Ask a follow-up. Please omit names and other sensitive details."
          aria-describedby="follow-up-privacy"
        />
        <div className="chat-composer-bottom">
          <p id="follow-up-privacy">Only sent when you press Send · Not stored by default</p>
          <button className="button button-primary" type="submit" disabled={loading || !message.trim()}>
            {loading ? <LoaderCircle className="spin" size={15} /> : <Send size={15} aria-hidden="true" />}
            {loading ? "Searching…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
