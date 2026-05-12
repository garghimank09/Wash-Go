import { Link } from 'react-router-dom';

import { Button } from '../components/Button';
import { MembershipCard } from '../components/MembershipCard';

export function LandingPage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100 py-20 dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:py-28">
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl dark:bg-cyan-500/10" />
        <div className="pointer-events-none absolute -right-10 top-40 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl dark:bg-indigo-600/15" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <p className="wg-fade-up inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">
            AI-ready · Real-time ready · Payments ready
          </p>
          <h1 className="wg-fade-up mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
            Car care that feels like a <span className="bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent">premium SaaS</span> — not a chore.
          </h1>
          <p className="wg-fade-up mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            WashGo connects drivers, washers, and intelligent automation. Book in seconds, track washes, and extend
            into Ollama copilots, YOLOv8 damage checks, and ML-driven pricing when you are ready.
          </p>
          <div className="wg-fade-up mt-10 flex flex-wrap gap-4">
            <Link to="/signup">
              <Button size="lg">Start washing smarter</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">Built for operators & drivers</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600 dark:text-slate-400">
          Every screen in the app maps cleanly to your FastAPI service layer — swap mocks for production integrations
          without redesigning the UI.
        </p>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              t: 'Live operations',
              d: 'Bookings, washers, and ETAs are modeled for WebSocket upgrades and map overlays.',
              c: 'from-emerald-500/20 to-cyan-500/10',
            },
            {
              t: 'Monetization-ready',
              d: 'Membership cards & pricing hooks align with Stripe-style checkout when you add payments.',
              c: 'from-indigo-500/20 to-violet-500/10',
            },
            {
              t: 'Computer vision lane',
              d: 'Dashboard AI lab is reserved for YOLOv8 image uploads & automated QC storytelling.',
              c: 'from-amber-500/20 to-rose-500/10',
            },
          ].map((f) => (
            <div
              key={f.t}
              className={`rounded-2xl border border-slate-200 bg-gradient-to-br p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 ${f.c}`}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="border-y border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-black text-slate-900 dark:text-white">Membership plans</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600 dark:text-slate-400">
            Preview pricing psychology on the marketing site — backend plans can mirror these tiers on Day 3.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <MembershipCard
              title="Spark"
              price="$19"
              perks={['2 washes / month', 'Standard scheduling', 'Email support']}
            />
            <MembershipCard
              title="Gleam"
              price="$39"
              highlighted
              perks={['5 washes / month', 'Priority washers', 'In-app AI summaries']}
            />
            <MembershipCard
              title="Apex Fleet"
              price="$99"
              perks={['12 washes / month', 'Dedicated account manager', 'YOLOv8 add-on slots']}
            />
          </div>
        </div>
      </section>

      <section id="ai" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-10 text-white shadow-2xl dark:border-slate-700">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black">AI-powered platform core</h2>
            <p className="mt-4 text-slate-300">
              Ollama endpoints, streaming chat, and on-device-friendly image uploads share the same Axios client &
              JWT gate. Add a `/ai/*` BFF later without touching your public routes.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-slate-300">
              <li>• Secure token propagation for future `/ai/chat` proxies</li>
              <li>• Structured booking JSON for RAG + tool calling</li>
              <li>• Notification hooks ready for SSE / Web Push</li>
            </ul>
            <div className="mt-8">
              <Link to="/signup">
                <Button size="md">Join the beta path</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-cyan-600 to-indigo-700 py-16 text-center text-white">
        <h2 className="text-3xl font-black">Ready to orchestrate your fleet?</h2>
        <p className="mx-auto mt-3 max-w-xl text-cyan-50">Spin up the FastAPI stack, drop in your keys, and ship Day 3 features on this UI spine.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/signup">
            <Button variant="secondary" size="lg">
              Create free account
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
