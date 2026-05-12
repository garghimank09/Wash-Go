import { useState } from 'react';

import { AssistantChat } from './AssistantChat';

export function AssistantDock() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open ? (
        <>
          <div
            className="fixed bottom-24 right-4 z-50 flex h-[min(72vh,520px)] w-[min(100vw-2rem,380px)] flex-col md:right-8"
            role="dialog"
            aria-label="WashGo AI Concierge"
          >
            <AssistantChat compact className="h-full rounded-[1.35rem] shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/80" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fixed bottom-6 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-900/25 transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950 md:right-8"
            aria-label="Close concierge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} className="size-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-900/25 transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-950 md:right-8"
          aria-label="Open WashGo AI Concierge"
          aria-expanded={false}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="size-7">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l-1.27-2.227c.196-.291.515-.475.865-.501 1.15-.086 2.294-.213 3.423-.379 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.374 3.746 2.25 5.145 2.25 6.741v6.018z"
            />
          </svg>
        </button>
      )}
    </>
  );
}
