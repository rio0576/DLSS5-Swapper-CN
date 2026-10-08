'use strict';
const path = require('node:path');
const { createOverlayLibrary } = require('./overlays');

module.exports = function registerOverlayIpc({ app, ipcMain, dialog, shell, window, bridge = () => null, language = () => 'en' }) {
  const appRoot = path.resolve(__dirname, '..');
  // These are Windows dialogs, so they cannot come from i18n.js.
  const uiText = (zh, en) => (String(language() || 'en').toLowerCase().startsWith('zh') ? zh : en);
  // Installed, the built add-on rides along as an extra resource; from source it
  // is whatever scripts/build-overlay.ps1 last produced.
  const builtin = () => (app.isPackaged
    ? path.join(process.resourcesPath, 'overlay', 'dlss5-lab-overlay.addon64')
    : path.join(appRoot, 'dist/overlay/dlss5-lab-overlay.addon64'));
  // Never let an overlay be installed over the app's own directory.
  const forbidden = () => [appRoot, app.isPackaged ? path.dirname(app.getPath('exe')) : appRoot];
  const library = () => createOverlayLibrary(path.join(app.getPath('userData'), 'overlay-library'),
    builtin(), forbidden());
  const handle = (name, fn) => ipcMain.handle(`overlay-${name}`, async (_event, ...args) => {
    try { return { ok: true, value: await fn(...args) }; }
    catch (error) { return { ok: false, error: error.message }; }
  });
  handle('list', () => library().list());
  // What the panel in the game is waiting for, said on the Overlay page:
  // whether the service is up at all, and whether a game is attached.
  handle('bridge', () => {
    const live = bridge();
    const state = live ? live.state() : { listening: false, connected: false, game: false };
    // The service can be listening perfectly while the add-on the game has to
    // load is not there at all - antivirus takes it, and nothing said so.
    // resolve() hashes the file, so a truncated or gutted one throws rather
    // than reporting itself absent. Either way the game cannot load it.
    let addon = false, addonFile = null;
    try { const entry = library().resolve('builtin'); addon = Boolean(entry.ready); addonFile = entry.file; }
    catch { addon = false; }
    return { ...state, addon, addonFile };
  });
  handle('preferences',()=>require('./overlay-preferences').read(app.getPath('userData')));
  handle('save-preferences',patch=>require('./overlay-preferences').save(app.getPath('userData'),patch));
  handle('add', async () => {
    const picked = await dialog.showOpenDialog(window(), { title: uiText('添加自定义 ReShade 叠加层', 'Add a custom ReShade overlay'), properties: ['openFile'], filters: [{ name: uiText('ReShade 原生插件', 'ReShade native add-ons'), extensions: ['addon64', 'addon32'] }] });
    if (picked.canceled) return null;
    const confirm = await dialog.showMessageBox(window(), { type: 'warning', title: uiText('原生插件 —— 仅限可信来源', 'Native add-on — trusted developers only'),
      message: uiText('这个文件包含原生代码。ReShade 插件被游戏加载后可以访问你的文件。', 'This file contains native code. A ReShade add-on can access your files when loaded by a game.'),
      detail: uiText('在这里添加只是保存一份副本，不会在本程序里运行它。校验值并不能证明文件是安全的。', 'Adding it here only stores a copy; it is not executed here. A checksum does not certify that the file is safe.'),
      buttons: [uiText('取消', 'Cancel'), uiText('添加可信文件', 'Add trusted file')], defaultId: 0, cancelId: 0 });
    return confirm.response === 1 ? library().add(picked.filePaths[0]) : null;
  });
  handle('remove', async id => {
    const entry = library().resolve(id);
    if (entry.builtin) throw Error('The built-in overlay cannot be deleted.');
    const confirm = await dialog.showMessageBox(window(), { type: 'question', message: uiText(`要移除 ${entry.name} 吗？`, `Remove ${entry.name}?`), detail: uiText('你最初导入的文件会被保留。', 'Your original imported file is kept.'), buttons: [uiText('取消', 'Cancel'), uiText('移除', 'Remove')], defaultId: 0, cancelId: 0 });
    if (confirm.response === 1) library().remove(id);
  });
  handle('install', async id => {
    const entry = library().resolve(id);
    if (!entry.ready) throw Error('Build the experimental add-on first (see Developer files).');
    const picked = await dialog.showOpenDialog(window(), { title: uiText('选择一个已关闭、支持 ReShade 插件的离线测试游戏', 'Select a CLOSED offline test game with ReShade add-on support'), properties: ['openFile'], filters: [{ name: uiText('Windows 游戏可执行文件', 'Windows game executable'), extensions: ['exe'] }] });
    if (picked.canceled) return null;
    const confirm = await dialog.showMessageBox(window(), { type: 'warning', title: uiText('叠加层测试 —— 这不是 DLSS 安装', 'Overlay test — not a DLSS installation'),
      message: uiText('请确认游戏已关闭，并且已经在使用支持插件的 ReShade。测试内置叠加层期间请保持 DLSS 5 Swapper 运行。', 'Confirm the game is closed and already uses ReShade with add-on support. Keep DLSS 5 Swapper open while testing the built-in overlay.'),
      detail: uiText(`${picked.filePaths[0]}\n\n只会在该可执行文件旁复制一个唯一命名的叠加层插件，不会替换任何已有的 DLL 或配置文件，也不会改动 Vulkan 注册表。请避开联网 / 反作弊游戏。\n\n这个叠加层通过一个未公开、绑定确切版本的 v4.7 适配器自动连接，并会临时改写它的 UI 分发。这可能与其他插件不兼容。你修改的设置由 RenoDX 自己保存。这不是 NVIDIA 官方 SDK 或官方叠加层。`,
        `${picked.filePaths[0]}\n\nOnly a uniquely named overlay add-on is copied next to this executable. No existing DLLs or configuration files are replaced by installation. No Vulkan registry changes. Avoid online / anti-cheat games.\n\nThis overlay automatically connects through an undocumented, exact-build v4.7 adapter that temporarily redirects its UI dispatch. This may be incompatible with other add-ons. RenoDX itself saves settings you change. This is not NVIDIA's official SDK or overlay.`),
      buttons: [uiText('取消', 'Cancel'), uiText('安装测试叠加层', 'Install test overlay')], defaultId: 0, cancelId: 0 });
    return confirm.response === 1 ? library().install(id, picked.filePaths[0]) : null;
  });
  handle('uninstall', async id => {
    const confirm = await dialog.showMessageBox(window(), { type: 'question', message: uiText('测试游戏已经关闭了吗？', 'Is the test game closed?'), detail: uiText('只移除本程序复制过去、且未被修改过的叠加层。ReShade、DLSS、预设以及所有原始文件都会保留。', 'Remove only the unchanged overlay this app copied. Keep ReShade, DLSS, presets, and every original file.'), buttons: [uiText('取消', 'Cancel'), uiText('移除测试叠加层', 'Remove test overlay')], defaultId: 0, cancelId: 0 });
    if (confirm.response === 1) library().uninstall(id);
  });
  handle('source', async () => {
    const error = await shell.openPath(path.join(appRoot, 'overlay'));
    if (error) throw Error(error);
  });
};
