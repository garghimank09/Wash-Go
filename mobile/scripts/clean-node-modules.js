#!/usr/bin/env node
/**
 * Remove node_modules safely when iCloud leaves duplicate "name 2" folders
 * that break `rm -rf`.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules');

function rm(target, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      return true;
    } catch (err) {
      if (i === retries - 1) {
        console.error(`[clean] Failed: ${target} — ${err.message}`);
        return false;
      }
    }
  }
  return false;
}

if (!fs.existsSync(root)) {
  console.log('[clean] node_modules already absent.');
  process.exit(0);
}

let removed = 0;
let failed = 0;

// iCloud conflict copies: "foo 2", "@scope 2", etc.
for (const name of fs.readdirSync(root)) {
  if (/\s2$/.test(name)) {
    if (rm(path.join(root, name))) removed++;
    else failed++;
  }
}

if (!rm(root)) {
  failed++;
  console.error(
    '\n[clean] Could not delete node_modules fully.\n' +
      '  Move the project off iCloud Desktop (e.g. ~/Developer/Wash-Go),\n' +
      '  or disable Desktop & Documents sync, then run again.\n',
  );
  process.exit(1);
}

console.log(`[clean] Removed node_modules (${removed} iCloud duplicate folder(s) cleared first).`);
process.exit(0);
