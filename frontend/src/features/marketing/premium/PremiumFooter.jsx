import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';

export function PremiumFooter() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');

  return (
    <footer className="border-t border-wg-border/60 bg-gradient-to-b from-wg-surface-elevated to-wg-surface pt-16 pb-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-2xl font-black text-wg-text">
              Wash<span className="text-cyan-500">Go</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-wg-muted">
              AI-powered doorstep car care — book, track, and trust every wash. Built for India&apos;s urban drivers.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-lg border border-wg-border bg-wg-surface px-3 py-1.5 text-xs font-semibold text-wg-muted">
                App Store
              </span>
              <span className="rounded-lg border border-wg-border bg-wg-surface px-3 py-1.5 text-xs font-semibold text-wg-muted">
                Google Play
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-wg-muted">Product</p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-wg-text/90">
                <li><a href="#features" className="hover:text-cyan-600">Features</a></li>
                <li><a href="#pricing" className="hover:text-cyan-600">Pricing</a></li>
                <li><a href="#plans" className="hover:text-cyan-600">Membership</a></li>
                <li><Link to="/booking" className="hover:text-cyan-600">Book a wash</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-wg-muted">Company</p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-wg-text/90">
                <li><a href="#why-washgo" className="hover:text-cyan-600">About</a></li>
                <li><Link to="/partner/signup" className="hover:text-cyan-600">Partner program</Link></li>
                <li><Link to="/admin/login" className="hover:text-cyan-600">Admin</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-wg-muted">Legal</p>
              <ul className="mt-4 space-y-2 text-sm font-medium text-wg-text/90">
                <li><a href="#" className="hover:text-cyan-600">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-600">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="lg:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-wg-muted">Newsletter</p>
            <p className="mt-2 text-sm text-wg-muted">Product updates & eco tips — no spam.</p>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setEmail('');
              }}
            >
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1"
              />
              <Button type="submit" size="sm">
                Join
              </Button>
            </form>
          </div>
        </div>
        <p className="mt-12 border-t border-wg-border/60 pt-8 text-center text-xs text-wg-muted">
          © {year} WashGo. Premium mobile car care — demo experience.
        </p>
      </div>
    </footer>
  );
}
