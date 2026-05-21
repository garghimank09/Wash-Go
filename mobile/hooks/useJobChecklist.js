import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHECKLIST_TEMPLATE } from '../lib/jobPhases';

const KEY_PREFIX = 'washgo:partner:job:checklist:';
const AUTOSAVE_DEBOUNCE_MS = 300;

function cloneTemplate() {
  return CHECKLIST_TEMPLATE.map((row) => ({ ...row }));
}

/**
 * Job checklist with debounced AsyncStorage auto-save.
 * Returns rows, a toggle handler, the overall progress (0..1), and a status
 * marker the UI can use to show a tiny "saving" / "saved" hint.
 */
export default function useJobChecklist(jobId) {
  const storageKey = useMemo(() => `${KEY_PREFIX}${jobId || 'default'}`, [jobId]);
  const [rows, setRows] = useState(() => cloneTemplate());
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const saveTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              // Merge stored "done" flags onto the canonical template
              setRows(
                cloneTemplate().map((row) => {
                  const stored = parsed.find((r) => r.id === row.id);
                  return stored ? { ...row, done: !!stored.done } : row;
                })
              );
            }
          } catch {
            // ignore parse errors, fall back to template
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return undefined;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(storageKey, JSON.stringify(rows))
        .then(() => setSaveStatus('saved'))
        .catch(() => setSaveStatus('idle'));
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [rows, hydrated, storageKey]);

  const toggle = useCallback((rowId) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, done: !row.done } : row))
    );
  }, []);

  const reset = useCallback(() => {
    setRows(cloneTemplate());
  }, []);

  const completed = rows.filter((r) => r.done).length;
  const progress = rows.length === 0 ? 0 : completed / rows.length;

  return {
    rows,
    toggle,
    reset,
    progress,
    completed,
    total: rows.length,
    saveStatus,
    hydrated,
  };
}
