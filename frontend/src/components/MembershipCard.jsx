export function MembershipCard({ title, price, perks, highlighted }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
        highlighted
          ? 'border-cyan-500/50 bg-gradient-to-b from-cyan-500/15 to-indigo-600/10 shadow-lg shadow-cyan-500/10'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50'
      }`}
    >
      {highlighted ? (
        <span className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow">
          Popular
        </span>
      ) : null}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">
        {price}
        <span className="text-base font-semibold text-slate-500 dark:text-slate-400">/mo</span>
      </p>
      <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
        {perks.map((p) => (
          <li key={p} className="flex gap-2">
            <span className="text-cyan-500">✓</span>
            {p}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="mt-6 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        Coming soon
      </button>
    </div>
  );
}
