import { useTheme } from '../../context/ThemeContext';
import CustomerScreen from '../../components/customer/ui/CustomerScreen';
import CustomerEmptyState from '../../components/customer/ui/CustomerEmptyState';

export default function RewardsScreen() {
  const { theme } = useTheme();

  return (
    <CustomerScreen edges={['top']}>
      <CustomerEmptyState
        icon="card-giftcard"
        title="Rewards"
        body="Earn points on every wash and redeem exclusive perks. Coming soon."
      />
    </CustomerScreen>
  );
}
