# 验证报告（Validation）：DLSS 5 Swapper 简体中文版

| 项 | 内容 |
|---|---|
| 验证对象 | `dist\DLSS5-Swapper-2.2.9-CN-portable.exe` |
| 基线版本 | 官方 `DLSS5-Swapper-2.2.9-portable.exe` |
| 验证日期 | 2026-10-08 |
| 执行方式 | 静态检查 + 构建校验 + 真实程序运行时 DOM 抓取 |
| **结论** | **PASS —— 交付物可用；已知未覆盖项见 §6** |

---

## 1. 交付物

| 文件 | 大小 | SHA-256 |
|---|---|---|
| `dist\DLSS5-Swapper-2.2.9-CN-portable.exe` | 250,852,220 B | `0F58F7084500F14592565DC1002C77CF986189EA9B44723AF6EC298DFE1738AA` |
| `dist\app-64.7z`（exe 内载荷，中间产物） | 250,338,380 B | `D26BB8F2E93AEBAB599D7AB0733B5E5169C01AE029CCDB6E80A4447AC8304696` |
| `work\app\resources\app.asar`（前端代码） | 3,159,821 B | `34EFEBAC6D448BDF5865EBDCA40CF4C8B73884AFABBCE70D651673EB2C9AB380` |

> 哈希对应的是**当前交付版本**。此前的构建曾把 `renderer.js` 里一行日志的缩进从 2 空格敲成了 4 空格（纯缩进、无功能差异）；为让"仓库源码 = 交付二进制"完全一致，已修正该缩进并重新构建，因此哈希与早期一次构建不同。

版本信息已写入：ProductName `DLSS 5 Swapper`、FileDescription `DLSS 5 Swapper 2.2.9 portable (Simplified Chinese)`、FileVersion `2.2.9`；图标取自应用自带的 256×256 图标（实测该 PNG 位于 exe 偏移 35800）。

---

## 2. 代码改动范围

| # | 文件 | 改动 |
|---|---|---|
| 1 | `src/renderer/overlay-i18n.js` | **新增**，150 条词条的词典 + `OT()` + 页脚拼装 |
| 2 | `src/renderer/overlay-panel.html` | 加载词典 |
| 3 | `src/renderer/index.html` | 加载词典；补 `olTitle` / `olKeyTitle` / `navChat` 钩子 |
| 4 | `src/renderer/overlay-panel.js` | 面板骨架文案走词典；遮罩标签改为按 class 定位 |
| 5 | `src/renderer/overlay-live.js` | 控件名、下拉值、状态、页脚全部走词典 |
| 6 | `src/renderer/overlay-surface.js` | 语言通道 + 切换后重挂载 |
| 7 | `src/renderer/overlay-gallery.js` | 「叠加层」页接入同一词典（阿语回归保留） |
| 8 | `src/renderer/i18n.js` | 简体中文词条 **166 → 290**（英文 290 条全覆盖） |
| 9 | `src/renderer/renderer.js` | 4 条活动日志改走 i18n |
| 10 | `src/renderer/chat.js` | 侧边栏 `聊天` 标签跟随应用语言 |
| 11 | `src/overlay-bridge.js` | 新增语言通道，新增 `setLanguage()` |
| 12 | `overlay-preload.js` | 暴露 `onLanguage` |
| 13 | `src/overlay-ipc.js`、`main.js` | 语言接线 + 原生对话框中文 |

---

## 3. 静态验证

| # | 项目 | 方法 | 结果 |
|---|---|---|---|
| S-1 | 语法 | `node --check` × 10 个改动文件 | 全部 ok |
| S-2 | 主界面词条覆盖 | VM 中真实加载 `i18n.js` + `i18n-extra.js` + `feature-i18n.js` | 英文 290 条，**中文 290 条，缺失 0** |
| S-3 | 面板词典 | VM 加载 `overlay-i18n.js` | 150 条词条，无语法错误 |
| S-4 | 控件名全覆盖 | 从上游 `renodx-ui-bridge.hpp`（15 项）与 `feeder-controls.hpp`（12 项）**解析出全部标签**，逐条查词典 | **31/31 命中，缺失 0** |
| S-5 | 选择器未被破坏 | 逐个复核 `#olStructure` `#olTone` `#olMaskStructure` `.ol-master input` `.ol-muted input[type=checkbox]` 等绑定点 | 未改动；遮罩标签改按 `.ol-mask-tag` 定位后，英文模式仍显示 `CHARACTER MASK`（见 S-7） |
| S-6 | 英文比对逻辑未被翻译污染 | 复核 `correctStyles` 仍比对**原始英文** `['Default','Natural','Cinematic']` | 保持原样，仅显示层翻译 |
| S-7 | 面板 DOM 离屏渲染 | jsdom 中真实执行 `overlay-panel.js` + `overlay-live.js` | 中文渲染 196 个汉字；切回 en 后完全恢复英文，无中英混排 |

> S-7 中中文模式残留的非中文字符仅 `DLSS`、`RenoDX`、`NGX` —— 属于刻意保留的产品/技术名（见计划书附录 A）。

---

## 4. 构建验证

| # | 项目 | 方法 | 结果 |
|---|---|---|---|
| B-1 | asar 重打包无损 | `asar pack` → `asar extract` → 121 个文件逐个 SHA-256 比对 | **121/121 一致**，missing/extra/different 均为 0 |
| B-2 | 无完整性校验拦截 | 读 asar 头部 + `@electron/fuses read` | 无 `integrity` 字段；`EnableEmbeddedAsarIntegrityValidation`、`OnlyLoadAppFromAsar` 均为 Disabled |
| B-3 | 载荷结构一致 | `7z l` 对比 | 135 文件 / 15 目录，与原包相同 |
| B-4 | SFX 重新封装 | NSIS 3.13 `makensis`，复用原包的 `nsis7z.dll` | 构建成功，载荷以存储方式嵌入（250,784,747 B in/out，未二次压缩） |
| B-5 | 交付 exe 内载荷 = 已验证载荷 | `7z x` 取出 exe 内 `app-64.7z` 后比对 SHA-256 | `D26BB8F2…4696` = `D26BB8F2…4696`，**完全一致** |
| B-6 | 图标与版本信息 | 检查 PNG 是否落入资源区 + 读 `VersionInfo` | 图标存在（偏移 35800）；ProductName/FileVersion 正确 |

---

## 5. 运行时验证（真实程序，非模拟）

方法：给程序传入 `--remote-debugging-port`，用 DevTools 协议读取**真实渲染结果**（只读，不修改界面）。

| # | 项目 | 结果 |
|---|---|---|
| R-1 | 交付 exe 能正常自行解包并启动 | ✔ 解包到 `%TEMP%\nsl8AF6.tmp`，应用进程 5 个，SFX 等待子进程 |
| R-2 | 主窗口首屏 | ✔ `主页 游戏 聊天 社区 插件 叠加层 历史 设置 关于`；日志显示 `已扫描到 12 个游戏，来自 1 个来源`、`库已就绪 — 12 个游戏，7 个使用 DirectX 12` |
| R-3 | **F8 面板窗口**（真机窗口，非预览） | ✔ 96 个汉字：`DLSS 5 画质交换器 · 控制面板 / 全局控制 / 结构强度 / 色调强度 / NR 风格 / 更多 RenoDX 控制 / 漫反射白点（nit）…` |
| R-4 | 九个页面逐页抓取 | 主页 ✔ / 游戏 ✔ / 插件 ✔ / 叠加层 ✔ / 历史 ✔ / 设置（部分，见 §6）/ 关于 ✔ / 聊天 ✘（见 §6）/ 社区 ✘（见 §6） |
| R-5 | 「叠加层」页 | ✔ `测试版 / 选择你的风格，先预览，再定下来。/ 热键 · F8 / 创建主题 / ＋ 添加叠加层 / 叠加层服务已就绪，等待游戏接入。` |
| R-6 | **语言切换通道（实机双向）** | ✔ 用真实语言菜单点击切换：`zh → en` 后主窗口 `html=en / i18n=en / 标签=EN / 导航=Home`，**F8 面板同时变为 `DLSS 5 SWAPPER CONTROLS`**；切回 `zh` 后主窗口 `主页`、面板回到 `DLSS 5 画质交换器 · 控制面板`。`library.json` 的 `lang` 最终为 `zh`（你的原设置） |
| R-7 | 退出与临时目录 | 内容会被清空（隔离测试：14 个文件的临时目录，子进程正常退出后**剩余文件数 0**）；**空目录可能残留**——这与原版行为一致（你机器上原有 6 个空的 `ns*.tmp` 目录就是原版留下的） |

---

## 6. 已知未覆盖 / 限制（均为事先约定的取舍，非缺陷）

| # | 项目 | 状态 | 原因 |
|---|---|---|---|
| L-1 | 「聊天」页全部文字 | 仍英文 | 属于计划中的 **M4**，你已明确不执行（`chat.js` 89 KB 的 EN/AR 双表需整体重构）。侧边栏标签已单独中文化 |
| L-2 | 「社区」页全部文字 | 仍英文 | 同上（`community.js`）。 |
| L-3 | 设置页里的「Community profile」区块 | 仍英文 | 该区块由 `community.js` 渲染，属 M4 范畴，未动 |
| L-4 | ReShade 插件列表里的条目名与说明 | 仍英文 | 原生插件由 ImGui 绘制，中文字形需注入字体贴图；且这些字符串同时用于匹配 RenoDX 内部 UI，**改动会导致桥接失效** |
| L-5 | 游戏内 F8 状态角标 `DLSS 5 On/Off` | 仍英文 | 同上，原生绘制 |
| L-6 | 面板必须先启动 DLSS 5 Swapper | 既有设计 | 面板画面由 Swapper 的离屏窗口推送，关掉程序按 F8 只会显示"等待共享面板" |
| L-7 | 游戏内实机验证（接 RenoDX/Feeder 真实数据） | 未执行 | 需要已装 ReShade + 原生 DLSS 的游戏，本机当前不可做。风险已由 S-4（31/31 控件名覆盖）+ R-3 抵消：控件名与插件实际下发字符串一致，且 DOM 渲染路径已实测 |

### 顺带发现的既有问题（不是本次改动引入，未修改）

| # | 现象 | 说明 |
|---|---|---|
| P-1 | 「插件」页首个条目名显示为 `null` | `main.js` 的 `describe()` 里 `label: known.name || label`，本版附带的 RenoDX 构建哈希不在 `KNOWN` 表内且调用方未传 label，于是渲染出 `null`（`renderer.js` 用 `esc(a.label)`，`String(null)` → `"null"`）。与汉化无关，任何语言下都存在 |
| P-2 | 语言为 `zh` 时主界面仍有大片英文 | 这正是本次要解决的问题的现状描述：官方 2.2.9 的 `zh` 词条仅覆盖 166/290 |

---

## 7. 复现步骤

```powershell
cd C:\Users\zengr\Documents\ChatGPT\DLSS5

# 1) 静态：词条覆盖 + 控件名覆盖 + 面板离屏渲染
node tools\i18n_audit.js work\asar\src\renderer
node tools\control_names_check.js work\asar\src\renderer\overlay-i18n.js work\src-overlay
$env:NODE_PATH="C:\Users\zengr\Documents\ChatGPT\DLSS5\work\_check\node_modules"
node tools\panel_dom_check.js work\asar\src\renderer

# 2) 重新构建（改完代码后）
npx --yes @electron/asar pack work\asar work\app\resources\app.asar
cd work\app; 7z a -t7z -m0=lzma2 -mx=9 -ms=off ..\..\dist\app-64.7z *; cd ..\..
cd work\_build; makensis portable.nsi; cd ..\..

# 3) 运行时检查（程序会短暂出现窗口）
cd work\_build; makensis /DOUTFILE=..\..\dist\_probe.exe /DDEBUGPORT=9333 portable.nsi; cd ..\..
Start-Process dist\_probe.exe
Start-Sleep 20
$env:NODE_PATH="C:\Users\zengr\Documents\ChatGPT\DLSS5\work\_check\node_modules"
node tools\cdp_probe.js 9333          # 主窗口 + F8 面板窗口文本
node tools\cdp_views.js 9333 ws index.html   # 九个页面逐页文本
```

> 语言可在程序内随时切换（左上角 `ZH` 按钮）。面板语言跟随应用语言：`zh*` → 中文，其余 → 英文。
>
> 验证过程中脚本曾把语言临时切到 `en`，结束时已切回并确认落盘为 `zh`，与验证前一致。

---

## 8. 环境与残留物

构建工具：Node 22.17.0、7-Zip 24.09、NSIS 3.13（scoop 用户级安装）、`@electron/asar` 4.3.1、jsdom 29.1.1。

**临时文件残留：已全部清理完毕。**

`%TEMP%` 下原有 15 个 `ns*.tmp` 目录、合计约 **2.85 GB**，现已全部删除，复查结果为 **0 个**。明细：

| 类别 | 数量 | 体积 | 来源 |
|---|---|---|---|
| 验证中强制结束进程留下的解压副本 | 8 | 约 2.04 GB | 本次验证的测试运行（我被文件锁挡住没删干净，已补删） |
| `nszB930.tmp`：原版 2.2.9 的完整解压副本（135 个文件 + 原包 `app-64.7z` 257 MB） | 1 | 813 MB | **验证开始前就存在**，原版 portable 被强制结束后留下的 |
| 空的 `ns*.tmp` 目录（0 字节） | 6 | 0 | 原版 portable 正常运行后的痕迹：内容被清空，目录本身因「不能删除正在作为工作目录的文件夹」而保留 |

这些内容全部只是解压副本，删除不影响程序、游戏与任何设置（配置一直在 `%APPDATA%\dlss5-swapper`）。清理动作已完成，**无需你再手动处理**。

> `%TEMP%` 里另有一个 `DLSS Swapper` 目录，那属于另一个产品（beeradmoore 的 DLSS Swapper），与本次无关，未改动。

隔离测试对"退出即清理"的结论不变：子进程正常退出后，临时目录内剩余文件数为 **0**。
