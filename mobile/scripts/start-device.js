#!/usr/bin/env node
/**
 * Start Expo for a physical device on the same Wi‑Fi.
 * - Picks LAN IP automatically (en0 / en1)
 * - Kills stale Metro on 8081
 * - Forces --lan so the phone can load the bundle
 */
const { execSync, spawn } = require('child_process');
const os = require('os');

function getLanIp() {
  const ifaces = os.networkInterfaces();
  for (const name of ['en0', 'en1', 'wlan0', 'eth0']) {
    const list = ifaces[name];
    if (!list) continue;
    for (const iface of list) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  for (const list of Object.values(ifaces)) {
    for (const iface of list) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const ip = process.env.REACT_NATIVE_PACKAGER_HOSTNAME || getLanIp();
const extraArgs = process.argv.slice(2);
const args = ['expo', 'start', '--lan', ...extraArgs];

console.log(`\nWashGo dev server → http://${ip}:8081`);
console.log('Use Expo Go and scan the QR code, or open exp://' + ip + ':8081');
console.log('Phone and Mac must be on the same Wi‑Fi. Enable Local Network for Expo Go on iOS.\n');

try {
  execSync('lsof -ti:8081 | xargs kill -9 2>/dev/null', { stdio: 'ignore', shell: true });
} catch {
  /* no stale process */
}

const child = spawn('npx', args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    REACT_NATIVE_PACKAGER_HOSTNAME: ip,
    EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
  },
  cwd: require('path').join(__dirname, '..'),
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
