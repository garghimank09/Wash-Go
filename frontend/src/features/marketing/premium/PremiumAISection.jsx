import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

import { AI_FEATURES } from './premiumContent';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { Button } from '../../../ui/button';

export function PremiumAISection() {
  const reduced = useReducedMotion();

  return (
    <section id="ai" className="wg-premium-section scroll-mt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">AI-powered</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Concierge that learns your garage
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400">
                Visible AI across scheduling, reminders, and in-app chat — not hidden behind a settings panel.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup">
                  <Button className="wg-premium-cta">Open the app</Button>
                </Link>
                <a href="#experience">
                  <Button variant="outline" className="border-white/25 text-white hover:bg-white/10">
                    See platform
                  </Button>
                </a>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {AI_FEATURES.map((f, i) => (
                <m.div
                  key={f.title}
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                >
                  <Bot className="size-5 text-cyan-300" aria-hidden />
                  <p className="mt-2 font-bold text-white">{f.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{f.desc}</p>
                </m.div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            <Sparkles className="size-4 shrink-0" aria-hidden />
            AI assistant popup in booking — suggests packages based on vehicle & weather.
          </div>
        </div>
      </div>
    </section>
  );
}
