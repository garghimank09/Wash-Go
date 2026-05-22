import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

import { getErrorMessage } from '../services/api';
import { placesService } from '../services/placesService';
import { cn } from '../lib/cn';

/**
 * Address/area field with debounced Google Places suggestions (via backend proxy).
 */
export function PlacesAutocompleteInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder,
  error,
  onBlur,
  name = 'service_area',
  id: idProp,
  disabled = false,
}) {
  const autoId = useId();
  const inputId = idProp || name || autoId;
  const wrapRef = useRef(null);
  const sessionRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fetchError, setFetchError] = useState('');

  const fetchSuggestions = useCallback(async (query) => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setFetchError('');
      return;
    }
    setLoading(true);
    setFetchError('');
    try {
      const data = await placesService.autocomplete(q, sessionRef.current);
      setSuggestions(data.suggestions ?? []);
    } catch (err) {
      setSuggestions([]);
      setFetchError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || disabled) return undefined;
    const timer = window.setTimeout(() => {
      void fetchSuggestions(value);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [value, open, disabled, fetchSuggestions]);

  useEffect(() => {
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const pick = (item) => {
    onChange(item.description);
    onSelect?.(item);
    setOpen(false);
    setSuggestions([]);
    sessionRef.current =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  };

  const fieldClassName = cn(
    'w-full rounded-xl border bg-wg-surface-elevated py-2.5 pl-4 pr-10 text-wg-text shadow-sm transition placeholder:text-wg-muted',
    'focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:focus:border-cyan-400',
    error ? 'border-rose-500' : 'border-wg-border',
  );

  return (
    <label className="relative block" htmlFor={inputId} ref={wrapRef}>
      {label ? <span className="mb-1.5 block text-sm font-medium text-wg-muted">{label}</span> : null}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          className={fieldClassName}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onBlur={onBlur}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-wg-muted">
          {loading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <MapPin className="size-4 opacity-70" strokeWidth={1.75} aria-hidden />
          )}
        </span>
      </div>

      {open && (suggestions.length > 0 || fetchError || (loading && value.trim().length >= 2)) ? (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-wg-border bg-wg-surface-elevated py-1 text-sm shadow-xl dark:border-white/15 dark:bg-slate-900"
        >
          {fetchError ? (
            <li className="px-3 py-2 text-xs text-amber-700 dark:text-amber-200">{fetchError}</li>
          ) : null}
          {!fetchError && loading && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-wg-muted">Searching places…</li>
          ) : null}
          {suggestions.map((s) => (
            <li key={s.place_id} role="option">
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-wg-text transition hover:bg-cyan-500/10"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(s)}
              >
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden />
                <span className="leading-snug">{s.description}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
      {!error && !fetchError && value.trim().length >= 2 && !loading && open && suggestions.length === 0 ? (
        <p className="mt-1 text-xs text-wg-muted">No matches — keep typing or enter your area manually.</p>
      ) : null}
    </label>
  );
}
