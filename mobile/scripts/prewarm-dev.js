#!/usr/bin/env node
/**
 * Runs before `expo start` — fixes watchman, warns about iCloud, checks node_modules.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const nm = path.join(root, 'node_modules');

function run(cmd) {
  try {
    execSync(cmd, { stdio: 'ignore', cwd: root });
    return true;
  } catch {
    return false;
  }
}

if (root.includes('/Desktop/') || root.includes('iCloud')) {
  console.warn(
    '\n[prewarm] Project is on iCloud Desktop — Expo starts can take 10–20 min.\n' +
      '  Move to ~/Developer/Wash-Go for much faster Metro (recommended).\n',
  );
}

if (fs.existsSync(nm)) {
  try {
    const dupes = fs.readdirSync(nm).filter((name) => /\s2$/.test(name));
    if (dupes.length) {
      console.error(
        `\n[prewarm] Found ${dupes.length} iCloud duplicate folder(s) in node_modules.\n` +
          '  Run: npm run reinstall\n',
      );
      process.exit(1);
    }
  } catch {
    /* ignore */
  }
}

// Reset watchman for this project only (stops "Recrawled N times" slowdown).
run(`watchman watch-del "${root}"`);
run(`watchman watch-project "${root}"`);

// Remove stale Metro health-check files.
const health = path.join(root, '.metro-health-check');
if (fs.existsSync(health)) {
  try {
    fs.unlinkSync(health);
  } catch {
    /* ignore */
  }
}
