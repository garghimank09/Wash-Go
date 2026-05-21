/**
 * Ensures critical Expo / plugin files are readable (catches iCloud/offline node_modules).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules');

const readableFiles = [
  'expo-router/app.plugin.js',
  'expo-router/plugin/build/index.js',
  '@expo/config-plugins/package.json',
  '@expo/config-plugins/build/plugins/withPlugins.js',
  '@react-native-community/datetimepicker/app.plugin.js',
  '@react-native-community/datetimepicker/plugin/build/withDateTimePickerStyles.js',
];

let failed = false;

function checkReadable(rel) {
  const file = path.join(root, rel);
  try {
    fs.accessSync(file, fs.constants.R_OK);
    const buf = fs.readFileSync(file);
    if (!buf || buf.length < 2) {
      console.error(`[verify-deps] Empty or unreadable: ${rel}`);
      failed = true;
      return;
    }
    if (rel.endsWith('package.json')) {
      JSON.parse(buf.toString('utf8'));
    }
  } catch (err) {
    console.error(`[verify-deps] Cannot read ${rel}:`, err.message);
    failed = true;
  }
}

for (const rel of readableFiles) {
  checkReadable(rel);
}

// iCloud duplicate folders break resolution (e.g. "expo-modules-core 2")
try {
  const dupes = fs.readdirSync(root).filter((name) => /\s2$/.test(name));
  if (dupes.length) {
    console.error(
      `[verify-deps] Found ${dupes.length} iCloud duplicate folder(s) in node_modules, e.g. "${dupes[0]}".`,
    );
    failed = true;
  }
} catch {
  /* node_modules missing — install will fail elsewhere */
}

try {
  const cp = require('@expo/config-plugins');
  if (typeof cp.withPlugins !== 'function') {
    console.error('[verify-deps] @expo/config-plugins.withPlugins is not a function.');
    failed = true;
  }
} catch (err) {
  console.error('[verify-deps] @expo/config-plugins:', err.message);
  failed = true;
}

try {
  const plugin = require('@react-native-community/datetimepicker/app.plugin.js');
  const fn = typeof plugin === 'function' ? plugin : plugin?.default;
  if (typeof fn !== 'function') {
    console.error('[verify-deps] datetimepicker config plugin does not export a function.');
    failed = true;
  }
} catch (err) {
  console.error('[verify-deps] datetimepicker plugin:', err.message);
  failed = true;
}

if (failed) {
  console.error(
    '\n[verify-deps] node_modules is broken or on iCloud.\n' +
      '  Fix: cd mobile && npm run reinstall\n' +
      '  Best: move repo to ~/Developer/Wash-Go (not iCloud Desktop).\n',
  );
  process.exit(1);
}
