import { useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LoaderCircle, Mic, Plus, Send, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import type { AssistantResult, SourceHit } from "@/types/legal";

export interface ConversationMessage {
  role: "user" | "assistant";
  text: string;
  mode?: AssistantResult["mode"];
  hits?: SourceHit[];
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  result: AssistantResult | null;
}

type SendReply = { reply: string; result: AssistantResult };
type SpeechRecognitionLike = new () => {
  lang: string;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};

export function ConversationChat({
  providerConfigured,
  providerConsent,
  onProviderConsentChange,
  onSend,
  onResultChange,
}: {
  providerConfigured: boolean;
  providerConsent: boolean;
  onProviderConsentChange: (value: boolean) => void;
  onSend: (text: string, history: ConversationMessage[]) => Promise<SendReply>;
  onResultChange: (result: AssistantResult | null, messages: ConversationMessage[]) => void;
}) {
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: crypto.randomUUID(), title: t("currentChat"), messages: [], result: null },
  ]);
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? conversations[0],
    [activeId, conversations],
  );
  const messages = active.messages;

  function updateActive(update: (conversation: Conversation) => Conversation) {
    setConversations((items) => items.map((conversation) =>
      conversation.id === activeId ? update(conversation) : conversation,
    ));
  }

  function newConversation() {
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title: t("currentChat"),
      messages: [],
      result: null,
    };
    setConversations((items) => [conversation, ...items]);
    setActiveId(conversation.id);
    setDraft("");
    setError("");
    onResultChange(null, []);
  }

  function openConversation(conversation: Conversation) {
    setActiveId(conversation.id);
    setDraft("");
    setError("");
    onResultChange(conversation.result, conversation.messages);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || loading) return;
    setError("");
    setDraft("");
    setLoading(true);
    const submittedAt = new Date().toISOString();
    const userMessage: ConversationMessage = { role: "user", text, createdAt: submittedAt };
    const pendingHistory = [...messages, userMessage];
    updateActive((conversation) => ({
      ...conversation,
      title: conversation.messages.length ? conversation.title : text.slice(0, 42),
      messages: pendingHistory,
    }));

    try {
      const { reply, result } = await onSend(text, messages);
      const assistantMessage: ConversationMessage = {
        role: "assistant",
        text: reply,
        mode: result.mode,
        hits: result.hits,
        createdAt: new Date().toISOString(),
      };
      const completeHistory = [...pendingHistory, assistantMessage];
      updateActive((conversation) => ({
        ...conversation,
        messages: completeHistory,
        result,
      }));
      onResultChange(result, completeHistory);
      window.requestAnimationFrame(() => {
        threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("errorGeneric"));
      updateActive((conversation) => ({ ...conversation, messages: messages }));
      setDraft(text);
    } finally {
      setLoading(false);
    }
  }

  function startVoiceInput() {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionLike;
      webkitSpeechRecognition?: SpeechRecognitionLike;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setError(t("voiceUnavailable"));
      return;
    }
    const recognition = new Recognition();
    recognition.lang = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN";
    recognition.onresult = (event) => {
      setDraft((current) => `${current}${current ? " " : ""}${event.results[0][0].transcript}`);
    };
    recognition.onerror = () => setError(t("voiceUnavailable"));
    recognition.start();
  }

  const welcome = active.messages.length === 0;

  return (
    <div className="conversation-layout">
      <aside className="conversation-sidebar" aria-label={t("history")}>
        <button className="conversation-new" type="button" onClick={newConversation}>
          <Plus size={16} aria-hidden="true" /> {t("newChat")}
        </button>
        <p className="conversation-sidebar-label">{t("history")}</p>
        <div className="conversation-history">
          {conversations.map((conversation) => (
            <button
              className={`conversation-history-item${conversation.id === activeId ? " is-active" : ""}`}
              key={conversation.id}
              type="button"
              onClick={() => openConversation(conversation)}
              aria-current={conversation.id === activeId ? "page" : undefined}
            >
              <span>{conversation.title}</span>
              <small>{conversation.messages.length ? new Date(conversation.messages[0].createdAt).toLocaleDateString() : t("currentChat")}</small>
            </button>
          ))}
        </div>
        <p className="conversation-local-note"><ShieldCheck size={14} /> {t("privacy")}</p>
      </aside>

      <section className="conversation-main" aria-label={t("currentChat")}>
        <div className="conversation-heading">
          <div>
            <p className="eyebrow">{providerConfigured ? t("aiAssisted") : t("sourceOnly")}</p>
            <h2>{welcome ? t("welcome") : active.title}</h2>
          </div>
          {messages.length > 0 && (
            <button className="conversation-new-mobile" type="button" onClick={newConversation}>
              <Plus size={15} /> {t("newChat")}
            </button>
          )}
        </div>
        <div className="conversation-thread" ref={threadRef} aria-live="polite" aria-relevant="additions text">
          {welcome && (
            <div className="conversation-welcome">
              <span className="conversation-avatar" aria-hidden="true">K</span>
              <div><strong>{t("assistantRole")}</strong><p>{t("welcomeBody")}</p><small>{t("startMessage")}</small></div>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.article
                className={`conversation-message conversation-${message.role}`}
                key={`${active.id}-${message.createdAt}-${index}`}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : .18 }}
              >
                {message.role === "assistant" && <span className="conversation-avatar" aria-hidden="true">K</span>}
                <div className="conversation-bubble">
                  <div className="conversation-message-meta">
                    <strong>{message.role === "user" ? t("you") : t("assistantRole")}</strong>
                    <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString(language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" })}</time>
                  </div>
                  <p>{message.text}</p>
                  {message.hits && message.hits.length > 0 && (
                    <div className="conversation-citations">
                      {message.hits.map((hit) => (
                        <a href={hit.source_url} key={`${hit.source_id}-${hit.passage_id}`} target="_blank" rel="noopener noreferrer">
                          {hit.source_id} · {hit.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="conversation-typing" role="status" aria-label={t("sending")}>
              <span /><span /><span /><small>{t("sending")}</small>
            </div>
          )}
        </div>
        {error && <p className="assistant-error" role="alert">{error}</p>}
        <form className="conversation-composer" onSubmit={submit}>
          {providerConfigured && (
            <label className="conversation-consent">
              <input type="checkbox" checked={providerConsent} onChange={(event) => onProviderConsentChange(event.target.checked)} />
              <span>{t("consent")}</span>
            </label>
          )}
          <div className="conversation-input-wrap">
            <label className="sr-only" htmlFor="conversation-message">{t("placeholder")}</label>
            <textarea
              id="conversation-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={6000}
              rows={2}
              placeholder={t("placeholder")}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button className="conversation-voice" type="button" onClick={startVoiceInput} aria-label={t("voiceInput")}>
              <Mic size={17} aria-hidden="true" />
            </button>
            <button className="conversation-send" type="submit" disabled={loading || !draft.trim()} aria-label={loading ? t("sending") : t("send")}>
              {loading ? <LoaderCircle className="spin" size={18} /> : <Send size={17} aria-hidden="true" />}
            </button>
          </div>
          <p className="conversation-privacy"><ShieldCheck size={13} aria-hidden="true" /> {t("privacy")}</p>
        </form>
      </section>
    </div>
  );
}
