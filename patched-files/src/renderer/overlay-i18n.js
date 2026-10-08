'use strict';
// Chinese strings for the compact in-game panel and the Overlay page.
// English is the key: anything missing here falls back to the original
// English, so a gap shows up as English rather than as a blank panel.
//
// Two places load this file and they get their language from different
// sources: the in-game surface is a separate window that has no i18n.js and
// learns the language over its IPC channel, while the Overlay page's preview
// runs inside the main window where window.i18n already knows it.
(function () {
  const ZH = {
    // ---- panel chrome -------------------------------------------------
    'DLSS 5 SWAPPER CONTROLS': 'DLSS 5 画质交换器 · 控制面板',
    'DLSS 5 SWAPPER · INJECTED TOOLS': 'DLSS 5 画质交换器 · 注入工具',
    PREVIEW: '预览', CONNECTED: '已连接', 'NOT CONNECTED': '未连接',
    DISCONNECTED: '未连接', 'LIVE RESHADE': 'RESHADE 实时',
    'Preview only': '仅预览', 'RenoDX live': 'RenoDX 实时', 'Waiting for RenoDX': '等待 RenoDX',
    'Waiting for game connection': '等待游戏连接',
    'Shows DLSS 5 On/Off over the game': '在游戏画面上显示 DLSS 5 开 / 关状态',
    // ---- panel sections ------------------------------------------------
    'DLSS ON': 'DLSS 神经渲染 开',
    'ON-SCREEN STATUS': '游戏内状态角标',
    'GLOBAL CONTROLS': '全局控制',
    MODELS: '模型',
    'MORE RENODX CONTROLS': '更多 RenoDX 控制',
    'NR STYLE': 'NR 风格',
    'FEEDER CONTROLS': 'FEEDER 控制',
    'DEVELOPER MASKING': '开发者遮罩',
    'MODEL AUTOMASK': '模型自动遮罩',
    'CHARACTER MASK': '角色遮罩',
    'RenoDX character mask': 'RenoDX 角色遮罩',
    'SDK required': '需要 SDK',
    'Demo groups': '演示分组',
    'Preview selection': '预览选择',
    // demo group names in the design preview
    Pitcher: '水罐', Grapes: '葡萄', Bottles: '瓶子',
    // ---- panel buttons and notes ---------------------------------------
    'Live tools': '实时工具', 'DLSS controls': 'DLSS 控制',
    'Show RenoDX extras': '显示 RenoDX 附加项', 'Show Feeder controls': '显示 Feeder 控制',
    'Preview: Feeder + RenoDX': '预览：Feeder + RenoDX', 'Preview: RenoDX': '预览：RenoDX',
    Unavailable: '不可用',
    'ReShade shader effects': 'ReShade 着色器效果',
    'No separate .fx shader controls found. RenoDX controls above do not require .fx shaders.':
      '未发现独立的 .fx 着色器控件。上面的 RenoDX 控件不需要 .fx 着色器。',
    'Restart DLSS 5 Swapper and connect the updated overlay to load RenoDX controls.':
      '重启 DLSS 5 Swapper 并连接新版叠加层，即可加载 RenoDX 控件。',
    'Design preview; no game connection.': '设计预览；未连接游戏。',
    'RenoDX controls use its original callback. FX controls below are separate. Experimental adapter; original tool windows remain available.':
      'RenoDX 控件走它自己的回调；下面的 FX 控件是独立的。适配器为实验性，原始工具窗口仍可使用。',
    'Waiting for compatible RenoDX. FX controls do not control DLSS.':
      '等待兼容的 RenoDX。FX 控件不控制 DLSS。',
    'Waiting for the verified RenoDX build. Connection is automatic; a build this overlay does not know is refused. Original tools remain available.':
      '等待已验证的 RenoDX 版本。连接是自动的；本叠加层不认识的版本会被拒绝。原始工具仍可使用。',
    'Live RenoDX settings. A/B/C select NR Style, not AI models. Scroll More Controls; click a number to type. Home keeps the original tools available.':
      '实时 RenoDX 设置。A/B/C 选的是 NR 风格，不是 AI 模型。向下滚动查看更多控件；点数字可直接输入。Home 可打开原始工具。',
    'Interactive design preview only. Changes here do not affect a game. The installed overlay connects automatically to the verified RenoDX build.':
      '仅为交互式设计预览，此处修改不会影响游戏。已安装的叠加层会自动连接已验证的 RenoDX 版本。',
    'On-screen status card': '游戏内状态角标',
    'Design inspired by the NVIDIA reference. Masking, models and DLSS sliders are not connected to the SDK.':
      '设计参考 NVIDIA 官方界面。遮罩、模型与 DLSS 滑块未接入 SDK。',
    // ---- RenoDX controls (labels sent by the add-on) --------------------
    'Structure Intensity': '结构强度',
    'Tone Intensity': '色调强度',
    Model: '模型',
    'Global Tone Intensity': '全局色调强度',
    'Enable DLSS Neural Rendering': '启用 DLSS 神经渲染',
    'Automatic / Character Mask': '自动 / 角色遮罩',
    'Character/Skin Structure': '角色 / 皮肤结构',
    'Overall Intensity': '整体强度',
    'Local Tone Intensity': '局部色调强度',
    'Diffuse White (nits)': '漫反射白点（nit）',
    'Motion Scale X Multiplier': '运动缩放 X 倍率',
    'Motion Scale Y Multiplier': '运动缩放 Y 倍率',
    'NR UI Correction': 'NR 界面校正',
    'Enable Upscaling (WIP)': '启用超分（实验）',
    'NR Preset': 'NR 预设',
    'NR Style': 'NR 风格',
    'Depth Convention': '深度约定',
    // ---- Feeder controls (labels sent by the add-on) --------------------
    'Feeder enabled (original panel)': 'Feeder 总开关（原始面板）',
    'Work resolution (%)': '工作分辨率（%）',
    'Work sharpness': '工作锐度',
    'Motion scale X': '运动缩放 X',
    'Motion scale Y': '运动缩放 Y',
    'HDR contract': 'HDR 契约',
    'Depth convention': '深度约定',
    'Depth convention (-1 auto, 0 normal, 1 inverted)': '深度约定（-1 自动，0 正常，1 反转）',
    'Work upscale': '工作分辨率超分',
    'Upscale (0 bilinear, 1 FSR1, 2 DLSS SR)': '超分方式（0 双线性，1 FSR1，2 DLSS SR）',
    'HDR10 bridge': 'HDR10 桥接',
    'HDR10 bridge (-1 auto, 0 off, 1 on)': 'HDR10 桥接（-1 自动，0 关，1 开）',
    'HDR paper white (nits)': 'HDR 纸白亮度（nit）',
    'Output stabiliser hold': '输出稳定保持',
    'Stabiliser change tolerance': '稳定变化容差',
    // ---- dropdown values (shown, never compared) ------------------------
    Default: '默认', Natural: '自然', Cinematic: '电影感',
    'Preset #1': '预设 #1', 'Preset #2': '预设 #2', 'Preset #3': '预设 #3',
    Auto: '自动', Off: '关', On: '开', Normal: '正常', Inverted: '反转',
    'Force SDR': '强制 SDR', 'Force HDR': '强制 HDR', Bilinear: '双线性',
    'DLSS SR (experimental)': 'DLSS SR（实验）',
    'Use game NGX flag': '使用游戏 NGX 标记',
    'Force normal depth': '强制正常深度',
    'Force inverted depth': '强制反转深度',
    // ---- status / reasons reported by the add-on ------------------------
    'Bridge is off': '桥接已关闭',
    'RenoDX is not loaded': 'RenoDX 未加载',
    'Unsupported RenoDX binary; this build drives RenoDX 6.5.3 and v4.7':
      '不支持的 RenoDX 版本；本版本适配 RenoDX 6.5.3 与 v4.7',
    'Unexpected ImGui interface; bridge refused': 'ImGui 接口不符合预期，桥接已拒绝',
    'RenoDX code fingerprint mismatch': 'RenoDX 代码指纹不匹配',
    'UI dispatch changed; bridge refused': 'UI 分发方式已改变，桥接已拒绝',
    'RenoDX controls unavailable': 'RenoDX 控件不可用',
    'RenoDX controls unavailable.': 'RenoDX 控件不可用。',
    'Feeder is not loaded': 'Feeder 未加载',
    'Unsupported Feeder binary (this build drives x64 v1.17.0)':
      '不支持的 Feeder 版本（本版本适配 x64 v1.17.0）',
    'Feeder config unavailable; let Feeder initialize': 'Feeder 配置不可用，请先让 Feeder 完成初始化',
    'Feeder cfg changed or write failed; retry': 'Feeder 配置被改动或写入失败，请重试',
    'Design preview only. Feeder cfg controls; work resolution, filter and sharpness require DX11.':
      '仅为设计预览。Feeder 配置项：工作分辨率、滤镜与锐度需要 DX11。',
    'Feeder cfg reloads every 60 delivered frames. Work resolution/filter/sharpness and the HDR10 bridge: DX11 only. NR is separate.':
      'Feeder 每交付 60 帧重载一次配置。工作分辨率 / 滤镜 / 锐度与 HDR10 桥接仅在 DX11 生效；NR 是独立通道。',
    'Enable Feeder and select an active mode in its original page. Disabled/inert Feeder does not reload cfg.':
      '请先在 Feeder 原始页面启用并选择生效模式；关闭或未生效时不会重载配置。',
    'DLSS 5 Swapper must remain open. Waiting for the shared panel design (one test game at a time)...':
      'DLSS 5 Swapper 必须保持运行。正在等待共享面板…（同一时间只支持一个测试游戏）',
    'The renderer could not create the panel surface.': '渲染器无法创建面板画面。',
    // ---- Overlay page (main window) -------------------------------------
    Overlay: '叠加层',
    'Choose your style. Preview it, then make it yours.': '选择你的风格，先预览，再定下来。',
    'Install overlay with DLSS': '安装 DLSS 时一并安装叠加层',
    '＋ Add Overlay': '＋ 添加叠加层',
    Hotkey: '热键',
    'Developer files': '开发者文件',
    Emerald: '翡翠绿', Azure: '蔚蓝', Amethyst: '紫水晶',
    '✓ Selected': '✓ 已选', Select: '选择', '◉ Preview': '◉ 预览',
    'Delete this theme': '删除该主题',
    'Custom native overlay: browser preview unavailable. Only test trusted files.':
      '外部原生叠加层：无法在浏览器中预览，请只测试可信文件。',
    'Install separately': '单独安装', Remove: '移除',
    'Existing installations': '已有安装', 'Remove overlay only': '仅移除叠加层',
    'Saved.': '已保存。', 'Done.': '完成。',
    'Create a theme': '创建主题',
    "Pick an accent colour. The panel's other shades are derived from it.":
      '选一个强调色，面板的其他色调由它推导。',
    Colour: '颜色', Name: '名称', Cancel: '取消', Save: '保存',
    'Give the theme a name.': '请给主题起个名字。', 'My theme': '我的主题',
    'Overlay hotkey': '叠加层热键',
    'Click the field, then press your shortcut. Ctrl, Alt and Shift are supported. Home / Escape stay reserved for ReShade.':
      '点一下输入框再按快捷键。支持 Ctrl、Alt、Shift；Home 与 Esc 保留给 ReShade。',
    'Demo preview': '演示预览',
    'Interactive demo · no game changes': '交互演示 · 不会修改游戏',
    'Reserved / unsupported key. Try F9 or Ctrl + Shift + O.':
      '保留键或不支持的按键，试试 F9 或 Ctrl + Shift + O。',
    'Overlay service is not running. Restart DLSS 5 Swapper, then press the hotkey in game.':
      '叠加层服务未运行。重启 DLSS 5 Swapper 后在游戏内按热键。',
    'Overlay service connected to a running game.': '叠加层服务已连接到正在运行的游戏。',
    'Overlay service ready, waiting for a game. Keep DLSS 5 Swapper open and press the hotkey in game.':
      '叠加层服务已就绪，等待游戏接入。保持 DLSS 5 Swapper 运行并在游戏内按热键。',
  };

  // The footer line is the one string the panel builds from a hotkey name.
  const ZH_FOOTER = '{0}：显示 / 隐藏 · 拖动标题栏移动 · Esc 关闭 · Home 打开原始工具';
  const EN_FOOTER = '{0}: show/hide · Drag header: move · Esc: close · Home: original tools';

  let runtimeLang = null;
  const listeners = [];
  const current = () => {
    if (window.i18n?.getLang) return window.i18n.getLang() || 'en';
    return runtimeLang || 'en';
  };
  const isChinese = () => String(current()).toLowerCase().startsWith('zh');
  const OT = (en) => {
    const text = String(en);
    if (!isChinese()) return text;
    return Object.prototype.hasOwnProperty.call(ZH, text) ? ZH[text] : text;
  };
  const hotkeyFooter = (hotkey) => (isChinese() ? ZH_FOOTER : EN_FOOTER).replace('{0}', hotkey || 'F8');

  window.overlayI18n = {
    OT,
    hotkeyFooter,
    lang: current,
    isChinese,
    // From the panel window's IPC channel. Announced before anything renders.
    set(code) {
      const next = String(code || 'en');
      if (next === runtimeLang) return;
      runtimeLang = next;
      for (const fn of listeners) fn(next);
    },
    onChange(fn) { listeners.push(fn); },
    strings: ZH,
  };
})();
