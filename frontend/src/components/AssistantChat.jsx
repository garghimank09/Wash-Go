import { useEffect, useRef, useState } from 'react';

import { getErrorMessage, api } from '../services/api';

const WELCOME = {
  role: 'assistant',
  content:
    "Hi! 👋 I'm the WashGo AI Concierge. I can help you with bookings, pricing, service questions, and more. What do you need help with today?",
};

const QUICK_REPLIES = [
  { label: 'My current booking', message: 'How do I view or manage my current and upcoming bookings?' },
  { label: 'Something else', message: null },
];

function VanAvatar({ className = '' }) {
  return (
    <div
      className={`flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-700 shadow-md shadow-blue-900/20 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-7 text-white" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 00-2-2H4a2 2 0 00-2 2v11a1 1 0 001 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 001-1v-3.65a1 1 0 00-.22-.624l-3.48-4.35A1 1 0 0017.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    </div>
  );
}

function BotGlyph({ className = '' }) {
  return (
    <div
      className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="8" width="14" height="10" rx="2" />
        <circle cx="9.5" cy="13" r="1" fill="currentColor" stroke="none" />
        <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none" />
        <path d="M9 16h6" />
        <path d="M12 5v3" />
      </svg>
    </div>
  );
}

function SparkleSendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

export function AssistantChat({ compact = false, className = '' }) {
  const [messages, setMessages] = useState(() => [WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const showQuickReplies = messages.length === 1 && messages[0]?.role === 'assistant';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendWithText = async (raw) => {
    const text = raw.trim();
    if (!text || loading) return;
    setError('');
    setInput('');
    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const payloadMessages = next.map(({ role, content }) => ({ role, content }));
      const { data } = await api.post('/assistant/chat', { messages: payloadMessages }, { timeout: 120000 });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      setError(getErrorMessage(err));
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const send = () => sendWithText(input);

  const shell = compact
    ? 'bg-white text-slate-900 [color-scheme:light]'
    : 'min-h-[min(70vh,640px)] rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-xl [color-scheme:light]';

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden ${shell} ${className}`}>
      {compact ? (
        <header className="shrink-0 border-b border-slate-100 bg-white px-4 pb-4 pt-5 text-center">
          <div className="flex justify-center">
            <VanAvatar />
          </div>
          <p className="mt-3 text-base font-semibold text-slate-900">WashGo AI Concierge</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Support online
          </div>
        </header>
      ) : (
        <header className="shrink-0 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/80 px-6 pb-5 pt-6 text-center">
          <div className="flex justify-center">
            <VanAvatar />
          </div>
          <h1 className="mt-3 text-xl font-bold text-slate-900">WashGo AI Concierge</h1>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
            <span className="size-2 rounded-full bg-emerald-500" />
            Support online
          </div>
          <p className="mx-auto mt-3 max-w-md text-xs text-slate-500">
            Answers use your WashGo backend (Ollama or OpenAI). Configure <code className="rounded bg-slate-100 px-1">AI_PROVIDER</code> in{' '}
            <code className="rounded bg-slate-100 px-1">backend/.env</code>.
          </p>
        </header>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex gap-2.5'}>
            {m.role === 'assistant' ? <BotGlyph className="mt-0.5" /> : null}
            <div
              className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white'
                  : 'border border-slate-100 bg-white text-slate-800'
              }`}
            >
              {m.content.split('\n').map((line, j) => (
                <span key={j}>
                  {j > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex gap-2.5">
            <BotGlyph className="mt-0.5" />
            <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <span className="inline-flex gap-1 text-slate-400">
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-current" />
              </span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-slate-100 bg-white px-3 pb-3 pt-2">
        {error ? <p className="mb-2 px-1 text-xs text-rose-600">{error}</p> : null}

        {showQuickReplies ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_REPLIES.map(({ label, message }) => (
              <button
                key={label}
                type="button"
                disabled={loading}
                onClick={() => {
                  if (message) void sendWithText(message);
                  else inputRef.current?.focus();
                }}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Type your question..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-14 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="absolute right-1.5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <SparkleSendIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
