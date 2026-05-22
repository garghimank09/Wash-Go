/**
 * Deep dependency check (require plugins). Run manually after reinstall if needed.
 */
require('./verify-deps.js');

const cp = require('@expo/config-plugins');
if (typeof cp.withPlugins !== 'function') {
  console.error('[verify-deps:full] @expo/config-plugins.withPlugins is not a function.');
  process.exit(1);
}

const plugin = require('@react-native-community/datetimepicker/app.plugin.js');
const fn = typeof plugin === 'function' ? plugin : plugin?.default;
if (typeof fn !== 'function') {
  console.error('[verify-deps:full] datetimepicker plugin invalid.');
  process.exit(1);
}

console.log('[verify-deps:full] OK');
