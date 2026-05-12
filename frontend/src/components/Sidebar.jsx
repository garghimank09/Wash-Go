import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/bookings', label: 'Bookings' },
  { to: '/cars', label: 'Cars' },
  { to: '/booking', label: 'New wash' },
];

export function Sidebar({ mobileOpen, onNavigate }) {
  const base =
    'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 md:static md:translate-x-0';
  const open = mobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside className={`${base} ${open} md:flex md:flex-col`}>
      <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-slate-800 md:hidden">
        <span className="text-lg font-black text-slate-900 dark:text-white">Menu</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-600/15 text-cyan-700 dark:text-cyan-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
        Tip: use the floating chat button for quick help while you navigate.
      </div>
    </aside>
  );
}
