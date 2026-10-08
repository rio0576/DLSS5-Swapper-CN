'use strict';
// The in-game surface. Its language arrives over IPC (the add-on's window has
// no i18n.js), and a change has to re-mount: every label is built once when
// the panel is assembled.
const root = document.getElementById('panel');
let preferences = null;
function paint() {
  if (!preferences) return;
  window.applyOverlayTheme(root, preferences);
  const k = preferences.hotkey.key;
  const name = k >= 112 ? `F${k - 111}` : ({ 32: 'Space', 33: 'PageUp', 34: 'PageDown', 35: 'End', 37: 'Left', 38: 'Up', 39: 'Right', 40: 'Down', 45: 'Insert', 46: 'Delete' }[k] || String.fromCharCode(k));
  root.dataset.overlayHotkey = [preferences.hotkey.mods & 1 ? 'Ctrl' : '', preferences.hotkey.mods & 2 ? 'Alt' : '', preferences.hotkey.mods & 4 ? 'Shift' : '', name].filter(Boolean).join(' + ');
  const footer = root.querySelector('.ol-live-hotkey');
  if (footer) footer.textContent = window.overlayI18n.hotkeyFooter(root.dataset.overlayHotkey);
}
function mount() { window.mountOverlayPanel(root); window.mountOverlayLive(root); paint(); }
window.overlayRuntime.onPreferences(value => { preferences = value; paint(); });
window.overlayRuntime.onLanguage(code => { window.overlayI18n.set(code); mount(); });
mount();
