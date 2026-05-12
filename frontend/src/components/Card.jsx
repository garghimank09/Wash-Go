export function Card({ children, className = '', padding = true, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/50 backdrop-blur-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-black/20 ${
        padding ? 'p-6' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
