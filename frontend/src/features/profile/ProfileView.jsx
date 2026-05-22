import { Mail, Phone, User } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { Card } from '../../ui/card';
import { ProfileMembershipPanel } from './ProfileMembershipPanel';

export function ProfileView() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="wg-title">Profile</h1>
        <p className="wg-subtitle mt-2">Account details and membership washes remaining.</p>
      </div>

      <Card className="p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-wg-muted">Account</h2>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex items-center gap-3 text-wg-text">
            <User className="size-4 text-wg-muted" aria-hidden />
            {user?.full_name || '—'}
          </li>
          <li className="flex items-center gap-3 text-wg-text">
            <Mail className="size-4 text-wg-muted" aria-hidden />
            {user?.email || '—'}
          </li>
          {user?.phone ? (
            <li className="flex items-center gap-3 text-wg-text">
              <Phone className="size-4 text-wg-muted" aria-hidden />
              {user.phone}
            </li>
          ) : null}
        </ul>
      </Card>

      <ProfileMembershipPanel />
    </div>
  );
}
