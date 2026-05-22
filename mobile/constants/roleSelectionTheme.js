/**
 * Brand + environment tokens for role selection.
 * Palette: Deep #0A1E3D · Primary #1E4D8F · Accent #288CFF · Light #EAEFFF · White #FFFFEF · Gray #94A3B8
 */

export const ROLE_COLORS = {
  deepBlue: '#0A1E3D',
  primaryBlue: '#1E4D8F',
  accentBlue: '#288CFF',
  lightBlue: '#EAEFFF',
  white: '#FFFFEF',
  textGray: '#94A3B8',
};

export const ROLE_PALETTE = {
  customer: {
    base: '#061632',
    deep: '#040E1F',
    mid: ROLE_COLORS.deepBlue,
    surface: '#10305F',
    glow: ROLE_COLORS.accentBlue,
    glowSoft: 'rgba(40, 140, 255, 0.35)',
    accent: ROLE_COLORS.accentBlue,
    bloom: 'rgba(94, 175, 255, 0.22)',
    floor: 'rgba(6, 22, 50, 0.92)',
    droplet: 'rgba(180, 220, 255, 0.45)',
    title: ROLE_COLORS.white,
    subtitle: ROLE_COLORS.white,
    text: ROLE_COLORS.white,
    textMuted: 'rgba(255, 255, 239, 0.85)',
    label: ROLE_COLORS.white,
  },
  partner: {
    base: ROLE_COLORS.lightBlue,
    deep: '#D4ECFC',
    mid: '#F4FAFF',
    surface: ROLE_COLORS.white,
    glow: ROLE_COLORS.accentBlue,
    glowSoft: 'rgba(40, 140, 255, 0.2)',
    accent: ROLE_COLORS.primaryBlue,
    bloom: 'rgba(255, 255, 255, 0.55)',
    floor: 'rgba(228, 242, 252, 0.95)',
    mist: 'rgba(255, 255, 255, 0.42)',
    spark: 'rgba(40, 140, 255, 0.35)',
    title: ROLE_COLORS.deepBlue,
    subtitle: ROLE_COLORS.textGray,
    text: ROLE_COLORS.deepBlue,
    textMuted: ROLE_COLORS.textGray,
    label: ROLE_COLORS.deepBlue,
  },
  brand: {
    wash: ROLE_COLORS.deepBlue,
    goStart: ROLE_COLORS.accentBlue,
    goEnd: ROLE_COLORS.primaryBlue,
    welcome: ROLE_COLORS.deepBlue,
    subtitle: ROLE_COLORS.textGray,
    footer: ROLE_COLORS.textGray,
  },
};

export const ROLE_GRADIENTS = {
  customer: ['#040E1F', '#061632', '#0A1E3D', '#10305F'],
  customerSpot: [
    'rgba(43, 156, 255, 0.28)',
    'rgba(43, 156, 255, 0.08)',
    'transparent',
  ],
  customerBloom: [
    'transparent',
    'rgba(43, 156, 255, 0.12)',
    'rgba(43, 156, 255, 0.22)',
    'transparent',
  ],
  customerFloor: [
    'transparent',
    'rgba(43, 156, 255, 0.08)',
    'rgba(43, 156, 255, 0.18)',
    'rgba(6, 22, 50, 0.95)',
  ],
  partner: ['#FFFFFF', '#F8FCFF', '#EAF6FF', '#D8EDFA'],
  partnerSpot: [
    'rgba(255, 255, 255, 0.9)',
    'rgba(43, 156, 255, 0.06)',
    'transparent',
  ],
  partnerBloom: [
    'transparent',
    'rgba(255, 255, 255, 0.35)',
    'rgba(43, 156, 255, 0.1)',
    'transparent',
  ],
  partnerFloor: [
    'transparent',
    'rgba(255, 255, 255, 0.5)',
    'rgba(212, 236, 252, 0.85)',
    'rgba(228, 242, 252, 0.98)',
  ],
  heroReflectionCustomer: [
    'rgba(43, 156, 255, 0.15)',
    'rgba(6, 22, 50, 0)',
  ],
  heroReflectionPartner: [
    'rgba(43, 156, 255, 0.08)',
    'rgba(255, 255, 255, 0)',
  ],
};

export const ROLE_LAYOUT = {
  composition: {
    regionWidthRatio: 0.5,
    horizontalPad: 10,
    /** Space reserved above global footer for CTA block (px, before safe area). */
    ctaBlockHeight: 118,
    footerReserve: 20,
    /** Light top inset inside composition column (bottom-weighted layout). */
    contentTopPadding: 8,
    /** Grounds hero + CTA above global footer. */
    contentBottomPadding: 48,
    heroBottomPadding: 20,
    ctaTopPadding: 12,
    /** Caps hero slot height without shrinking image scale ratios. */
    heroMaxHeightRatio: 0.6,
  },
  hero: {
    /** Customer car wider than region — front half peeks from the left edge. */
    widthRatioCustomer: 1.85,
    widthRatioPartner: 1.35,
    /** Hero height as fraction of composition content area (between header and CTA). */
    heightRatioOfContent: 0.83,
    reflectionHeightRatio: 0.2,
    reflectionOpacity: 0.28,
    /** Fraction of regionWidth — negative shifts car left (half-car peek at neutral). */
    customerPeekShiftX: -0.12,
    /** Fraction of regionWidth — target at full slide (centered in region). */
    customerRevealShiftX: 0,
    partnerPeekShiftX: 0,
    partnerRevealShiftX: 0,
    /** Framing-only scale at neutral (slightly larger → settles to 1 during drag). */
    customerFramingScaleNeutral: 1.04,
    customerFramingScaleActive: 1,
  },
  arrow: {
    size: 52,
    trackHeight: 4,
  },
  header: {
    logoSize: 52,
    welcomeSize: 17,
    subtitleSize: 15,
  },
};

export const ROLE_SHADOW = {
  arrowCustomer: {
    shadowColor: '#288CFF',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  arrowPartner: {
    shadowColor: '#288CFF',
    shadowOpacity: 0.42,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  heroCustomer: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 16,
  },
};
