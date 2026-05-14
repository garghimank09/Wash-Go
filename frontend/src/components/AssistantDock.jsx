import { useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';

import { useReducedMotion } from '../lib/useReducedMotion';
import { AssistantChat } from './AssistantChat';

export function AssistantDock() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  const spring = reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 32 };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <>
            <m.div
              key="wg-assistant-backdrop"
              role="presentation"
              aria-hidden
              className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.22 }}
              onClick={() => setOpen(false)}
            />
            <m.div
              key="wg-assistant-panel"
              role="dialog"
              aria-label="WashGo AI Concierge"
              className="fixed bottom-24 right-4 z-50 flex h-[min(72vh,520px)] w-[min(100vw-2rem,380px)] flex-col md:right-8"
              initial={reduced ? false : { opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 20, scale: 0.96 }}
              transition={spring}
            >
              <AssistantChat
                compact
                className="h-full rounded-[1.35rem] shadow-2xl shadow-slate-900/15 ring-1 ring-slate-200/80 dark:ring-slate-700/80"
              />
            </m.div>
            <m.button
              key="wg-assistant-close"
              type="button"
              onClick={() => setOpen(false)}
              initial={reduced ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.85 }}
              transition={{ duration: reduced ? 0 : 0.2 }}
              className="fixed bottom-6 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-900/25 transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-wg-surface md:right-8"
              aria-label="Close concierge"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} className="size-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </m.button>
          </>
        ) : null}
      </AnimatePresence>

      {!open ? (
        <m.button
          type="button"
          onClick={() => setOpen(true)}
          whileTap={reduced ? undefined : { scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="fixed bottom-6 right-4 z-50 flex size-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-900/25 transition hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-wg-surface md:right-8"
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
        </m.button>
      ) : null}
    </>
  );
}
