#!/usr/bin/env node
/**
 * Remove node_modules when iCloud leaves duplicate "name 2" folders.
 * Renames the folder aside (instant) so npm install can proceed; deletes trash in background.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mobileRoot = path.join(__dirname, '..');
const root = path.join(mobileRoot, 'node_modules');

if (!fs.existsSync(root)) {
  console.log('[clean] node_modules already absent.');
  process.exit(0);
}

const trash = path.join(mobileRoot, `.node_modules.trash.${Date.now()}`);

try {
  fs.renameSync(root, trash);
  console.log(`[clean] Moved node_modules aside → ${path.basename(trash)}`);
} catch (err) {
  console.error(`[clean] Could not move node_modules: ${err.message}`);
  console.error(
    '  Move the project off iCloud Desktop (e.g. ~/Developer/Wash-Go),\n' +
      '  or disable Desktop sync, then run again.',
  );
  process.exit(1);
}

// Delete old tree in background (slow on iCloud; does not block install)
spawn('rm', ['-rf', trash], { detached: true, stdio: 'ignore' }).unref();
console.log('[clean] Deleting old node_modules in background…');
process.exit(0);
