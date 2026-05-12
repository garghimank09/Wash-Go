import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(6,182,212,0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(99,102,241,0.25), transparent)',
        }}
      />
      <div className="relative w-full max-w-md wg-fade-up rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl">
        <Outlet />
      </div>
    </div>
  );
}
