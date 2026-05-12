export function Loader({ fullScreen, message }) {
  const inner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500"
        role="status"
        aria-label="Loading"
      />
      {message ? <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p> : null}
    </div>
  );
  if (fullScreen) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50 dark:bg-slate-950">{inner}</div>
    );
  }
  return <div className="flex justify-center py-12">{inner}</div>;
}
