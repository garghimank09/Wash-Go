/**
 * Fast postinstall check — stat/read only, no heavy require() (slow on iCloud).
 * Full check: npm run verify-deps:full
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules');

const readableFiles = [
  'expo-router/app.plugin.js',
  'expo-router/plugin/build/index.js',
  '@expo/config-plugins/package.json',
  'getenv/package.json',
];

let failed = false;

function checkReadable(rel) {
  const file = path.join(root, rel);
  try {
    fs.accessSync(file, fs.constants.R_OK);
    const buf = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
    if (!buf || buf.length < 2) {
      console.error(`[verify-deps] Empty or unreadable: ${rel}`);
      failed = true;
      return;
    }
    if (rel.endsWith('package.json')) {
      JSON.parse(buf);
    }
  } catch (err) {
    console.error(`[verify-deps] Cannot read ${rel}:`, err.message);
    failed = true;
  }
}

for (const rel of readableFiles) {
  checkReadable(rel);
}

try {
  const dupes = fs.readdirSync(root).filter((name) => /\s2$/.test(name));
  if (dupes.length) {
    console.error(
      `[verify-deps] Found ${dupes.length} iCloud duplicate folder(s), e.g. "${dupes[0]}".`,
    );
    failed = true;
  }
} catch {
  /* node_modules missing */
}

if (failed) {
  console.error(
    '\n[verify-deps] node_modules is broken or on iCloud.\n' +
      '  Fix: cd mobile && npm run reinstall\n' +
      '  Best: move repo to ~/Developer/Wash-Go (not iCloud Desktop).\n',
  );
  process.exit(1);
}
