import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

import { Button } from '../../../ui/button';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { formatCents, formatDateTime } from '../../../utils/format';

export function AdminDirectoryDrawer({ open, segment, row, onClose }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const node = (
    <AnimatePresence>
      {open && row ? (
        <m.div
          key="admin-directory-drawer"
          className="fixed inset-0 z-[80]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.18 }}
        >
          <m.button
            type="button"
            aria-label="Close profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />
          <m.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="directory-drawer-title"
            initial={reduced ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduced ? undefined : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className={cn(
              'absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/15',
              'bg-wg-surface-elevated/98 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95',
            )}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 dark:border-white/5">
              <div className="min-w-0">
                <p id="directory-drawer-title" className="truncate text-lg font-black text-wg-text">
                  {row.fullName}
                </p>
                <p className="mt-0.5 truncate text-xs text-wg-muted">{row.email}</p>
                <p className="mt-1 font-mono text-[10px] text-wg-muted">{row.id}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" className="shrink-0 px-2" onClick={onClose} aria-label="Close">
                <X className="size-5" strokeWidth={2} />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 text-sm">
              {segment === 'customers' ? (
                <dl className="space-y-3">
                  <DrawerRow label="Loyalty tier" value={row.loyaltyTier} />
                  <DrawerRow label="Lifetime value" value={formatCents(row.lifetimeValueCents)} />
                  <DrawerRow label="Bookings" value={String(row.bookingsCount)} />
                  <DrawerRow label="Complaints" value={row.complaintsStatus} />
                  <DrawerRow label="Recent activity" value={row.recentActivityLabel} />
                  <DrawerRow label="Activity time" value={formatDateTime(row.recentActivityAt)} />
                  <DrawerRow label="Joined" value={row.joinedAt} />
                  <DrawerRow label="Account" value={row.active ? 'Active' : 'Suspended'} />
                  <p className="pt-2 text-xs leading-relaxed text-wg-muted">{row.notes}</p>
                  <div className="flex flex-wrap gap-2 pt-4">
                    <Link to="/admin/bookings" className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
                      Bookings →
                    </Link>
                    {row.complaintsStatus === 'open' ? (
                      <Link to="/admin/complaints" className="text-xs font-bold text-amber-800 dark:text-amber-200">
                        Complaints →
                      </Link>
                    ) : null}
                  </div>
                </dl>
              ) : null}

              {segment === 'partners' ? (
                <dl className="space-y-3">
                  <DrawerRow label="Presence" value={row.online ? 'Online' : 'Offline'} />
                  <DrawerRow label="Acceptance" value={`${row.acceptancePct}%`} />
                  <DrawerRow label="Completion" value={`${row.completionPct}%`} />
                  <DrawerRow label="Trust score" value={String(row.trustScore)} />
                  <DrawerRow label="YTD earnings" value={formatCents(row.earningsYtdCents)} />
                  <DrawerRow label="Active jobs" value={String(row.activeJobs)} />
                  <DrawerRow label="Operational state" value={String(row.operationalState).replace(/_/g, ' ')} />
                  <DrawerRow label="Territory" value={row.territory} />
                  <DrawerRow label="Joined" value={row.joinedAt} />
                  <p className="pt-2 text-xs leading-relaxed text-wg-muted">{row.notes}</p>
                  <Link to="/admin/operations" className="mt-4 inline-block text-xs font-bold text-cyan-700 dark:text-cyan-300">
                    Dispatch desk →
                  </Link>
                </dl>
              ) : null}

              {segment === 'staff' ? (
                <dl className="space-y-3">
                  <DrawerRow label="Role" value={row.staffRole === 'super_admin' ? 'Super admin' : 'Operations'} />
                  <DrawerRow label="Permissions" value={row.permissionsSummary} />
                  <DrawerRow label="Access plane" value={row.operationalAccess} />
                  <DrawerRow label="Activity" value={row.activityState} />
                  <DrawerRow label="Last login" value={formatDateTime(row.lastLoginAt)} />
                  <DrawerRow label="Joined" value={row.joinedAt} />
                  <p className="pt-2 text-xs leading-relaxed text-wg-muted">{row.notes}</p>
                </dl>
              ) : null}
            </div>

            <div className="border-t border-white/10 p-4 dark:border-white/5">
              <Button type="button" className="w-full" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </m.aside>
        </m.div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}

function DrawerRow({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-wg-text">{value}</dd>
    </div>
  );
}
