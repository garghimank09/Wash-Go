import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useCustomerScrollEndPadding } from '../../hooks/useCustomerContentPadding';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import {
  WASH_POINTS,
  REWARD_TIER,
  REWARD_BENEFITS,
  REWARD_ACHIEVEMENTS,
  REWARD_PROMOS,
  REFERRAL_COPY,
} from '../../lib/rewardsMockData';
import RewardPointsCard from '../../components/customer/rewards/RewardPointsCard';
import RewardTierProgress from '../../components/customer/rewards/RewardTierProgress';
import RewardBenefitCard from '../../components/customer/rewards/RewardBenefitCard';
import AchievementBadge from '../../components/customer/rewards/AchievementBadge';
import RewardsPromoCard from '../../components/customer/rewards/RewardsPromoCard';
import ReferralCard from '../../components/customer/rewards/ReferralCard';

function SectionTitle({ title, subtitle }) {
  const { theme } = useTheme();
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.sectionSub, { color: theme.text.muted }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export default function RewardsScreen() {
  const { theme } = useTheme();
  const scrollEndPadding = useCustomerScrollEndPadding();
  const c = theme.customer;

  const handleBenefit = useCallback((benefit) => {
    if (benefit.locked) {
      Alert.alert('Platinum perk', 'Reach Platinum tier to unlock this benefit.');
      return;
    }
    Alert.alert(benefit.title, benefit.subtitle);
  }, []);

  const handlePromo = useCallback((promo) => {
    Alert.alert(promo.title, promo.subtitle);
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Join WashGo with my code ${REFERRAL_COPY.code} and earn WashPoints on your first wash!`,
      });
    } catch {
      // user dismissed
    }
  }, []);

  return (
    <View style={[styles.safe, { backgroundColor: c.surface }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: scrollEndPadding + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
        >
          <Text style={[styles.screenTitle, { color: theme.text.primary }]}>Rewards</Text>
          <Text style={[styles.screenSub, { color: theme.text.muted }]}>
            Earn WashPoints on every wash and unlock premium perks
          </Text>
        </MotiView>

        <RewardPointsCard points={WASH_POINTS} />

        <SectionTitle title="Member tier" subtitle="Progress toward your next milestone" />
        <RewardTierProgress tier={REWARD_TIER} />

        <SectionTitle title="Redeem benefits" subtitle="Use WashPoints for exclusive perks" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {REWARD_BENEFITS.map((b) => (
            <RewardBenefitCard key={b.id} benefit={b} onPress={() => handleBenefit(b)} />
          ))}
        </ScrollView>

        <SectionTitle title="Achievements" subtitle="Milestones on your wash journey" />
        {REWARD_ACHIEVEMENTS.map((a, i) => (
          <AchievementBadge key={a.id} achievement={a} index={i} />
        ))}

        <SectionTitle title="Offers & promos" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {REWARD_PROMOS.map((p) => (
            <RewardsPromoCard key={p.id} promo={p} onPress={() => handlePromo(p)} />
          ))}
        </ScrollView>

        <SectionTitle title="Refer friends" />
        <ReferralCard copy={REFERRAL_COPY} onShare={handleShare} />

        <Text style={[styles.disclaimer, { color: theme.text.muted }]}>
          WashPoints and tiers shown are preview data. Loyalty balances will sync with your account
          when the rewards program launches.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
    paddingTop: 12,
    gap: CUSTOMER_LAYOUT.sectionGap,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  screenSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 4,
    lineHeight: 19,
  },
  sectionHead: { marginTop: 4, marginBottom: -4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
  hScroll: {
    paddingRight: CUSTOMER_LAYOUT.screenPadding,
    gap: 0,
  },
  disclaimer: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 8,
    paddingHorizontal: 12,
  },
});
