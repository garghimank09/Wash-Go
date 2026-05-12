import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-lg font-black text-slate-900 dark:text-white">
            Wash<span className="text-cyan-500">Go</span>
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} WashGo. Built for scale.</p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link to="/login" className="hover:text-cyan-600">
            Log in
          </Link>
          <Link to="/signup" className="hover:text-cyan-600">
            Sign up
          </Link>
          <a href="#features" className="hover:text-cyan-600">
            Product
          </a>
        </div>
      </div>
    </footer>
  );
}
