import { Link } from 'react-router-dom';
import { Droplets, Leaf } from 'lucide-react';

const SOCIAL_LINKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com',
    Icon: IconInstagram,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    Icon: IconLinkedIn,
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    href: 'https://x.com',
    Icon: IconX,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://facebook.com',
    Icon: IconFacebook,
  },
];

/** Outline brand icons — lucide has no social marks in v1.x; footer-local SVGs only */
function IconInstagram({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLinkedIn({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v7M8 8v.01" strokeLinecap="round" />
      <path d="M12 18v-5c0-1.5 1-3 3-3s2 1.5 2 3v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
    </svg>
  );
}

function IconFacebook({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21v-9h3.5l.5-4H12V7.5a2.5 2.5 0 0 1 2.5-2.5H18V2h-3.5A5.5 5.5 0 0 0 9 7.5V8H6v4h3v9h3z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-wg-border bg-gradient-to-b from-wg-surface-elevated/90 to-wg-surface dark:from-slate-950/95 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" aria-hidden />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-xl font-black tracking-tight text-wg-text">
              Wash<span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">Go</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-wg-muted">
              Premium eco-friendly doorstep car care — book, track, and trust every wash.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
              <Leaf className="size-3.5" aria-hidden />
              Water-conscious · Mobile-first
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-wg-muted">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-wg-text/90">
              <li>
                <a href="#features" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                  How it works
                </a>
              </li>
              <li>
                <a href="#experience" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                  Product preview
                </a>
              </li>
              <li>
                <a href="#plans" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                  Plans
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-wg-muted">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-wg-text/90">
              <li>
                <a href="#why-washgo" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                  Why WashGo
                </a>
              </li>
              <li>
                <a href="#eco" className="inline-flex items-center gap-1 transition hover:text-emerald-600 dark:hover:text-emerald-400">
                  <Droplets className="size-3.5 opacity-70" aria-hidden />
                  Eco approach
                </a>
              </li>
              <li>
                <Link to="/partner/signup" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                  Become a washer
                </Link>
              </li>
              <li>
                <a href="#builders" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                  For builders
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-wg-muted">Connect</p>
            <ul className="mt-4 flex flex-wrap gap-3 sm:gap-3.5" aria-label="Social media">
              {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
                <li key={id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="wg-footer-social-link group inline-flex"
                  >
                    <span className="wg-footer-social-icon inline-flex size-11 items-center justify-center rounded-full border border-white/50 bg-white/55 text-wg-text/80 shadow-sm backdrop-blur-md transition duration-300 ease-out group-hover:-translate-y-1 group-hover:border-cyan-400/35 group-hover:text-cyan-700 group-active:translate-y-0 group-active:scale-[0.97] dark:border-white/12 dark:bg-white/[0.06] dark:text-wg-text/90 dark:group-hover:text-cyan-300">
                      <Icon className="size-[1.15rem]" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-wg-border/80 pt-8 text-xs leading-relaxed text-wg-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} WashGo. Premium mobile car care.</p>
          <p className="max-w-md sm:text-right">
            Demo experience — previews and metrics are illustrative until production launch.
          </p>
        </div>
      </div>
    </footer>
  );
}
