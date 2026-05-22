import { ProfileMembershipPanel } from '../features/profile/ProfileMembershipPanel';
import { CustomerProfilePage } from './CustomerProfilePage';

export function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <CustomerProfilePage />
      <ProfileMembershipPanel />
    </div>
  );
}
