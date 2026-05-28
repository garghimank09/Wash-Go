import { MarketingHero } from './MarketingHero';
import { MarketingStatsStrip } from './MarketingStatsStrip';
import { WhyWashGoSection } from './WhyWashGoSection';
import { HowItWorksSection } from './HowItWorksSection';
import { EcoTrustSection } from './EcoTrustSection';
import { ProductShowcaseSection } from './ProductShowcaseSection';
import { MarketingFeaturesSection } from './MarketingFeaturesSection';
import { PremiumServicesSection } from './premium/PremiumServicesSection';
import { PremiumPricingSection } from './premium/PremiumPricingSection';
import { PremiumBookingSection } from './premium/PremiumBookingSection';
import { PremiumTrackingSection } from './premium/PremiumTrackingSection';
import { PremiumBeforeAfterSection } from './premium/PremiumBeforeAfterSection';
import { PremiumTestimonialsSection } from './premium/PremiumTestimonialsSection';
import { PremiumBrandMarquee } from './premium/PremiumBrandMarquee';
import { PremiumMobileSection } from './premium/PremiumMobileSection';
import { PremiumAISection } from './premium/PremiumAISection';

export function LandingHome() {
  return (
    <main className="wg-premium-page min-w-0 overflow-x-hidden pt-20">
      <MarketingHero />
      <MarketingStatsStrip />
      <WhyWashGoSection />
      <HowItWorksSection />
      <PremiumServicesSection />
      <EcoTrustSection />
      <ProductShowcaseSection />
      <MarketingFeaturesSection />
      <PremiumBookingSection />
      <PremiumPricingSection />
      <PremiumTrackingSection />
      <PremiumBeforeAfterSection />
      <PremiumTestimonialsSection />
      <PremiumBrandMarquee />
      <PremiumMobileSection />
      <PremiumAISection />
    </main>
  );
}
