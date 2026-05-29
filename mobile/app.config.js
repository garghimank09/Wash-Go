const path = require('path');

// Load mobile/.env so GOOGLE_MAPS_API_KEY is available when Expo evaluates this file.
try {
  require('@expo/env').load(path.resolve(__dirname));
} catch {
  // Expo CLI also loads .env when you run `expo start` / `expo run:*`.
}

/**
 * Injects GOOGLE_MAPS_API_KEY into native config (Android + iOS).
 * Set GOOGLE_MAPS_API_KEY or EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in mobile/.env.
 *
 * Custom keys do not work in Expo Go — rebuild after changing .env:
 *   npx expo run:android
 *   npx expo run:ios
 */
function withReactNativeMapsPlugin(plugins, googleMapsApiKey) {
  const next = [...(plugins || [])];
  const idx = next.findIndex(
    (p) => p === 'react-native-maps' || (Array.isArray(p) && p[0] === 'react-native-maps'),
  );
  const entry = [
    'react-native-maps',
    {
      androidGoogleMapsApiKey: googleMapsApiKey,
      iosGoogleMapsApiKey: googleMapsApiKey,
    },
  ];
  if (idx >= 0) next[idx] = entry;
  else next.push(entry);
  return next;
}

module.exports = ({ config }) => {
  const googleMapsApiKey =
    process.env.GOOGLE_MAPS_API_KEY?.trim() ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    '';

  if (!googleMapsApiKey) {
    console.warn(
      '[WashGo] GOOGLE_MAPS_API_KEY is missing in mobile/.env — Android map tiles may be blank.',
    );
  }

  return {
    ...config,
    plugins: withReactNativeMapsPlugin(config.plugins, googleMapsApiKey),
    android: {
      ...config.android,
      config: {
        ...(config.android?.config || {}),
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...config.ios,
      infoPlist: {
        ...(config.ios?.infoPlist || {}),
        LSApplicationQueriesSchemes: [
          ...new Set([
            ...(config.ios?.infoPlist?.LSApplicationQueriesSchemes || []),
            'tel',
            'telprompt',
            'sms',
          ]),
        ],
      },
      config: {
        ...(config.ios?.config || {}),
        googleMapsApiKey,
      },
    },
    extra: {
      ...(config.extra || {}),
      googleMapsApiKey,
    },
  };
};
